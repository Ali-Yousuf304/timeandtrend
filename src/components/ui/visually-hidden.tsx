import * as React from "react";

/**
 * Wraps content so it is announced to screen readers but visually hidden.
 * Useful for satisfying Radix's required Title/Description on dialogs
 * when the visible UI doesn't include a literal title.
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </span>
  );
}
