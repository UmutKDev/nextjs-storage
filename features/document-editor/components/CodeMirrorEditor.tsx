"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import { EditorState, type Extension } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  bracketMatching,
  foldGutter,
  indentOnInput,
} from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { oneDark } from "@codemirror/theme-one-dark";
import { getLanguageExtension } from "../utils/language";

interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  extension?: string;
  readOnly?: boolean;
  className?: string;
  onCursorChange?: (line: number, col: number) => void;
}

export default function CodeMirrorEditor({
  value,
  onChange,
  extension = "",
  readOnly = false,
  className,
  onCursorChange,
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);
  const [langExt, setLangExt] = useState<Extension | null>(null);
  const langLoadedForRef = useRef("");

  onChangeRef.current = onChange;
  onCursorChangeRef.current = onCursorChange;

  // Load language extension
  useEffect(() => {
    if (langLoadedForRef.current === extension) return;
    langLoadedForRef.current = extension;
    let cancelled = false;
    getLanguageExtension(extension).then((ext) => {
      if (!cancelled) setLangExt(ext);
    });
    return () => {
      cancelled = true;
    };
  }, [extension]);

  // Create / recreate editor
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current?.(update.state.doc.toString());
      }
      if (update.selectionSet) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        onCursorChangeRef.current?.(line.number, pos - line.from + 1);
      }
    });

    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      foldGutter(),
      indentOnInput(),
      bracketMatching(),
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      oneDark,
      updateListener,
      EditorView.lineWrapping,
    ];

    if (langExt) extensions.push(langExt);
    if (readOnly) extensions.push(EditorState.readOnly.of(true));

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langExt, readOnly]);

  // Sync value from parent (only when externally changed)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto [&_.cm-editor]:h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:overflow-auto ${className ?? ""}`}
    />
  );
}
