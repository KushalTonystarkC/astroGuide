import { planetColor } from "@/lib/vedic/planets";

interface AspectDetail {
  to_house: number;
  aspect_type: string;
  benefic: boolean;
}

interface Props {
  idPrefix: string;
  fromHouse: number;
  details: AspectDetail[];
  getCentroid: (house: number) => { x: number; y: number } | undefined;
  selectedPlanet: string;
}

function shortenLine(
  from: { x: number; y: number },
  to: { x: number; y: number },
  pad = 32,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < pad * 2) {
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  }
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: from.x + ux * pad,
    y1: from.y + uy * pad,
    x2: to.x - ux * (pad - 6),
    y2: to.y - uy * (pad - 6),
  };
}

export function ChartAspectOverlay({
  idPrefix,
  fromHouse,
  details,
  getCentroid,
  selectedPlanet,
}: Props) {
  const from = getCentroid(fromHouse);
  if (!from) return null;

  const beneficMarker = `${idPrefix}-aspect-arrow-benefic`;
  const maleficMarker = `${idPrefix}-aspect-arrow-malefic`;
  const sourceColor = planetColor(selectedPlanet);

  return (
    <g className="aspect-overlay" pointerEvents="none">
      <defs>
        <marker
          id={beneficMarker}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--success)" />
        </marker>
        <marker
          id={maleficMarker}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--danger)" />
        </marker>
      </defs>

      {details.map((d) => {
        const to = getCentroid(d.to_house);
        if (!to) return null;
        const { x1, y1, x2, y2 } = shortenLine(from, to);
        const isSpecial = d.aspect_type === "special";
        const color = d.benefic ? "var(--success)" : "var(--danger)";
        const marker = d.benefic ? `url(#${beneficMarker})` : `url(#${maleficMarker})`;
        return (
          <g key={`aspect-${d.to_house}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={isSpecial ? 3 : 2.2}
              strokeDasharray={isSpecial ? undefined : "7 5"}
              strokeLinecap="round"
              opacity={0.92}
              markerEnd={marker}
            />
            <circle cx={x2} cy={y2} r={5} fill={color} opacity={0.35} />
          </g>
        );
      })}

      <circle
        cx={from.x}
        cy={from.y}
        r={14}
        fill={sourceColor}
        opacity={0.2}
        stroke={sourceColor}
        strokeWidth={2}
      />
    </g>
  );
}
