// Page-type class wrapper (home, page, article, casestudy, product, industry, icp, partner, partner-category).
// It replaces the <body> class the root layout used to set from a request header: a request header would make every
// page dynamic, while a wrapper keeps pages static / cached. `display: contents` means it adds no box, so layout and
// child selectors are unaffected; the descendant rules in globals.css (.home …, .partner …) still match.

export default function PageType({ type = "page", children }) {
  return <div className={`${type} contents`}>{children}</div>;
}
