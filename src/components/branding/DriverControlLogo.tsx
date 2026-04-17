import * as React from "react";
import DriverControlIcon from "./DriverControlIcon";

type Props = {
  iconSize?: number;
  className?: string;
  stacked?: boolean;
};

export default function DriverControlLogo({
  iconSize = 72,
  className = "",
  stacked = false,
}: Props) {
  if (stacked) {
    return (
      <div className={`inline-flex flex-col items-start gap-4 ${className}`}>
        <DriverControlIcon size={iconSize} />
        <div
          style={{
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
          }}
        >
          <div style={{ color: "#F8FAFC", fontSize: 52, fontWeight: 600, fontStyle: "normal" }}>
            Driver
          </div>
          <div style={{ color: "#F8FAFC", fontSize: 52, fontWeight: 600, fontStyle: "normal" }}>
            Control{" "}
            <span
              style={{
                color: "#FACC15",
                fontSize: 42,
                fontWeight: 400,
                fontStyle: "normal",
              }}
            >
              Pro
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-5 ${className}`}>
      <DriverControlIcon size={iconSize} />
      <div
        style={{
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          lineHeight: 0.92,
          letterSpacing: "-0.04em",
        }}
      >
        <div style={{ color: "#F8FAFC", fontSize: 52, fontWeight: 600, fontStyle: "normal" }}>
          Driver
        </div>
        <div style={{ color: "#F8FAFC", fontSize: 52, fontWeight: 600, fontStyle: "normal" }}>
          Control{" "}
          <span
            style={{
              color: "#FACC15",
              fontSize: 42,
              fontWeight: 400,
              fontStyle: "normal",
            }}
          >
            Pro
          </span>
        </div>
      </div>
    </div>
  );
}
