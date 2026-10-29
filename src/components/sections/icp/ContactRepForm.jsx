// src/components/sections/icp/ContactRepForm.jsx
// The form card of contact_rep_section (Figma "Contact form"). Labels and placeholders
// come from ACF; values go to form_provider via lib/forms.js. Field names sent to the
// provider (CF7 / HubSpot must use the same names):
//   full_name, company, contact_method ("call" | "email"), email, phone, message,
//   plus consent_field_name / newsletter_field_name when set in ACF.
// Phone is required when "Call me" is picked, email when "Email me" is picked.

"use client";

import { useState } from "react";
import { DEFAULT_LANG } from "@/config";
import { submitForm } from "@/lib/forms";

// Figma "Contact form" (324:7364): label Bold 16/20 #3F3E3C, 8 above a 53px input (padding 16,
// radius 12, 1px #E2E8F0, white), placeholder Regular 16 #8F8D88
const LABEL = "text-[16px] font-bold leading-5 tracking-[-0.32px] text-(--color-grey-dark)";
const INPUT =
  "w-full rounded-[12px] border bg-white p-4 text-[16px] leading-[19px] text-(--color-grey-dark) outline-none transition-colors placeholder:text-[#8F8D88]";
// Figma checkbox: 16px, radius 3, white with a 1.2px #3F3E3C border (tick drawn when checked)
const CHECKBOX =
  "mt-px size-4 max-md:size-[18px] shrink-0 cursor-pointer appearance-none rounded-[3px] border-[1.2px] border-(--color-grey-dark) bg-white bg-center bg-no-repeat checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.5l2.5 2.5L12 5.5' fill='none' stroke='%233F3E3C' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")] focus-visible:outline-2 focus-visible:outline-(--color-yellow)";
const EMPTY = { full_name: "", company: "", contact_method: "call", email: "", phone: "", message: "" };

