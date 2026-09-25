"use client";

import { DEFAULT_LANG } from "@/config";
import { useEffect, useMemo, useState } from "react";
import {
  getCf7FormSchema,
  submitCf7Direct,
  submitCf7FormProxy,
} from "@/lib/api";

// Field styling matches the Figma "phone-contact-form" card:
// bold dark-grey label, rounded-xl input with a light border, grey placeholder.
const LABEL_CLASSES = "text-[16px] font-bold tracking-[-0.32px] text-(--color-grey-dark)";
const INPUT_CLASSES =
  "w-full rounded-[12px] border p-4 text-[16px] text-(--color-grey-dark) outline-none " +
  "placeholder:text-(--color-grey-medium-dark) bg-white";

function Field({ field, value, setValue, error }) {
  const label = field.label || field.key;
  const borderClass = error ? "border-red-500" : "border-[#e2e8f0] focus:border-(--color-grey-medium-dark)";

  if (field.type === "textarea") {
    return (
      <div className="space-y-2 w-full">
        <label className={LABEL_CLASSES}>
          {label} {field.required ? "*" : ""}
        </label>
        <textarea
          className={`${INPUT_CLASSES} ${borderClass} min-h-[140px]`}
          value={value || ""}
          placeholder={field.placeholder || ""}
          onChange={(e) => setValue(field.key, e.target.value)}
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-2 w-full">
        <label className={LABEL_CLASSES}>
          {label} {field.required ? "*" : ""}
        </label>
        <select
          className={`${INPUT_CLASSES} ${borderClass}`}
          value={value || ""}
          onChange={(e) => setValue(field.key, e.target.value)}
        >
          <option value="">{field.placeholder || "Select"}</option>
          {(field.options || []).map((opt, idx) => (
            <option key={idx} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  // CF7 "acceptance" field — a consent checkbox, e.g. GDPR/privacy agreement
  if (field.type === "acceptance") {
    return (
      <div className="w-full">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => setValue(field.key, e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded-[3px] border-[1.2px] border-(--color-grey-dark) accent-(--color-yellow)"
          />
          <span
            className="text-[14px] text-(--color-grey-medium-dark) [&_a]:underline [&_a]:cursor-pointer"
            dangerouslySetInnerHTML={{ __html: field.label || field.raw || "" }}
          />
        </label>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  // default input: text/email/tel/url
  const type = ["email", "tel", "url"].includes(field.type)
    ? field.type
    : "text";

  return (
    <div className="space-y-2 w-full">
      <label className={LABEL_CLASSES}>
        {label} {field.required ? "*" : ""}
      </label>
      <input
        className={`${INPUT_CLASSES} ${borderClass}`}
        type={type}
        value={value || ""}
        placeholder={field.placeholder || ""}
        onChange={(e) => setValue(field.key, e.target.value)}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default function ContactForm({ formId = 982, lang = DEFAULT_LANG, submitLabel = "Send Message" }) {
  const [schema, setSchema] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({
    loading: true,
    submitting: false,
    ok: false,
    msg: "",
  });

  const fields = useMemo(() => schema?.fields || [], [schema]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setState({ loading: true, submitting: false, ok: false, msg: "" });
        const data = await getCf7FormSchema(formId, lang);
        if (!alive) return;

        setSchema(data);

        const initial = {};
        (data.fields || []).forEach((f) => (initial[f.key] = f.type === "acceptance" ? false : ""));
        setValues(initial);

        setState({ loading: false, submitting: false, ok: false, msg: "" });
      } catch (e) {
        setState({
          loading: false,
          submitting: false,
          ok: false,
          msg: "Failed to load form.",
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId, lang]);

  function setValue(key, val) {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  }

  function validate() {
    const next = {};
    for (const f of fields) {
      if (!f.required) continue;
      if (f.type === "acceptance") {
        if (!values[f.key]) next[f.key] = "This field is required";
        continue;
      }
      const v = (values[f.key] || "").toString().trim();
      if (!v) next[f.key] = "This field is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setState((s) => ({ ...s, submitting: true, ok: false, msg: "" }));

    if (!validate()) {
      setState((s) => ({
        ...s,
        submitting: false,
        ok: false,
        msg: "Please fill required fields.",
      }));
      return;
    }

    // Transform payload to match backend expectations
    const transformedValues = Object.keys(values).reduce((acc, key) => {
      const v = values[key];
      acc[key] = typeof v === "boolean" ? (v ? "1" : "") : v?.toString().trim();
      return acc;
    }, {});

    try {
      let res;
      try {
        // Primary: direct CF7 submit
        res = await submitCf7Direct(
          formId,
          schema?.hidden || {},
          transformedValues,
        );
      } catch (directErr) {
        const directStatus = directErr?.cf7?.status;
        const directMessage = (directErr?.message || "").toLowerCase();
        const isNetworkError =
          directErr?.name === "TypeError" ||
          directMessage.includes("failed to fetch") ||
          directMessage.includes("networkerror");

        if (directStatus || !isNetworkError) {
          throw directErr;
        }

        // Fallback: proxy submit (only if direct failed due to network/CORS)
        res = await submitCf7FormProxy(formId, {
          lang,
          values: transformedValues,
        });
      }

      const okMessage =
        res?.message ||
        res?.cf7?.message ||
        schema?.settings?.successMessage ||
        "Sent!";

      setState({
        loading: false,
        submitting: false,
        ok: true,
        msg: okMessage,
      });

      // Reset form values
      const reset = {};
      fields.forEach((f) => (reset[f.key] = f.type === "acceptance" ? false : ""));
      setValues(reset);
    } catch (err) {
      // If CF7 validation errors come back, map them
      const cf7 = err?.cf7;
      if (
        cf7?.status === "validation_failed" &&
        Array.isArray(cf7?.invalid_fields)
      ) {
        const next = {};
        cf7.invalid_fields.forEach((f) => {
          if (f?.field) next[f.field] = f?.message || "Invalid";
        });
        setErrors(next);
      }

      setState({
        loading: false,
        submitting: false,
        ok: false,
        msg: err?.message || err?.error || "Failed to send. Please try again.",
      });
    }
  }

  if (state.loading)
    return (
      <div className="flex items-center gap-3 py-10 text-sm text-gray-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-brand)]" />
        Loading form…
      </div>
    );

  // CF7 places the acceptance checkbox with the other fields, but the
  // design shows it below the submit button — split it out to match.
  const regularFields = fields.filter((f) => f.type !== "acceptance");
  const acceptanceFields = fields.filter((f) => f.type === "acceptance");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {regularFields.map((f) => (
          <Field
            key={f.key}
            field={f}
            value={values[f.key]}
            setValue={setValue}
            error={errors[f.key]}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full cursor-pointer select-none
                    rounded-[100px] bg-(--color-yellow) px-6 py-[14px]
                    text-[18px] font-bold text-(--color-grey-dark)
                    transition-colors duration-300 hover:bg-(--color-yellow)/90
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
      >
        {state.submitting ? "Sending…" : submitLabel}
      </button>

      {acceptanceFields.map((f) => (
        <Field
          key={f.key}
          field={f}
          value={values[f.key]}
          setValue={setValue}
          error={errors[f.key]}
        />
      ))}

      {state.msg ? (
        <p
          className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}
        >
          {state.msg}
        </p>
      ) : null}
    </form>
  );
}
