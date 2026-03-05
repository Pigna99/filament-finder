"use client";

import { useMemo } from "react";

interface PuntoStorico {
  rilevato_at: string;
  prezzo_finale: number;
  shop: string;
  id_filament_shop: number;
}

interface Props {
  data: PuntoStorico[];
  height?: number;
}

const SHOP_COLORS = [
  "#34d399", // emerald-400
  "#60a5fa", // blue-400
  "#f472b6", // pink-400
  "#fb923c", // orange-400
  "#a78bfa", // violet-400
  "#facc15", // yellow-400
];

export default function PriceChart({ data, height = 200 }: Props) {
  const { lines, minY, maxY, minX, maxX, shops } = useMemo(() => {
    if (data.length === 0) return { lines: [], minY: 0, maxY: 0, minX: 0, maxX: 1, shops: [] };

    const shopIds = [...new Set(data.map((d) => d.id_filament_shop))];
    const shops = shopIds.map((id) => ({
      id,
      nome: data.find((d) => d.id_filament_shop === id)?.shop ?? "",
    }));

    const prices = data.map((d) => Number(d.prezzo_finale));
    const times = data.map((d) => new Date(d.rilevato_at).getTime());
    const minY = Math.min(...prices) * 0.95;
    const maxY = Math.max(...prices) * 1.05;
    const minX = Math.min(...times);
    const maxX = Math.max(...times);

    const lines = shops.map((shop, i) => {
      const points = data
        .filter((d) => d.id_filament_shop === shop.id)
        .sort((a, b) => new Date(a.rilevato_at).getTime() - new Date(b.rilevato_at).getTime());
      return { shop, color: SHOP_COLORS[i % SHOP_COLORS.length], points };
    });

    return { lines, minY, maxY, minX, maxX, shops };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
        Nessun dato storico disponibile
      </div>
    );
  }

  const W = 600;
  const H = height;
  const PAD = { top: 10, right: 20, bottom: 30, left: 55 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  function toX(ts: number) {
    if (maxX === minX) return PAD.left + iW / 2;
    return PAD.left + ((ts - minX) / (maxX - minX)) * iW;
  }
  function toY(price: number) {
    if (maxY === minY) return PAD.top + iH / 2;
    return PAD.top + iH - ((price - minY) / (maxY - minY)) * iH;
  }

  // Y-axis labels
  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minY + ((maxY - minY) * i) / yTicks;
    return { val, y: toY(val) };
  });

  // X-axis labels (max 4)
  const xCount = Math.min(4, data.length);
  const xStep = (maxX - minX) / Math.max(xCount - 1, 1);
  const xLabels = Array.from({ length: xCount }, (_, i) => {
    const ts = minX + xStep * i;
    const d = new Date(ts);
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      x: toX(ts),
    };
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: height + 20 }}
      >
        {/* Grid lines */}
        {yLabels.map(({ y, val }) => (
          <g key={val}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#3f3f46" strokeDasharray="4" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#71717a">
              €{val.toFixed(2)}
            </text>
          </g>
        ))}

        {/* X labels */}
        {xLabels.map(({ label, x }) => (
          <text key={x} x={x} y={H - 8} textAnchor="middle" fontSize={10} fill="#71717a">
            {label}
          </text>
        ))}

        {/* Lines */}
        {lines.map(({ shop, color, points }) => {
          if (points.length < 2) {
            const p = points[0];
            if (!p) return null;
            const cx = toX(new Date(p.rilevato_at).getTime());
            const cy = toY(Number(p.prezzo_finale));
            return <circle key={shop.id} cx={cx} cy={cy} r={4} fill={color} />;
          }
          const d = points
            .map((p, i) => {
              const x = toX(new Date(p.rilevato_at).getTime());
              const y = toY(Number(p.prezzo_finale));
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
          return (
            <g key={shop.id}>
              <path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={toX(new Date(p.rilevato_at).getTime())}
                  cy={toY(Number(p.prezzo_finale))}
                  r={3}
                  fill={color}
                >
                  <title>{`${p.shop}: €${Number(p.prezzo_finale).toFixed(2)}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legenda */}
      {shops.length > 1 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {lines.map(({ shop, color }) => (
            <span key={shop.id} className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: color }} />
              {shop.nome}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
