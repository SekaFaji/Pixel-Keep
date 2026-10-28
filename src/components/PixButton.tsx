import React from "react";

export function PixButton({
  children,
  color,
  onClick,
  disabled,
  small,
}: {
  children: React.ReactNode;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        "border-4 border-black font-bold tracking-wide text-black " +
        (small ? "px-3 py-2 text-[10px] " : "px-5 py-3 text-xs ") +
        "shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_1px_0_#000] transition-all disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0"
      }
      style={{ background: color, touchAction: "manipulation" }}
    >
      {children}
    </button>
  );
}
