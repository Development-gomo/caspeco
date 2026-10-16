// src/components/ui/SliderArrows.jsx
// Figma "Arrow navigation slider": two 51px round arrows, 32px apart.
// Yellow when the step is possible, grey when it isn't (first / last slide).

import Image from "next/image";
import ArrowActive from "../../../public/icons/product/slider-arrow-active.svg";
import ArrowDisabled from "../../../public/icons/product/slider-arrow-disabled.svg";

function Arrow({ direction, disabled, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="shrink-0 cursor-pointer rounded-full transition-transform duration-300 enabled:hover:scale-105 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-yellow)"
    >
      <Image
        src={disabled ? ArrowDisabled : ArrowActive}
        alt=""
        width={51.2}
        height={51.2}
        className={direction === "prev" ? "rotate-180" : ""}
      />
    </button>
  );
}

// loop: arrows never disable; onChange may receive -1 or `count` (the caller wraps / slides)
export default function SliderArrows({ index, count, onChange, loop = false, className = "" }) {
  if (count < 2) return null;
  return (
    <div className={`flex items-center gap-8 ${className}`}>
      <Arrow direction="prev" label="Previous" disabled={!loop && index === 0} onClick={() => onChange(index - 1)} />
      <Arrow direction="next" label="Next" disabled={!loop && index === count - 1} onClick={() => onChange(index + 1)} />
    </div>
  );
}
