"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CloudObjectModel } from "@/Service/Generates/api";

function useInView<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, inView } as const;
}

export default function LazyPreview({ file }: { file: CloudObjectModel }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [loading, setLoading] = React.useState(false);
  const [text, setText] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const url = file?.Path?.Url ?? file?.Path?.Key ?? undefined;
  const mime = (file?.MimeType ?? "").toLowerCase();

  React.useEffect(() => {
    setText(null);
    setError(null);
    // fetch text previews lazily when in view
    if (!inView) return;
    if (!url) return;

    if (
      mime.startsWith("text") ||
      mime.includes("json") ||
      mime.includes("xml")
    ) {
      setLoading(true);
      fetch(url)
        .then((r) => r.text())
        .then((t) => setText(t))
        .catch(() => setError("Unable to load preview"))
        .finally(() => setLoading(false));
    }
  }, [inView, url, mime]);

  // image lazy loader state
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  const isImage =
    mime.startsWith("image") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
      (file.Extension || "").toLowerCase()
    );

  const isVideo = mime.startsWith("video");
  const isAudio = mime.startsWith("audio");
  const isPdf =
    mime.includes("pdf") || (file.Extension || "").toLowerCase() === "pdf";

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence>
        {/* show placeholder / spinner until content is in view and loaded */}
        {!inView ? (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="p-8 flex items-center justify-center text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" />{" "}
              <span>Preparing preview…</span>
            </div>
          </motion.div>
        ) : isImage ? (
          <div className="flex items-center justify-center p-6">
            {!imgLoaded && !imgError && (
              <div className="flex items-center justify-center w-full h-[200px] bg-muted/10 rounded-md">
                <Loader2 className="animate-spin" />
              </div>
            )}

            <motion.img
              src={url}
              alt={file.Name}
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{
                opacity: imgLoaded ? 1 : 0,
                scale: imgLoaded ? 1 : 0.995,
              }}
              transition={{ duration: 0.25 }}
              className={`max-h-[60vh] max-w-full rounded-md object-contain ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              loading="lazy"
            />

            {imgError && (
              <div className="p-6 text-sm text-muted-foreground">
                Unable to load image preview
              </div>
            )}
          </div>
        ) : isVideo ? (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="p-6"
          >
            <video
              controls
              className="w-full max-h-[70vh] rounded-md bg-black"
              preload="metadata"
            >
              {/* only include source when inView to avoid early download */}
              {inView && <source src={url} type={file.MimeType} />}
              Your browser does not support the video tag.
            </video>
          </motion.div>
        ) : isAudio ? (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="p-6"
          >
            <audio controls className="w-full" preload="metadata">
              {inView && <source src={url} type={file.MimeType} />}
            </audio>
          </motion.div>
        ) : isPdf ? (
          <motion.div
            key="pdf"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="p-6"
          >
            {/* load iframe lazily */}
            {inView ? (
              <iframe
                src={url}
                title={file.Name}
                className="w-full min-h-[70vh] rounded-md"
              />
            ) : (
              <div className="p-8 text-sm text-muted-foreground">
                Preparing PDF preview…
              </div>
            )}
          </motion.div>
        ) : (
          // text / fallback
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="p-4 max-h-[60vh] overflow-auto bg-muted/5 rounded-md border border-muted/20"
          >
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading preview…
              </div>
            ) : error ? (
              <div className="p-6 text-sm text-muted-foreground">{error}</div>
            ) : text ? (
              <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                {text}
              </pre>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                No preview available
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
