// src/components/sections/case-study/VideoCta.jsx
// Yellow CTA button that opens the shared VideoModal popup (YouTube / Vimeo / uploaded file).

"use client";

import React from "react";
import CtaButton from "@/components/ui/CtaButton";
import VideoModal from "@/components/ui/VideoModal";

export default function VideoCta({ url, children }) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  return (
    <>
      <CtaButton onClick={() => setOpen(true)}>{children}</CtaButton>
      <VideoModal open={open} url={url} title={typeof children === "string" ? children : ""} onClose={close} />
    </>
  );
}
