"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  question: string;
  answer: React.ReactNode;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-none border border-line bg-surface-raised">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-muted sm:px-6 sm:py-5"
              >
                <span className="font-display text-base font-semibold text-content sm:text-lg">
                  {item.question}
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-5 shrink-0 text-content-subtle transition-transform duration-300",
                    isOpen && "rotate-180 text-brand-600",
                  )}
                />
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              hidden={!isOpen}
              className="px-5 pb-5 sm:px-6 sm:pb-6"
            >
              <div className="text-sm leading-relaxed text-content-muted sm:text-base">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
