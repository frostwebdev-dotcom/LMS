"use client";

import type { ReactNode } from "react";
import { useState, useId } from "react";

export interface AccordionItemProps {
  /** Section heading shown in the trigger. */
  title: string;
  /** Content shown when expanded. */
  children: ReactNode;
  /** Whether the section is expanded on first render. Default true. */
  defaultExpanded?: boolean;
  /** Optional id for the panel (for aria-controls). Auto-generated if not provided. */
  id?: string;
  /** Optional class for the item wrapper. */
  className?: string;
}

export function AccordionItem({
  title,
  children,
  defaultExpanded = true,
  id: idProp,
  className = "",
}: AccordionItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const generatedId = useId();
  const id = idProp ?? `accordion-${generatedId.replace(/:/g, "")}`;
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;

  return (
    <div
      className={`rounded-xl border border-primary-200 bg-white overflow-hidden ${className}`}
      data-accordion-item
    >
      <h3>
        <button
          type="button"
          id={triggerId}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-semibold text-primary-900 hover:bg-primary-50/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset sm:px-5 transition-colors"
        >
          <span className="truncate">{title}</span>
          <span
            className="shrink-0 text-primary-600 transition-transform duration-200"
            aria-hidden
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!expanded}
        className={expanded ? "" : "hidden"}
      >
        <div className="border-t border-primary-100 px-4 py-3 sm:px-5 sm:py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface AccordionProps {
  children: ReactNode;
  /** Optional class for the accordion wrapper. */
  className?: string;
}

/**
 * Container for accordion sections. Use with AccordionItem children.
 * Preserves order; each item manages its own expand/collapse state.
 */
export function Accordion({ children, className = "" }: AccordionProps) {
  return (
    <div className={`space-y-2 sm:space-y-3 ${className}`} role="list">
      {children}
    </div>
  );
}
