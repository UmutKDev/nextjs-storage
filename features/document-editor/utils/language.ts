import type { LanguageSupport } from "@codemirror/language";

type LanguageLoader = () => Promise<LanguageSupport>;

const languageLoaders: Record<string, LanguageLoader> = {
  js: () =>
    import("@codemirror/lang-javascript").then((m) =>
      m.javascript({ jsx: false, typescript: false }),
    ),
  jsx: () =>
    import("@codemirror/lang-javascript").then((m) =>
      m.javascript({ jsx: true, typescript: false }),
    ),
  ts: () =>
    import("@codemirror/lang-javascript").then((m) =>
      m.javascript({ jsx: false, typescript: true }),
    ),
  tsx: () =>
    import("@codemirror/lang-javascript").then((m) =>
      m.javascript({ jsx: true, typescript: true }),
    ),
  py: () => import("@codemirror/lang-python").then((m) => m.python()),
  html: () => import("@codemirror/lang-html").then((m) => m.html()),
  css: () => import("@codemirror/lang-css").then((m) => m.css()),
  scss: () => import("@codemirror/lang-css").then((m) => m.css()),
  json: () => import("@codemirror/lang-json").then((m) => m.json()),
  xml: () => import("@codemirror/lang-xml").then((m) => m.xml()),
  yaml: () => import("@codemirror/lang-yaml").then((m) => m.yaml()),
  yml: () => import("@codemirror/lang-yaml").then((m) => m.yaml()),
  sql: () => import("@codemirror/lang-sql").then((m) => m.sql()),
  md: () => import("@codemirror/lang-markdown").then((m) => m.markdown()),
};

export async function getLanguageExtension(
  ext: string,
): Promise<LanguageSupport | null> {
  const loader = languageLoaders[ext.toLowerCase()];
  if (!loader) return null;
  return loader();
}
