import React from "react";
import PixButton from "./PixButton";

/* one uniform card per upgrade: icon + name + description on the left,
   the price and the BUY button stacked on the RIGHT side of the card.
   every card is the same width and min-height, no matter how long the text is.
   text always wraps INSIDE its own box — it can never overflow the card. */
export function UpgradeCard({
  icon,
  name,
  desc,
  cost,
  disabled,
  done,
  locked,
  action,
  onClick,
}: {
  icon: string;
  name: string;
  desc: string;
  cost: string;
  disabled?: boolean;
  done?: string;
  locked?: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="w-full border-2 border-black flex items-stretch"
      style={{ background: "#202642", minHeight: 96 }}
    >
      <div className="flex-1 min-w-0 overflow-hidden px-2 pt-1.5 pb-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-sm leading-4 shrink-0">{icon}</span>
          <span className="text-[9px] text-white leading-4 flex-1 min-w-0 break-words">
            {name}
          </span>
        </div>
        <div className="pt-1 text-[8px] text-white/55 leading-4 break-words">{desc}</div>
      </div>
      <div
        className="border-l-2 border-black px-2 py-1.5 flex flex-col items-center justify-center gap-1 shrink-0"
        style={{ background: "#1a1f33", minWidth: 84, maxWidth: 104 }}
      >
        {locked ? (
          <span className="text-[9px] text-[#ffd76e] text-center leading-4 break-words py-1">
            🔒 {locked}
          </span>
        ) : done ? (
          <span className="text-[9px] text-[#4caf50] text-center leading-4 break-words py-1">
            ✓ {done}
          </span>
        ) : (
          <>
            {cost !== "" && (
              <span className="text-[8px] text-[#ffd76e] leading-3 text-center break-words">
                {cost}
              </span>
            )}
            <PixButton small color={disabled ? "#555c73" : "#4caf50"} onClick={onClick} disabled={disabled}>
              {action || "BUY"}
            </PixButton>
          </>
        )}
      </div>
    </div>
  );
}
