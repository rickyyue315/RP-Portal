"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ComboboxItem {
  value: string;
  label: string;
}

interface SearchComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: ComboboxItem) => void;
  results: ComboboxItem[];
  placeholder?: string;
}

export function SearchCombobox({
  label,
  value,
  onChange,
  onSelect,
  results,
  placeholder,
}: SearchComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="max-h-48 overflow-auto p-1">
            {results.map((item) => (
              <button
                key={item.value}
                type="button"
                className={cn(
                  "flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
