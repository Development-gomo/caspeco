// src/components/ui/glass.js
// Figma "glass" card used by the ICP System check card and the testimonial cards:
// radial gradient centred on the top-left corner (gradientTransform → radius ≈ 141% of the
// card), stops #010202 0% / #FFFFFF@50% 49% / #0B2331 100% at 40% fill opacity, drop shadow
// 0 5.33 16 #000@16%, plus Figma's Glass effect (approximated with a backdrop blur — CSS has
// no refraction). The element using it must not sit inside an opacity/filter/clip-path
// ancestor, or the backdrop blur sees nothing.
export const GLASS_STYLE = {
  background:
    "radial-gradient(141.4% 141.4% at 0% 0%, rgba(1, 2, 2, 0.4) 0%, rgba(255, 255, 255, 0.2) 49%, rgba(11, 35, 49, 0.4) 100%)",
  boxShadow: "0px 5.333px 16px 0px rgba(0, 0, 0, 0.16)",
};
export const GLASS_CLASS = "backdrop-blur-[20px]";
