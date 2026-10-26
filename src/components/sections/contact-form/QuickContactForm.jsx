// src/components/sections/contact-form/QuickContactForm.jsx
// Figma "phone-contact-form" built from ACF: fields (form_fields repeater),
// submit label, consent checkbox and success message are all editable, and
// form_provider decides where the values are sent (see src/lib/forms.js).

"use client";

import { useState } from "react";
import { LABEL_CLASSES, INPUT_CLASSES } from "./ContactForm";
import { DEFAULT_LANG } from "@/config";
import { submitForm } from "@/lib/forms";
import { rows } from "@/lib/content";

const INPUT_TYPES = ["tel", "email", "text"];
const CONSENT_KEY = "__consent";

export default function QuickContactForm({ data, lang = DEFAULT_LANG }) {
  const fields = rows(data?.form_fields).filter((f) => f.name);
  const consentText = data?.consent_text;
  const empty = () => Object.fromEntries(fields.map((f) => [f.name, ""]));

  const [values, setValues] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ submitting: false, ok: false, msg: "" });

  if (fields.length === 0) return null;

  const requiredMsg = data?.required_message || "This field is required";

  function setValue(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    fields.forEach((f) => f.required && !String(values[f.name] || "").trim() && (next[f.name] = requiredMsg));
    if (consentText && data?.consent_required && !consent) next[CONSENT_KEY] = requiredMsg;
    setErrors(next);
    if (Object.keys(next).length) return;

    setState({ submitting: true, ok: false, msg: "" });
    const payload = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v).trim()]));
    if (consentText && data?.consent_field_name) payload[data.consent_field_name] = consent ? "1" : "";
    try {
      await submitForm(data?.form_provider, payload, { ...data, lang });
      setState({ submitting: false, ok: true, msg: data?.success_message || "Thank you! We will contact you shortly." });
      setValues(empty());
      setConsent(false);
    } catch (err) {
      setErrors(err?.fieldErrors || {});
      setState({ submitting: false, ok: false, msg: err?.message || "Failed to send. Please try again." });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {fields.map((f) => {
          const id = `qc-${f.name}`;
          const error = errors[f.name];
          const border = error ? "border-red-500" : "border-[#e2e8f0] focus:border-(--color-grey-medium-dark)";
          const common = {
            id,
            name: f.name,
            value: values[f.name] || "",
            placeholder: f.placeholder || "",
            required: !!f.required,
            "aria-invalid": !!error,
            onChange: (e) => setValue(f.name, e.target.value),
            className: `${INPUT_CLASSES} ${border}`,
          };
          return (
            <div key={f.name} className="flex w-full flex-col gap-2">
              <label htmlFor={id} className={LABEL_CLASSES}>
                {f.label} {f.required ? "*" : ""}
              </label>
              {f.type === "textarea" ? (
                <textarea {...common} className={`${common.className} min-h-[140px]`} />
              ) : (
                <input {...common} type={INPUT_TYPES.includes(f.type) ? f.type : "text"} autoComplete={f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined} />
              )}
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full cursor-pointer select-none rounded-[100px] bg-(--color-yellow) px-6 py-4 text-[18px] font-bold leading-[22px] text-(--color-grey-dark) transition-colors duration-400 ease-out hover:bg-(--color-gold) hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state.submitting ? data?.sending_text || "Sending…" : data?.cta_text || "Get a call"}
      </button>

      {consentText && (
        <div>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setErrors((er) => ({ ...er, [CONSENT_KEY]: "" }));
              }}
              className="mt-0.5 size-4 shrink-0 rounded-[3px] border-[1.2px] border-(--color-grey-dark) accent-(--color-yellow)"
            />
            <span
              className="text-[14px] text-(--color-grey-medium-dark) [&_a]:underline [&_p]:m-0"
              dangerouslySetInnerHTML={{ __html: consentText }}
            />
          </label>
          {errors[CONSENT_KEY] && <p className="text-xs text-red-600">{errors[CONSENT_KEY]}</p>}
        </div>
      )}

      {state.msg && (
        <p role="status" className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>
          {state.msg}
        </p>
      )}
    </form>
  );
}
