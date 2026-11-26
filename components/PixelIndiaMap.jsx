"use client";
import React, { useMemo } from "react";

// Telangana state boundary (0–100 normalized space)
const TELANGANA_POLY = [
  // North (Adilabad -> Komaram Bheem)
  [28, 7], [33, 9], [39, 10], [42, 13], [46, 15], [48, 13],
  [53, 14], [59, 12], [63, 15], [63, 20], [61, 22], [63, 27],
  // East (Mancherial -> Mulugu -> Bhadradri Kothagudem eastern tip)
  [68, 30], [72, 32], [75, 31], [79, 35], [81, 39], [85, 40],
  [86, 46], [92, 47], [97, 46], [94, 50], [89, 54],
  // South-East (Khammam -> Suryapet -> Nalgonda)
  [83, 57], [81, 60], [76, 62], [71, 61], [67, 63], [71, 68],
  [68, 69], [64, 63], [60, 64], [59, 71], [54, 70], [47, 72],
  // South (Nagarkurnool -> Wanaparthy -> Jogulamba Gadwal)
  [43, 78], [40, 79], [37, 78], [34, 83], [30, 82], [24, 84],
  [19, 86], [10, 86], [7, 81], [2, 74], [6, 72],
  // West (Mahbubnagar -> Vikarabad -> Sangareddy -> Nizamabad -> Nirmal)
  [7, 65], [5, 59], [11, 54], [7, 50], [11, 45], [8, 42],
  [11, 36], [15, 32], [17, 29], [20, 28], [16, 24], [18, 19],
  [24, 19], [26, 14],
];

// Hyderabad silhouette positioned at Hyderabad's real location
const HYDERABAD_POLY = [
  [22.5, 51.1], [24.3, 50.7], [25.1, 52.3], [26.3, 52.7],
  [27.5, 52.1], [29.9, 52.5], [29.7, 51.1], [30.9, 50.3],
  [32.3, 51.3], [34.7, 51.7], [35.5, 50.9], [37.1, 51.5],
  [36.9, 52.9], [38.7, 52.9], [39.1, 54.1], [40.3, 54.3],
  [39.9, 55.5], [38.3, 56.3], [38.5, 58.1], [38.9, 59.9],
  [40.5, 60.3], [40.3, 61.5], [38.5, 62.1], [36.3, 60.7],
  [35.1, 60.5], [35.1, 61.5], [32.5, 61.9], [31.3, 62.5],
  [28.9, 61.5], [28.9, 60.7], [30.1, 59.1], [28.9, 58.7],
  [29.7, 57.3], [27.5, 57.1], [25.3, 56.5], [24.5, 56.5],
  [23.9, 55.7], [25.3, 54.1], [26.1, 52.9],
];

function isInside(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function PixelIndiaMap() {
  const step = 2.35;
  const scale = 4;
  const dotRadius = 2.8;

  const dots = useMemo(() => {
    const points = [];
    for (let y = 5; y <= 90; y += step) {
      for (let x = 1; x <= 99; x += step) {
        if (!isInside(x, y, TELANGANA_POLY)) continue;

        const inHyderabad = isInside(x, y, HYDERABAD_POLY);
        const inLabelZone = x >= 41.5 && x <= 79 && y >= 54 && y <= 59.5;
        if (!inHyderabad && inLabelZone) continue;

        points.push({
          x: x * scale,
          y: y * scale,
          isHyd: inHyderabad,
        });
      }
    }
    return points;
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg
        viewBox="0 0 400 370"
        role="img"
        aria-label="Pixelated map of Telangana highlighting Hyderabad"
        style={{ width: "100%", maxWidth: "430px", height: "auto", maxHeight: "300px", overflow: "visible" }}
      >
        <defs>
          <filter id="red-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {dots.map((d, idx) => (
          <circle
            key={idx}
            cx={d.x}
            cy={d.y}
            r={d.isHyd ? dotRadius + 0.3 : dotRadius}
            fill={d.isHyd ? "#ff3838" : "#6e5c5c"}
            opacity={d.isHyd ? 0.95 : 0.6}
            filter={d.isHyd ? "url(#red-glow)" : undefined}
          />
        ))}

        <g transform={`translate(${43 * scale}, ${56.7 * scale})`}>
          <circle cx="0" cy="0" r="8" fill="#ff3838" opacity="0.22" className="tg-ping" />
          <circle cx="0" cy="0" r="3.4" fill="#ff3838" filter="url(#red-glow)" />
          <text
            x="12"
            y="3.5"
            fill="rgba(255, 255, 255, 0.72)"
            fontSize="9.5"
            fontWeight="700"
            letterSpacing="0.09em"
            fontFamily="system-ui, -apple-system, sans-serif"
            style={{ userSelect: "none", pointerEvents: "none" }}
          >
            HYDERABAD, TELANGANA
          </text>
        </g>
      </svg>

      <style>{`
        .tg-ping {
          transform-box: fill-box;
          transform-origin: center;
          animation: tgPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes tgPing {
          0% { transform: scale(0.9); opacity: 0.35; }
          75%, 100% { transform: scale(2.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
