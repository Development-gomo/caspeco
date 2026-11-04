// src/components/sections/case-study/VideoCta.jsx
// Yellow CTA button that opens the shared VideoModal popup (YouTube / Vimeo / uploaded file).
// Optional mobileVariant (e.g. "outline-dark-grey"): below 768px a ghost button of that variant replaces the
// yellow one (the yellow is max-md:hidden, the ghost md:hidden); desktop/tablet unchanged. Omitted = no change.

"use client";

import React from "react";
import CtaButton from "@/components/ui/CtaButton";
import VideoModal from "@/components/ui/VideoModal";

export default function VideoCta({ url, children, mobileVariant }) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  return (
    <>
      <CtaButton onClick={() => setOpen(true)} className={mobileVariant ? "max-md:hidden" : ""}>
        {children}
      </CtaButton>
      {mobileVariant && (
        <CtaButton variant={mobileVariant} onClick={() => setOpen(true)} className="md:hidden">
          {children}
        </CtaButton>
      )}
      <VideoModal open={open} url={url} title={typeof children === "string" ? children : ""} onClose={close} />
    </>
  );
}
