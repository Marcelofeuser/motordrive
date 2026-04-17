import * as React from "react";

type Props = {
  size?: number;
  className?: string;
};

export default function DriverControlIcon({ size = 128, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Driver Control Pro icon"
    >
      <defs>
        <linearGradient id="bgGrad" x1="24" y1="20" x2="232" y2="236" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1220" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="58" y1="42" x2="198" y2="214" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="arcBlue" x1="70" y1="54" x2="118" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="arcGreen" x1="138" y1="54" x2="186" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="bar1" x1="96" y1="129" x2="96" y2="166" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>
        <linearGradient id="bar2" x1="116" y1="120" x2="116" y2="166" gradientUnits="userSpaceOnUse">
          <stop stopColor="#86EFAC" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="bar3" x1="136" y1="114" x2="136" y2="166" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id="bar4" x1="156" y1="108" x2="156" y2="166" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB7185" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="arrowGrad" x1="102" y1="166" x2="190" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCD34D" />
          <stop offset="1" stopColor="#FACC15" />
        </linearGradient>
        <filter id="shadow" x="12" y="16" width="232" height="232" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#shadow)">
        <rect x="24" y="24" width="208" height="208" rx="44" fill="url(#bgGrad)" />
      </g>

      <path d="M74 67C85 57 98 50 112 47" stroke="url(#arcBlue)" strokeWidth="10" strokeLinecap="round" />
      <path d="M144 47C158 50 171 57 182 67" stroke="url(#arcGreen)" strokeWidth="10" strokeLinecap="round" />

      <circle cx="128" cy="132" r="74" fill="#020617" stroke="url(#ringGrad)" strokeWidth="14" />
      <circle cx="128" cy="132" r="56" fill="#0F172A" stroke="#1E293B" strokeWidth="8" />

      <rect x="89" y="129" width="14" height="37" rx="3" fill="url(#bar1)" />
      <rect x="109" y="120" width="14" height="46" rx="3" fill="url(#bar2)" />
      <rect x="129" y="114" width="14" height="52" rx="3" fill="url(#bar3)" />
      <rect x="149" y="108" width="14" height="58" rx="3" fill="url(#bar4)" />

      <path
        d="M80 128L112 124C118 123 123 119 127 115L133 109C137 105 144 104 149 107L188 127L181 141L149 128C145 126 140 126 136 128L129 132C124 135 118 137 112 137L82 141L80 128Z"
        fill="#D1D5DB"
      />
      <path
        d="M120 134L136 134L143 190C144 197 139 203 132 203H124C117 203 112 197 113 190L120 134Z"
        fill="#A1A1AA"
      />
      <circle cx="128" cy="137" r="25" fill="#374151" />
      <circle cx="128" cy="137" r="14" fill="#FBBF24" />
      <circle cx="94" cy="134" r="6" fill="#374151" />
      <circle cx="106" cy="134" r="6" fill="#374151" />
      <circle cx="150" cy="134" r="6" fill="#374151" />
      <circle cx="162" cy="134" r="6" fill="#374151" />

      <path
        d="M93 170L114 161C124 157 134 151 142 143L176 112C179 109 184 109 188 112L201 123C204 126 203 131 199 133L166 149C158 153 151 159 146 166L131 185C129 188 124 188 122 185L116 178C114 175 110 174 106 176L97 181L93 170Z"
        fill="url(#arrowGrad)"
      />
    </svg>
  );
}
