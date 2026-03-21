/**
 * Set of file extensions the document editor supports.
 * When a file has one of these extensions, clicking it opens the editor
 * instead of the generic file preview.
 */
export const SUPPORTED_DOCUMENT_EXTENSIONS = new Set([
  "txt",
  "md",
  "js",
  "jsx",
  "ts",
  "tsx",
  "py",
  "css",
  "scss",
  "html",
  "json",
  "xml",
  "yaml",
  "yml",
  "env",
  "sql",
  "sh",
  "bash",
  "csv",
  "log",
  "ini",
  "cfg",
  "conf",
]);

export function isSupportedDocumentExtension(ext: string): boolean {
  return SUPPORTED_DOCUMENT_EXTENSIONS.has(ext.toLowerCase());
}
