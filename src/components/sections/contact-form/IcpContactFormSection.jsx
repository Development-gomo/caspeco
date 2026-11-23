// src/components/sections/contact-form/IcpContactFormSection.jsx
// ACF layout contact_form_section as designed for the ICP pages, shared by IcpBuilder and the
// Products pages. Two Figma designs share this layout:
//  - contact_person "enable" → "Let's talk bigger picture" with the selected team member
//    (Figma 324:7454, ContactRep + ContactRepForm sending to the selected CF7 form)
//  - otherwise → the "Quick contact" block (eyebrow, heading, text and the form card)
// A HubSpot form pasted on the page (Shortcode) wins over everything else.
//
// Server component. IcpBuilder passes `people` / `privacyHref` / `globalQuickForm` from its
// prefetch; when they are left out (Products pages) they are fetched here the same way.
// Spacing (withSpacing) is applied by the caller.

import dynamic from "next/dynamic";
import { DEFAULT_LANG, langHref } from "@/config";
import { getKontaktByIds, getMediaByIds, getThemeOptions } from "@/lib/api";
import { hasText } from "@/lib/content";
import { parseHubspotEmbed } from "@/lib/hubspot";
import { firstPostId, toPerson } from "@/lib/kontakt";
import { postStrings, repFormStrings } from "@/lib/postStrings";

const ContactRep = dynamic(() => import("../icp/ContactRep"));
const QuickContact = dynamic(() => import("./QuickContact"));
const HubspotEmbed = dynamic(() => import("../../ui/HubspotEmbed"));

const postId = (p) => (p && typeof p === "object" ? p.ID || p.id : p);
// "Contact Person Section" button group (enable / disable, default disable)
const withContactPerson = (b) => b?.contact_person === "enable";

// Theme options → privacy link for the contact-person form consent (Footer > privacy links) and
// the language's global HubSpot "Get a call" form (Footer > Form Shortcode)
export function contactFormOptions(options, lang = DEFAULT_LANG) {
  const privacy = (options?.privacy_links?.privacy_links || []).find((l) => /privacy|integritet|personvern|privacidad|vie priv/i.test(l?.title || "") && l.link && l.link !== "#");
  return {
    privacyHref: privacy ? langHref(privacy.link, lang) : "",
    globalQuickForm: parseHubspotEmbed(options?.form_shortcode) ? options.form_shortcode : "",
  };
}

// kontakt posts → Map(id → { name, role, tag, photo })
export const peopleById = (members) => new Map((members || []).map((m) => [m.id, toPerson(m)]));

// Only plain data goes to the client components: select_form (a WP_Post object on Products)
// becomes its ID, and the team member post / builder bookkeeping keys are dropped.
function clientBlock(block) {
  const { team_member, acf_fc_layout, _layout, _prev, _next, select_form, ...rest } = block || {};
  return { ...rest, select_form: postId(select_form) };
}

// Figma 324:7454 "Contact form" copy (labels / placeholders); the rep's first name is filled in.
// The CF7 form picked in "Select Form" must use these field names: full_name, company,
// contact_method (call | email), email, phone, message, consent, newsletter
function repFormData(block, rep, privacyHref, lang) {
  const first = (rep?.name || "").split(" ")[0] || "us";
  const t = repFormStrings(lang);
  const fill = (str) => str.replace("{first}", first);
  const privacy = privacyHref ? `<a href="${privacyHref}">${t.privacy}</a>` : t.privacy;
  return {
    ...block,
    form_provider: "cf7",
    form_shortcode: String(postId(block.select_form) || ""),
    name_label: t.name,
    name_placeholder: "Anna Lindqvist",
    company_label: t.company,
    company_placeholder: "Bistro Norr",
    method_label: fill(t.method),
    email_label: t.email,
    email_placeholder: "anna@bistronorr.se",
    phone_label: t.phone,
    phone_placeholder: "+46 70 123 45 67",
    message_label: t.message,
    message_placeholder: t.messagePh,
    consent_text: `${t.consent} ${privacy}`,
    consent_field_name: "consent",
    newsletter_text: t.newsletter,
    newsletter_field_name: "newsletter",
    cta_text: rep?.name ? fill(t.sendTo) : block.cta_text || postStrings(lang).send,
  };
}

export default async function IcpContactFormSection({ block: raw, lang = DEFAULT_LANG, people, privacyHref, globalQuickForm }) {
  if (!raw) return null;
  const enabled = withContactPerson(raw);
  // HubSpot form pasted on the page (Shortcode) wins over everything else
  const hubspot = parseHubspotEmbed(raw.shortcode) ? raw.shortcode : "";

  // Products pages: nothing prefetched → resolve the team member, theme options and a media-ID
  // background here (IcpBuilder resolves all of these before rendering). Only what the
  // rendered branch uses is fetched.
  const memberId = enabled ? firstPostId(raw.team_member) : null;
  const needsPeople = Boolean(enabled && !people && memberId);
  const needsOptions = enabled ? privacyHref === undefined : !hubspot && globalQuickForm === undefined;
  const mediaId = typeof raw.bg_image === "number" || /^\d+$/.test(String(raw.bg_image || "")) ? Number(raw.bg_image) : null;
  const [members, options, media] = await Promise.all([
    needsPeople ? getKontaktByIds([memberId], lang) : null,
    needsOptions ? getThemeOptions(lang).catch(() => null) : null,
    mediaId ? getMediaByIds([mediaId]) : null,
  ]);
  const peopleMap = needsPeople ? peopleById(members) : people;
  const opts = needsOptions ? contactFormOptions(options, lang) : {};
  const privacy = privacyHref === undefined ? opts.privacyHref : privacyHref;
  const globalForm = globalQuickForm === undefined ? opts.globalQuickForm : globalQuickForm;
  const m = media?.find((x) => x.id === mediaId);
  // nothing configured (no text, no form, no team member) -> render nothing
  const hasOwnText = hasText(raw.eyebrow) || hasText(raw.heading) || hasText(raw.short_text);
  const hasForm = Boolean(postId(raw.select_form) || hubspot || (!enabled && globalForm));
  if (!hasOwnText && !hasForm && !memberId) return null;
  const block = clientBlock(m ? { ...raw, bg_image: { url: m.source_url, alt: m.alt_text || "" } } : raw);

  if (!enabled) {
    // page HubSpot code → the language's global "Get a call" HubSpot form → the page's CF7 form
    const quickForm = hubspot || globalForm;
    return (
      <QuickContact
        lang={lang}
        variant="icp"
        data={{
          ...block,
          sub_heading: block.eyebrow,
          short_description: block.short_text,
          background_colour: block.bg_color,
          form_shortcode: quickForm ? "" : String(postId(block.select_form) || ""),
        }}
        form={quickForm ? <HubspotEmbed code={quickForm} /> : undefined}
      />
    );
  }

  const rep = peopleMap?.get(memberId);
  // Figma form (ContactRepForm) sending to the selected CF7 form; a pasted HubSpot form replaces it
  return (
    <ContactRep
      data={repFormData(block, rep, privacy, lang)}
      lang={lang}
      rep={rep ? { name: rep.name, role: rep.role, photo: rep.photo?.url } : undefined}
      form={hubspot ? <HubspotEmbed code={hubspot} variant="rep" /> : undefined}
    />
  );
}
