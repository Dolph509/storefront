import sanitizeHtml from "sanitize-html";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "em", "s", "u", "code", "pre", "blockquote",
    "ul", "ol", "li", "a", "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
};

/** Sanitize the HTML emitted by the dashboard rich text editor before rendering it. */
export function sanitizeThemeRichText(value: string): string {
  return sanitizeHtml(value, OPTIONS);
}
