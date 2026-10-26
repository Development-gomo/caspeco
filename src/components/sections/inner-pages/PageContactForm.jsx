// src/components/sections/inner-pages/PageContactForm.jsx
// Page Builder layout: contact_form_section (Contact us, Kontakt, Careers …).
// No own Figma frame — the Figma "Let's talk" contact-person layout (ContactRep, node 324:7454)
// in its light tone: sub heading as the italic eyebrow, heading, text and the Section Image in
// the photo frame on the left; the form card on the right; plain light background.
// Form: the HubSpot embed pasted in Form Shortcode, else the first CF7 form in Select Form.

import ContactRep from "../icp/ContactRep";
import ContactForm from "../contact-form/ContactForm";
import HubspotEmbed from "@/components/ui/HubspotEmbed";
import { DEFAULT_LANG } from "@/config";
import { parseHubspotEmbed } from "@/lib/hubspot";
import { mediaUrl } from "@/lib/content";

const firstId = (v) => {
  const x = Array.isArray(v) ? v[0] : v;
  return x && typeof x === "object" ? x.ID || x.id : x;
};

export default function PageContactForm({ data, lang = DEFAULT_LANG }) {
  if (!data?.heading) return null;
  const hubspot = parseHubspotEmbed(data.form_shortcode) ? data.form_shortcode : "";
  const cf7 = !hubspot && firstId(data.select_form);
  const form = hubspot ? (
    <HubspotEmbed code={hubspot} variant="rep" />
  ) : cf7 ? (
    <ContactForm formId={cf7} lang={lang} submitLabel={data.cta_text || "Send"} />
  ) : null;
  const photo = mediaUrl(data.section_image);

  return (
    <ContactRep
      data={{ ...data, eyebrow: data.sub_heading }}
      lang={lang}
      rep={photo ? { photo, alt: data.section_image?.alt || "" } : undefined}
      form={form || undefined}
      tone="light"
    />
  );
}
