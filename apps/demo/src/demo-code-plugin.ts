import type { Plugin } from "vite";
import { renderHighlightedCode } from "./highlight";

export function demoCodePlugin(snippets: Record<string, string>): Plugin {
  return {
    name: "demo-code-plugin",
    transformIndexHtml(html) {
      return html.replace(
        /<code([^>]*data-code="([^"]+)"[^>]*)><\/code>/g,
        (_match, attrs: string, key: string) => {
          const source = snippets[key];
          const language =
            attrs.match(/data-language="([^"]+)"/)?.[1] ?? "typescript";
          return source
            ? `<code${attrs}>${renderHighlightedCode(source, language)}</code>`
            : `<code${attrs}></code>`;
        },
      );
    },
  };
}
