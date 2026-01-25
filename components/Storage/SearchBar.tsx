"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search files and folders",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [val, setVal] = React.useState(value ?? "");

  // local debounce
  React.useEffect(() => {
    setVal(value ?? "");
  }, [value]);

  React.useEffect(() => {
    const t = setTimeout(() => onChange(val.trim()), 260);
    return () => clearTimeout(t);
  }, [val, onChange]);

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Search size={16} />
        </div>
        <Input
          className="pl-10 h-10"
          placeholder={placeholder}
          name="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      </div>

      {val ? (
        <button
          onClick={() => setVal("")}
          className="rounded-md border px-2 py-1 text-sm text-muted-foreground hover:bg-muted/10"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
