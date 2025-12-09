/* eslint-disable jsx-a11y/alt-text */
"use client";

import { File, Image, Archive, FileText } from "lucide-react";

export default function FileIcon({ extension }: { extension?: string }) {
  const ext = (extension || "").toLowerCase();

  if (!ext) return <File className="text-muted-foreground" />;

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return <Image className="text-muted-foreground" />;
  if (["zip", "tar", "gz", "rar"].includes(ext))
    return <Archive className="text-muted-foreground" />;
  if (["md", "txt", "csv", "json"].includes(ext))
    return <FileText className="text-muted-foreground" />;

  return <File className="text-muted-foreground" />;
}
