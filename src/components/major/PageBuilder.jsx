//src/components/major/PageBuilder.jsx

import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import { getAllServices, getCaseStudies, getAllPosts, getAllTeam, getPostsByIds, getAllIndustries, getTwinCaseStudies, getMediaByIds } from "@/lib/api";
import { mapTwinCases, twinMediaIds } from "@/lib/caseStudies";

const Hero = dynamic(() => import("../sections/home/HomeHero"));
const AboutUs = dynamic(() => import("../sections/home/HomeAbout"));
const ServicesSlider = dynamic(() => import("../sections/home/HomeServices"));
const HomeCounter = dynamic(() => import("../sections/home/HomeCounter"));
const HomeCaseStudies = dynamic(() => import("../sections/home/HomeCaseStudies"));
const HomeNews = dynamic(() => import("../sections/home/HomeNews"));
const AskAI = dynamic(() => import("../sections/home/HomeAIAsk"));
const HomePartners = dynamic(() => import("../sections/home/HomePartners"));
const InnerHero = dynamic(() => import("../sections/inner-pages/InnerHero"));
const Overview = dynamic(() => import("../sections/inner-pages/Overview"));
const CollaborationSection = dynamic(() => import("../sections/inner-pages/CollaborationSection"));
const TeamSection = dynamic(() => import("../sections/inner-pages/Teams"));
const CoreValueSection = dynamic(() => import("../sections/inner-pages/CoreValue"));
const LargeContent = dynamic(() => import("../sections/inner-pages/LargeContent"));
const Connectform = dynamic(() => import("../sections/inner-pages/Cform"));
const CaseStudyListing = dynamic(() => import("../sections/inner-pages/CaseStusyListing"));
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

// Detect which data the page needs and fetch it all in parallel (server-side)
async function prefetchSectionData(sections, lang) {
  if (!sections) return {};

  const needs = { services: false, cases: false, posts: false, team: false, industries: false, twin: false };
  const pickedPostIds = [];

  for (const block of sections) {
    if (block.acf_fc_layout === "services_section") needs.services = true;
    if (block.acf_fc_layout === "casestudies_section") needs.cases = true;
    if (block.acf_fc_layout === "case_study_listing") needs.cases = true;
    if (block.acf_fc_layout === "news_section") needs.posts = true;
    if (block.acf_fc_layout === "team_section") needs.team = true;
    if (block.acf_fc_layout === "industry_slider_section") needs.industries = true;
    if (block.acf_fc_layout === "home_casestudy_section") needs.twin = true;
    if (block.acf_fc_layout === "insights_section") {
      const ids = Array.isArray(block.posts) ? block.posts.map((p) => (typeof p === "object" ? p.ID || p.id : p)) : [];
      if (ids.length) pickedPostIds.push(...ids);
      else needs.posts = true;
    }
  }

  const [services, cases, posts, team, pickedPosts, industries, twinPosts] = await Promise.all([
    needs.services ? getAllServices(lang) : null,
    needs.cases ? getCaseStudies(lang) : null,
    needs.posts ? getAllPosts(lang) : null,
    needs.team ? getAllTeam(lang) : null,
    pickedPostIds.length ? getPostsByIds(pickedPostIds, lang) : null,
    needs.industries ? getAllIndustries(lang) : null,
    needs.twin ? getTwinCaseStudies(lang) : null,
  ]);

  // Business Twin: resolve logo/clip media IDs, then reduce to small objects for the client
  const twinCases = twinPosts ? mapTwinCases(twinPosts, await getMediaByIds(twinMediaIds(twinPosts))) : null;

  return { services, cases, posts, team, pickedPosts, industries, twinCases };
}

export default async function PageBuilder({ sections, lang = DEFAULT_LANG }) {
  if (!sections) return null;

  const prefetched = await prefetchSectionData(sections, lang);

  return (
    <>
      {sections.map((block, i) => {
        switch (block.acf_fc_layout) {
          case "home_hero":
            return <Hero key={i} data={block} lang={lang} />;

          case "about_us_section":
            return <AboutUs key={i} data={block} lang={lang} />;

          case "services_section":
            return <ServicesSlider key={i} data={block} lang={lang} prefetchedServices={prefetched.services} />;

          case "counter_section":
            return <HomeCounter key={i} data={block} lang={lang} />;

          case "casestudies_section":
            return <HomeCaseStudies key={i} data={block} lang={lang} prefetchedCases={prefetched.cases} />;
          
          case "case_study_listing":
            return <CaseStudyListing key={i} data={block} lang={lang} prefetchedCases={prefetched.cases} />;

          case "news_section":
            return <HomeNews key={i} data={block} lang={lang} prefetchedPosts={prefetched.posts} />;

          case "home_ask_ai_section":
            return <AskAI key={i} data={block} lang={lang} />;  

          case "home_partners_section":
            return <HomePartners key={i} data={block} lang={lang} />;

          case "hero_section":
            return <InnerHero key={i} data={block} lang={lang} />;

          case "overview_section":
            return <Overview key={i} data={block} lang={lang} />;

          case "caspecooration_section":
            return <CollaborationSection key={i} data={block} lang={lang} />;

          case "team_section":
            return <TeamSection key={i} data={block} lang={lang} prefetchedTeam={prefetched.team} />;

          case "core_value_section":
            return <CoreValueSection key={i} data={block} lang={lang} />;

          case "large_content_section":
            return <LargeContent key={i} data={block} lang={lang} />;

          case "home_column_section":
            return <HomeColumnSection key={i} data={block} lang={lang} />;

          case "contact_form_section":
            return <Connectform key={i} data={block} lang={lang} />;

          case "intro_video_section":
            return <HomeIntroVideo key={i} data={block} lang={lang} />;

          case "home_kpi_section":
            return <HomeKpi key={i} data={block} lang={lang} />;

          case "home_restaurant_map_section":
            return <HomeRestaurantMap key={i} data={block} lang={lang} />;

          case "home_tab_section":
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
            return <HomeIntegrations key={i} data={block} lang={lang} />;

          case "insights_section":
            return <HomeInsights key={i} data={block} lang={lang} prefetchedPosts={prefetched.pickedPosts || prefetched.posts} />;

          case "faq_section":
            return <HomeFaq key={i} data={block} lang={lang} />;

          default:
            return null;
        }
      })}
    </>
  );
}