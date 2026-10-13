// src/lib/forms.js
// Provider-agnostic form submission for ACF-built forms (quick_contact_section).
// The form UI and its fields come from ACF; `form_provider` picks where values go.
// To support another service (Pipedrive, Mailchimp, a webhook …): add an adapter
// below and the same key to the "Form provider" select in
// scripts/acf-product-builder.mjs.
//
// Each adapter receives (values, settings) — values is { [field name]: string } —
// and resolves on success or throws { message, fieldErrors? }.

import { getCf7FormSchema, submitCf7Direct } from "@/lib/api";

// CF7 form reference from a raw shortcode ([contact-form-7 id="982" title="..."]) or a bare ID
export function cf7FormId(shortcode) {
  const value = String(shortcode || "").trim();
  return /^\d+$/.test(value) ? value : value.match(/id=["']?(\w+)["']?/)?.[1];
}

const ADAPTERS = {
  // Contact Form 7: ACF field names must equal the CF7 field names (e.g. your-phone)
  async cf7(values, { form_shortcode, lang }) {
    const formId = cf7FormId(form_shortcode);
    if (!formId) throw { message: "Form is not connected yet." };
    const schema = await getCf7FormSchema(formId, lang).catch(() => null);
    try {
      return await submitCf7Direct(formId, schema?.hidden || {}, values);
    } catch (err) {
      const fieldErrors = {};
      (err?.cf7?.invalid_fields || []).forEach((f) => f?.field && (fieldErrors[f.field] = f.message || "Invalid"));
      throw { message: err?.message || "Failed to send. Please try again.", fieldErrors };
    }
  },

  // HubSpot Forms API v3 (public, no API key): ACF field names must equal the
  // HubSpot property names (e.g. phone, company)
  async hubspot(values, { hubspot_portal_id, hubspot_form_id }) {
    if (!hubspot_portal_id || !hubspot_form_id) throw { message: "Form is not connected yet." };
    const hutk = typeof document !== "undefined" ? document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/)?.[1] : undefined;
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(hubspot_portal_id)}/${encodeURIComponent(hubspot_form_id)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: Object.entries(values).map(([name, value]) => ({ name, value })),
          context: { pageUri: window.location.href, pageName: document.title, ...(hutk ? { hutk } : {}) },
        }),
      },
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw { message: json?.errors?.[0]?.message || json?.message || "Failed to send. Please try again." };
    return json;
  },

  // Placeholder until the client's form service is chosen — never pretends to send
  async none() {
    throw { message: "Form is not connected yet." };
  },
};

export function submitForm(provider, values, settings = {}) {
  const adapter = ADAPTERS[provider] || ADAPTERS.none;
  return adapter(values, settings);
}
