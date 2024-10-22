import DOMPurify from "dompurify";
import katex from "katex";

export const formatText = (text: string): string => {
  console.log("Formatting text:", text);

  const latexSections: Record<string, string> = {};
  let sectionIndex = 0;

  const latexRegex =
    /([A-Za-z0-9]+(?:\s*[\+\-\*\/\^]\s*[A-Za-z0-9]+)+|\\(?:frac|sqrt|sum|int|lim|sin|cos|tan|log|exp|pi|theta|alpha|beta|gamma|delta|epsilon|lambda|mu|nu|rho|sigma|tau|phi|chi|psi|omega)[^<>\s]*)/g;
  text = text.replace(latexRegex, (match: string) => {
    const key = `__LATEX_${sectionIndex++}__`;
    latexSections[key] = match;
    return key;
  });

  text = text.replace(
    /```([\s\S]*?)```/g,
    (_, code: string) =>
      `<div class="code-block"><pre><code>${DOMPurify.sanitize(code)}</code></pre></div>`,
  );

  text = text.replace(
    /`([^`]+)`/g,
    (_, code: string) => `<code>${DOMPurify.sanitize(code)}</code>`,
  );

  text = text.replace(/\n/g, "<br>");

  text = text.replace(/^\s+/gm, (match) => "&nbsp;".repeat(match.length));

  text = text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Bold
    .replace(/\*(.*?)\*/g, "<i>$1</i>") // Italic
    .replace(/~(.*?)~/g, "<u>$1</u>") // Underline
    .replace(/~~(.*?)~~/g, "<s>$1</s>"); // Strikethrough

  text = text.replace(/__LATEX_(\d+)__/g, (_, index: string) => {
    const latexKey = `__LATEX_${index}__`;
    const latexMatch = latexSections[latexKey] ?? "";
    try {
      return katex.renderToString(latexMatch, { throwOnError: false });
    } catch {
      return latexMatch;
    }
  });

  console.log("Formatted text:", text);
  return text;
};
