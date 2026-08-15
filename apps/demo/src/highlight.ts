const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const wrap = (kind: string, value: string) =>
  `<span class="token-${kind}">${escapeHtml(value)}</span>`;

const keywords = new Set([
  "import",
  "from",
  "const",
  "let",
  "return",
  "if",
  "else",
]);

const renderHtmlMarkup = (source: string) =>
  escapeHtml(source)
    .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="token-keyword">$2</span>')
    .replace(
      /([\w-]+)(=)(&quot;[^&quot;]*&quot;)/g,
      '<span class="token-identifier">$1</span><span class="token-operator">$2</span><span class="token-string">$3</span>',
    );

const renderHtml = (source: string) =>
  source
    .split(/(<!--[\s\S]*?-->)/g)
    .map((part) =>
      part.startsWith("<!--") && part.endsWith("-->")
        ? wrap("comment", part)
        : renderHtmlMarkup(part),
    )
    .join("");

const renderShell = (source: string) =>
  source
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) {
        return escapeHtml(part);
      }
      if (["npm", "pnpm", "yarn"].includes(part)) {
        return wrap("keyword", part);
      }
      return wrap("identifier", part);
    })
    .join("");

const renderTypeScriptCode = (source: string) => {
  const parts = source.split(/(\s+|[=;,().{}])/g).filter(Boolean);
  return parts
    .map((part) => {
      if (/^\s+$/.test(part)) {
        return escapeHtml(part);
      }
      if (part.startsWith('"') || part.startsWith("'")) {
        return wrap("string", part);
      }
      if (keywords.has(part)) {
        return wrap("keyword", part);
      }
      if (/^[=;,().{}]$/.test(part)) {
        return wrap("punctuation", part);
      }
      return wrap("identifier", part);
    })
    .join("");
};

const renderTypeScript = (source: string) =>
  source
    .split(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g)
    .map((part) =>
      part.startsWith("//") || part.startsWith("/*")
        ? wrap("comment", part)
        : renderTypeScriptCode(part),
    )
    .join("");

export function renderHighlightedCode(source: string, language = "typescript") {
  if (language === "html") {
    return renderHtml(source);
  }
  if (language === "shell") {
    return renderShell(source);
  }

  return renderTypeScript(source);
}
