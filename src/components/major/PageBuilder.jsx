//src/components/major/PageBuilder.jsx

import { rows, withNeighbours } from "@/lib/content";
import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import { getCaseStudies, getAllPosts, getAllTeam, getPostsByIds, getAllIndustries, getTwinCaseStudies, getMediaByIds, getLogoGalleries, getPostsPage } from "@/lib/api";
import { mapTwinCases, twinMediaIds } from "@/lib/caseStudies";

const Hero = dynamic(() => import("../sections/home/HomeHero"));
const AboutUs = dynamic(() => import("../sections/home/HomeAbout"));
const HomeCounter = dynamic(() => import("../sections/home/HomeCounter"));
const HomeCaseStudies = dynamic(() => import("../sections/home/HomeCaseStudies"));
const AskAI = dynamic(() => import("../sections/home/HomeAIAsk"));
const HomePartners = dynamic(() => import("../sections/home/HomePartners"));
const InnerHero = dynamic(() => import("../sections/inner-pages/InnerHero"));
const Overview = dynamic(() => import("../sections/inner-pages/Overview"));
const TeamSection = dynamic(() => import("../sections/inner-pages/Teams"));
const LargeContent = dynamic(() => import("../sections/inner-pages/LargeContent"));
const PageContactForm = dynamic(() => import("../sections/inner-pages/PageContactForm"));
const CaseStudyListing = dynamic(() => import("../sections/inner-pages/CaseStusyListing"));
const NewsListing = dynamic(() => import("../sections/inner-pages/NewsListing"));
const HomeColumnSection = dynamic(() => import("../sections/home/HomeColumnSection"));

// 2026 homepage sections (Figma "Home_Page_Updated_29th_September")
const HomeIntroVideo = dynamic(() => import("../sections/home/HomeIntroVideo"));
const HomeKpi = dynamic(() => import("../sections/home/HomeKpi"));
const HomeRestaurantMap = dynamic(() => import("../sections/home/HomeRestaurantMap"));
const HomeHelpTabs = dynamic(() => import("../sections/home/HomeHelpTabs"));
const HomeDataInsight = dynamic(() => import("../sections/home/HomeDataInsight"));
const HomeCasperAI = dynamic(() => import("../sections/home/HomeCasperAI"));
const HomeBusinessTwin = dynamic(() => import("../sections/home/HomeBusinessTwin"));
const HomeProductCards = dynamic(() => import("../sections/home/HomeProductCards"));
const HomeIndustrySlider = dynamic(() => import("../sections/home/HomeIndustrySlider"));
const HomeIntegrations = dynamic(() => import("../sections/home/HomeIntegrations"));
const HomeInsights = dynamic(() => import("../sections/home/HomeInsights"));
const HomeFaq = dynamic(() => import("../sections/home/HomeFaq"));

// Product / industry sections, also available on normal pages (ICP pages reuse them)
const ProductUspAccordion = dynamic(() => import("../sections/product/ProductUspAccordion"));
const ProductSalesChannels = dynamic(() => import("../sections/product/ProductSalesChannels"));
const ProductResults = dynamic(() => import("../sections/product/ProductResults"));
const TestimonialSlider = dynamic(() => import("../sections/TestimonialSlider"));
const ProductFeatureSlider = dynamic(() => import("../sections/product/ProductFeatureSlider"));
const ProductDemo = dynamic(() => import("../sections/product/ProductDemo"));
const IndustryChallenges = dynamic(() => import("../sections/industry/IndustryChallenges"));
const IndustryResults = dynamic(() => import("../sections/industry/IndustryResults"));
const QuickContact = dynamic(() => import("../sections/contact-form/QuickContact"));

// ICP pages (Figma "Opening_soon", "Levelling_up", "Adding_Locations", "Operating_at_scale")
const IcpIntro = dynamic(() => import("../sections/icp/IcpIntro"));
const SystemCheck = dynamic(() => import("../sections/icp/SystemCheck"));
const SwitchSteps = dynamic(() => import("../sections/icp/SwitchSteps"));
const PeopleCards = dynamic(() => import("../sections/icp/PeopleCards"));
const StageCards = dynamic(() => import("../sections/icp/StageCards"));
const ContactRep = dynamic(() => import("../sections/icp/ContactRep"));