export default function ContactRepForm({ data, lang = DEFAULT_LANG }) {
  const t = (key, fallback) => data?.[key] || fallback;
  const [values, setValues] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ submitting: false, ok: false, msg: "" });
  const requiredMsg = t("required_message", "This field is required");

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!values.full_name.trim()) next.full_name = requiredMsg;
    if (values.contact_method === "call" && !values.phone.trim()) next.phone = requiredMsg;
    if (values.contact_method === "email" && !values.email.trim()) next.email = requiredMsg;
    if (data?.consent_text && !consent) next.consent = requiredMsg;
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v).trim()]));
    if (data?.consent_field_name) payload[data.consent_field_name] = consent ? "1" : "";
    if (data?.newsletter_field_name) payload[data.newsletter_field_name] = newsletter ? "1" : "";

    setState({ submitting: true, ok: false, msg: "" });
    try {
      await submitForm(data?.form_provider, payload, { ...data, lang });
      setState({ submitting: false, ok: true, msg: t("success_message", "Thank you! We will contact you shortly.") });
      setValues(EMPTY);
      setConsent(false);
      setNewsletter(false);
    } catch (err) {
      setErrors(err?.fieldErrors || {});
      setState({ submitting: false, ok: false, msg: err?.message || "Failed to send. Please try again." });
    }
  }

  const field = (name, label, placeholder, type = "text", autoComplete) => (
    <div className="flex w-full flex-col gap-2 max-md:gap-1">
      <label htmlFor={`cr-${name}`} className={LABEL}>
        {label}
      </label>
      <input
        id={`cr-${name}`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={values[name]}
        placeholder={placeholder}
        aria-invalid={!!errors[name]}
        onChange={(e) => set(name, e.target.value)}
        className={`${INPUT} ${errors[name] ? "border-red-500" : "border-[#e2e8f0] focus:border-(--color-grey-medium-dark)"}`}
      />
      {errors[name] && <p className="text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  const methods = [
    ["call", t("call_label", "Call me")],
    ["email", t("email_option_label", "Email me")],
  ];

  return (
    // Figma mobile (final 601:14461): card padding 16, everything 16 apart; name + restaurant side by side
    // (8 apart), labels 4 above their input, textarea 54 tall, consent label Regular 13
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10 max-md:gap-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-md:grid-cols-2 max-md:items-end max-md:gap-2">
          {field("full_name", t("name_label", "Full name"), t("name_placeholder", ""), "text", "name")}
          {field("company", t("company_label", "Restaurant or company"), t("company_placeholder", ""), "text", "organization")}
        </div>

        <fieldset className="flex flex-col gap-2 max-md:gap-1">
          <legend className={`${LABEL} mb-2 max-md:mb-0`}>{t("method_label", "How should we reach you?")}</legend>
          {/* Segmented toggle (Figma "Contact method"): #F1F1F1 track (padding 4, radius 12), white
              42px pill (radius 8, shadow 0 2 3 #000@9%) marks the choice; labels Bold 16/20 */}
          <div className="grid grid-cols-2 rounded-[12px] bg-[#F1F1F1] p-1">
            {methods.map(([value, label]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-[8px] py-[11px] text-center text-[16px] font-bold leading-5 tracking-[-0.32px] text-(--color-grey-dark) transition-[background-color,box-shadow] duration-200 has-focus-visible:outline-2 has-focus-visible:outline-(--color-yellow) ${
                  values.contact_method === value ? "bg-white shadow-[0px_2px_3px_rgba(0,0,0,0.09)]" : ""
                }`}
              >
                <input type="radio" name="contact_method" value={value} checked={values.contact_method === value} onChange={() => set("contact_method", value)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-md:grid-cols-1">
          {field("email", t("email_label", "Email"), t("email_placeholder", ""), "email", "email")}
          {field("phone", t("phone_label", "Phone"), t("phone_placeholder", ""), "tel", "tel")}
        </div>

        <div className="flex w-full flex-col gap-2 max-md:gap-1">
          <label htmlFor="cr-message" className={LABEL}>
            {t("message_label", "Anything we should know? (optional)")}
          </label>
          <textarea
            id="cr-message"
            name="message"
            value={values.message}
            placeholder={t("message_placeholder", "")}
            onChange={(e) => set("message", e.target.value)}
            className={`${INPUT} min-h-[97px] max-md:h-[54px] max-md:min-h-0 border-[#e2e8f0] focus:border-(--color-grey-medium-dark)`}
          />
        </div>
      </div>

      {(data?.consent_text || data?.newsletter_text) && (
        <div className="flex flex-col gap-3 max-md:gap-4">
          {data?.consent_text && (
            <div>
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setErrors((er) => ({ ...er, consent: "" }));
                  }}
                  className={CHECKBOX}
                />
                {/* Figma: Regular 14 #8F8D88, gap 10; the privacy link Medium, underlined, #0B2533 */}
                <span className="text-[14px] leading-[17px] max-md:leading-[19px] text-[#8F8D88] [&_a]:font-medium [&_a]:text-(--color-dark-petrol) [&_a]:underline [&_p]:m-0" dangerouslySetInnerHTML={{ __html: data.consent_text }} />
              </label>
              {errors.consent && <p className="text-xs text-red-600">{errors.consent}</p>}
            </div>
          )}
          {data?.newsletter_text && (
            <label className="flex cursor-pointer items-start gap-2.5">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className={CHECKBOX} />
              <span className="text-[14px] leading-[17px] text-[#8F8D88] max-md:text-[13px] max-md:leading-4 max-md:text-(--color-grey-dark)">{data.newsletter_text}</span>
            </label>
          )}
        </div>
      )}

      <div className="flex flex-col items-start gap-3">
        <button
          type="submit"
          disabled={state.submitting}
          className="cursor-pointer select-none rounded-full bg-(--color-yellow) px-[38px] py-4 max-md:h-12 max-md:w-full max-md:py-0 text-[18px] font-bold leading-[22px] text-(--color-grey-dark) transition-colors duration-600 ease-out hover:bg-(--color-gold) hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.submitting ? t("sending_text", "Sending…") : t("cta_text", "Send")}
        </button>
        {state.msg && (
          <p role="status" className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>
            {state.msg}
          </p>
        )}
      </div>
    </form>
  );
}
