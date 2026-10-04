"use client";

export default function ContinuousBlueprint() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Global Engineering Coordinate Metric Grid (Continuous Full Page) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="page-blueprint-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <path
              d="M 40 0 L 40 80 M 0 40 L 80 40"
              fill="none"
              stroke="#0f172a"
              strokeWidth="0.5"
              strokeDasharray="2,4"
            />
            <circle cx="40" cy="40" r="1" fill="#b45309" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#page-blueprint-grid)" />
      </svg>

      {/* 2. Left Vertical Datum Axis (Travel Millimeter Ruler: 0000 MM -> 6000 MM) */}
      <div className="hidden xl:flex flex-col justify-between absolute left-2 xl:left-3 2xl:left-6 top-32 bottom-40 w-12 border-l border-ink/10 pl-1.5 font-mono text-[9px] text-ink-3 opacity-40">
        <div>
          <span className="block font-bold text-[#b45309]">0000 MM</span>
          <span className="text-[8px] text-ink-3">SYS-INIT</span>
        </div>
        <div>
          <span className="block font-bold">1200 MM</span>
          <span className="text-[8px] text-ink-3">3D-STUDIO</span>
        </div>
        <div>
          <span className="block font-bold">2400 MM</span>
          <span className="text-[8px] text-ink-3">FLEET-CAT</span>
        </div>
        <div>
          <span className="block font-bold">3600 MM</span>
          <span className="text-[8px] text-ink-3">INSPECTION</span>
        </div>
        <div>
          <span className="block font-bold">4800 MM</span>
          <span className="text-[8px] text-ink-3">JOURNEY</span>
        </div>
        <div>
          <span className="block font-bold text-[#b45309]">6000 MM</span>
          <span className="text-[8px] text-ink-3">TERMINAL</span>
        </div>
      </div>

      {/* 3. Right Vertical Technical Datum Axis (Coordinates & System Standard) */}
      <div className="hidden xl:flex flex-col justify-between absolute right-2 xl:right-3 2xl:right-6 top-32 bottom-40 w-24 border-r border-ink/10 pr-1.5 text-right font-mono text-[9px] text-ink-3 opacity-40">
        <div>
          <span className="block font-bold text-ink">10.7626° N</span>
          <span className="text-[8px] text-ink-3">106.6602° E</span>
        </div>
        <div>
          <span className="block font-bold text-ink">SCALE 1:1</span>
          <span className="text-[8px] text-ink-3">METRIC CAD</span>
        </div>
        <div>
          <span className="block font-bold text-ink">ISO-26262</span>
          <span className="text-[8px] text-ink-3">ROAD-VEHICLES</span>
        </div>
        <div>
          <span className="block font-bold text-ink">PAYOS-API</span>
          <span className="text-[8px] text-ink-3">SHA-256 SYNC</span>
        </div>
        <div>
          <span className="block font-bold text-ink">PASS-NFC</span>
          <span className="text-[8px] text-ink-3">PKPASS ISO</span>
        </div>
      </div>

      {/* 4. Inter-Section Aero Streamlines & Engineering Boundary Marks */}
      {/* Fleet Catalog Section Marker */}
      <div className="absolute top-[1800px] left-0 right-0 h-px max-w-7xl mx-auto flex items-center justify-between px-6 opacity-25">
        <span className="font-mono text-[9px] text-ink tracking-widest bg-[var(--canvas)] px-2">
          [SEC-01: FLEET MATRIX SPECIFICATIONS // ISO-26262]
        </span>
        <div className="h-px bg-ink/20 flex-1 mx-4 border-t border-dashed border-ink/30" />
        <span className="font-mono text-[9px] text-ink tracking-widest bg-[var(--canvas)] px-2">
          REF: FLEET-CAT-V3
        </span>
      </div>

      {/* Inspection Section Marker */}
      <div className="absolute top-[3200px] left-0 right-0 h-px max-w-7xl mx-auto flex items-center justify-between px-6 opacity-25">
        <span className="font-mono text-[9px] text-[#b45309] font-bold tracking-widest bg-[var(--canvas)] px-2">
          [SEC-02: TELEMETRY &amp; 360° DIAGNOSTIC AUDIT]
        </span>
        <div className="h-px bg-ink/20 flex-1 mx-4 border-t border-dashed border-ink/30" />
        <span className="font-mono text-[9px] text-ink tracking-widest bg-[var(--canvas)] px-2">
          PAYOS REAL-TIME AUDIT
        </span>
      </div>

      {/* Pinned Journey Section Marker */}
      <div className="absolute top-[4400px] left-0 right-0 h-px max-w-7xl mx-auto flex items-center justify-between px-6 opacity-25">
        <span className="font-mono text-[9px] text-ink tracking-widest bg-[var(--canvas)] px-2">
          [SEC-03: SEQUENTIAL DISPATCH TIMELINE // 3 PHASES]
        </span>
        <div className="h-px bg-ink/20 flex-1 mx-4 border-t border-dashed border-ink/30" />
        <span className="font-mono text-[9px] text-ink tracking-widest bg-[var(--canvas)] px-2">
          SCROLL VELOCITY 1.0X
        </span>
      </div>

      {/* Membership Passes Section Marker */}
      <div className="absolute top-[5400px] left-0 right-0 h-px max-w-7xl mx-auto flex items-center justify-between px-6 opacity-25">
        <span className="font-mono text-[9px] text-ink tracking-widest bg-[var(--canvas)] px-2">
          [SEC-04: NFC SECURE ENCLAVE // APPLE WALLET &amp; GOOGLE WALLET]
        </span>
        <div className="h-px bg-ink/20 flex-1 mx-4 border-t border-dashed border-ink/30" />
        <span className="font-mono text-[9px] text-ink tracking-widest bg-[var(--canvas)] px-2">
          NFC-PKPASS-CERT
        </span>
      </div>
    </div>
  );
}