// Detect which data the page needs and fetch it all in parallel (server-side)
async function prefetchSectionData(sections, lang) {
  if (!sections) return {};

  const needs = { cases: false, posts: false, team: false, industries: false, twin: false, logos: false, newsPage: false };
  const pickedPostIds = [];

  for (const block of sections) {
    if (block._layout === "casestudies_section") needs.cases = true;
    if (block._layout === "case_study_listing") needs.cases = true;
    if (block._layout === "news_section") needs.posts = true;
    if (block._layout === "news_listing") needs.newsPage = true;
    if (block._layout === "team_section") needs.team = true;
    if (block._layout === "industry_slider_section") needs.industries = true;
    if (block._layout === "home_casestudy_section") needs.twin = true;
    if (block._layout === "testimonial_slider_section") needs.twin = true; // slides = case studies
    // testimonial carousel → latest case studies
    if (block._layout === "industry_testimonials_section") needs.twin = true;
    if (block._layout === "home_partners_section" || block._layout === "integrations_section") needs.logos = true;
    if (block._layout === "insights_section") {
      const ids = Array.isArray(block.posts) ? block.posts.map((p) => (typeof p === "object" ? p.ID || p.id : p)) : [];
      if (ids.length) pickedPostIds.push(...ids);
      else needs.posts = true;
    }
  }

  const [cases, posts, team, pickedPosts, industries, twinPosts, logos, newsPage] = await Promise.all([
    needs.cases ? getCaseStudies(lang) : null,
    needs.posts ? getAllPosts(lang) : null,
    needs.team ? getAllTeam(lang) : null,
    pickedPostIds.length ? getPostsByIds(pickedPostIds, lang) : null,
    needs.industries ? getAllIndustries(lang) : null,
    needs.twin ? getTwinCaseStudies(lang) : null,
    needs.logos ? getLogoGalleries(lang) : null,
    needs.newsPage ? getPostsPage(lang, 1) : null, // NewsListing: first 9 + totals
  ]);

  // Business Twin: resolve logo/clip media IDs, then reduce to small objects for the client
  const twinCases = twinPosts ? mapTwinCases(twinPosts, await getMediaByIds(twinMediaIds(twinPosts))) : null;

  // Case study listing cards: acf.logo is a media ID → swap in {url, alt}
  if (Array.isArray(cases)) {
    const logoIds = [...new Set(cases.map((c) => Number(c?.acf?.logo)).filter(Boolean))];
    if (logoIds.length) {
      const byId = new Map((await getMediaByIds(logoIds)).map((m) => [m.id, { url: m.source_url, alt: m.alt_text || "" }]));
      for (const c of cases) {
        const logo = byId.get(Number(c?.acf?.logo));
        if (logo) c.acf.logo = logo;
      }
    }
  }

  return { cases, posts, team, pickedPosts, industries, twinCases, logos, newsPage };
}

