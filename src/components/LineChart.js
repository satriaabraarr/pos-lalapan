"use client";

/**
 * Grafik garis sederhana berbasis SVG murni (tanpa library eksternal).
 * data: [{ label: string, value: number }, ...]
 * Lebar grafik menyesuaikan container (muat 1 layar, tanpa scroll).
 * Label sumbu-X hanya ditampilkan pada tanggal 1 dan kelipatan 5, supaya
 * tidak berdesakan meski datanya sampai 30-31 titik.
 */
export default function LineChart({ data, formatValue = (v) => v, height = 220 }) {
  if (!data || data.length === 0) return null;

  const width = 640;
  const padLeft = 60;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 28;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padLeft + i * stepX,
    y: padTop + chartH - (d.value / maxValue) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const dasar = padTop + chartH;
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${dasar} L ${points[0].x.toFixed(1)} ${dasar} Z`;

  const yTicks = [0, 0.5, 1].map((f) => ({ y: padTop + chartH - f * chartH, value: maxValue * f }));

  // Tampilkan label hanya untuk tanggal 1 dan kelipatan 5 (1, 5, 10, 15, 20, 25, 30, ...)
  const tampilkanLabel = (tanggal) => tanggal === 1 || tanggal % 5 === 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Grafik tren pemasukan">
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padLeft} y1={t.y} x2={width - padRight} y2={t.y} stroke="#E5E7EB" strokeWidth="1" />
          <text x={padLeft - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="#6B7280">
            {formatValue(t.value)}
          </text>
        </g>
      ))}

      <path d={areaPath} fill="#F97316" fillOpacity="0.12" stroke="none" />
      <path d={linePath} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#F97316">
          <title>{`Tanggal ${p.label}: ${formatValue(p.value)}`}</title>
        </circle>
      ))}

      {points.map((p, i) =>
        tampilkanLabel(Number(p.label)) ? (
          <text key={i} x={p.x} y={height - 8} textAnchor="middle" fontSize="10" fill="#6B7280">
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}