export default async function PageBuilder({ sections: rawSections, lang = DEFAULT_LANG }) {
  const sections = withNeighbours(rawSections); // _prev/_next per block (Figma section-gap rule)
  if (!sections) return null;

  const prefetched = await prefetchSectionData(sections, lang);

  return (
    <>
      {sections.map((block, i) => {
        switch (block._layout) {
          case "home_hero":
            return <Hero key={i} data={block} lang={lang} />;

          case "about_us_section":
            return <AboutUs key={i} data={block} lang={lang} />;


          case "counter_section":
            return <HomeCounter key={i} data={block} lang={lang} />;

          case "casestudies_section":
            return <HomeCaseStudies key={i} data={block} lang={lang} prefetchedCases={prefetched.cases} />;
          
          case "case_study_listing":
            return <CaseStudyListing key={i} data={block} lang={lang} prefetchedCases={prefetched.cases} />;
          case "home_ask_ai_section":
            return <AskAI key={i} data={block} lang={lang} />;  

          case "home_partners_section":
            return <HomePartners key={i} data={block} lang={lang} logos={prefetched.logos?.partners} />;

          case "hero_section":
            return <InnerHero key={i} data={block} lang={lang} />;

          case "overview_section":
            return <Overview key={i} data={block} lang={lang} />;

          case "team_section":
            return <TeamSection key={i} data={block} lang={lang} prefetchedTeam={prefetched.team} />;

          case "large_content_section":
            return <LargeContent key={i} data={block} lang={lang} />;

          case "home_column_section":
            return <HomeColumnSection key={i} data={block} lang={lang} />;

          // Contact us / Kontakt / Careers: Figma "Let's talk" card style, HubSpot or CF7 form
          case "contact_form_section":
            return <PageContactForm key={i} data={block} lang={lang} />;

          // Heading or rolling words, text, CTA and an image left/right — the Figma ICP intro design
          case "content_section":
            return (
              <IcpIntro
                key={i}
                lang={lang}
                data={{ ...block, rolling_headings: (Array.isArray(block.rolling_words) ? block.rolling_words : []).map((r) => ({ text: r?.short_text })) }}
              />
            );

          case "intro_video_section":
            return <HomeIntroVideo key={i} data={block} lang={lang} />;

          case "home_kpi_section":
            return <HomeKpi key={i} data={block} lang={lang} />;

          case "home_restaurant_map_section":
            return <HomeRestaurantMap key={i} data={block} lang={lang} />;

          case "home_tab_section":
            // ACF "ICP Tab styling" = enable: the ICP tab design (Figma ICP "Time to build your perfect set up");
            // its tabs take one image, so the Home tab gallery contributes its first image
            if (block.icp_tab_styling === "enable") {
              const icpTabs = rows(block.tabs).map((t) => ({ ...t, image: Array.isArray(t.images) ? t.images[0] : t.images }));
              return <ProductSalesChannels key={i} data={{ ...block, tabs: icpTabs }} lang={lang} defaultCtaVariant="outline" variant="icp" mobilePanel />;
            }
            return <HomeHelpTabs key={i} data={block} lang={lang} />;

          case "data_insight_section":
            return <HomeDataInsight key={i} data={block} lang={lang} />;

          case "home_ai_section":
            return <HomeCasperAI key={i} data={block} lang={lang} />;

          case "home_casestudy_section":
            return <HomeBusinessTwin key={i} data={block} lang={lang} cases={prefetched.twinCases} />;

          case "product_cards_section":
            return <HomeProductCards key={i} data={block} lang={lang} />;

          case "industry_slider_section":
            return <HomeIndustrySlider key={i} data={block} lang={lang} prefetchedIndustries={prefetched.industries} />;

          case "integrations_section":
            return <HomeIntegrations key={i} data={block} lang={lang} logos={prefetched.logos?.integrations} />;

          case "insights_section":
            return <HomeInsights key={i} data={block} lang={lang} prefetchedPosts={prefetched.pickedPosts || prefetched.posts} />;

          case "news_listing":
            return <NewsListing key={i} data={block} lang={lang} initial={prefetched.newsPage} />;

          // ─── Product / industry sections ───
          case "usp_accordion_section":
            return <ProductUspAccordion key={i} data={block} lang={lang} />;

          case "sales_channels_section":
            return <ProductSalesChannels key={i} data={block} lang={lang} />;

          case "results_section":
            return <ProductResults key={i} data={block} lang={lang} />;

          case "testimonial_slider_section":
            return <TestimonialSlider key={i} data={block} lang={lang} cases={prefetched.twinCases || []} defaultType="fullwidth" />;

          case "feature_slider_section":
            return <ProductFeatureSlider key={i} data={block} lang={lang} />;

          case "product_demo_section":
            return <ProductDemo key={i} data={block} lang={lang} />;

          case "industry_challenges_section":
            return <IndustryChallenges key={i} data={block} lang={lang} />;

          case "industry_results_section":
            return <IndustryResults key={i} data={block} lang={lang} />;

          case "industry_testimonials_section":
            return <TestimonialSlider key={i} data={block} lang={lang} cases={prefetched.twinCases || []} defaultType="card" />;

          case "quick_contact_section":
            return <QuickContact key={i} data={block} lang={lang} />;

          // ─── ICP pages ───
          case "icp_intro_section":
            return <IcpIntro key={i} data={block} lang={lang} />;

          case "system_check_section":
            return <SystemCheck key={i} data={block} lang={lang} />;

          case "switch_steps_section":
            return <SwitchSteps key={i} data={block} lang={lang} />;

          case "people_section":
            return <PeopleCards key={i} data={block} lang={lang} />;

          case "stage_cards_section":
            return <StageCards key={i} data={block} lang={lang} />;

          case "contact_rep_section":
            return <ContactRep key={i} data={block} lang={lang} />;

          case "faq_section":
            return <HomeFaq key={i} data={block} lang={lang} prevLayout={block._prev} />;

          default:
            return null;
        }
      })}
    </>
  );
}