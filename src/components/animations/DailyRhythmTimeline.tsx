import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Moon, Baby, Droplets } from 'lucide-react';

const SEGMENTS = [
  { label: 'Sono', color: '#d1cbeb', endAngle: 140, icon: Moon },
  { label: 'Alimentação', color: '#fed7ca', endAngle: 240, icon: Baby },
  { label: 'Fraldas', color: '#bae6fd', endAngle: 290, icon: Droplets },
  { label: 'Momentos ativos', color: '#dce1cd', endAngle: 360, icon: null },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function DailyRhythmTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const cx = 200;
  const cy = 200;
  const r = 160;
  const strokeWidth = 28;

  let prevAngle = 0;
  const arcs = SEGMENTS.map((seg) => {
    const startAngle = prevAngle;
    const path = describeArc(cx, cy, r, startAngle, seg.endAngle);

    const totalLen = ((seg.endAngle - startAngle) / 360) * 2 * Math.PI * r;
    prevAngle = seg.endAngle;

    const midAngle = (startAngle + seg.endAngle) / 2;
    const iconPos = polarToCartesian(cx, cy, r, midAngle);

    return { ...seg, path, totalLen, startAngle, iconPos };
  });

  const progress = useTransform(scrollYProgress, [0.15, 0.65], [0, 1]);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center py-8">
      <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px]">
        <svg viewBox="0 0 400 400" className="w-full h-full" aria-label="Visualização do ritmo diário do bebê">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3ede4" strokeWidth={strokeWidth} />

          {arcs.map((arc, i) => (
            <motion.path
              key={i}
              d={arc.path}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                pathLength: progress,
              }}
              initial={{ pathLength: 0 }}
            />
          ))}

          {arcs.map((arc, i) =>
            arc.icon ? (
              <motion.g
                key={`icon-${i}`}
                style={{ opacity: progress }}
              >
                <circle cx={arc.iconPos.x} cy={arc.iconPos.y} r={16} fill="white" />
              </motion.g>
            ) : null,
          )}
        </svg>

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ opacity: progress }}
        >
          <p className="text-3xl sm:text-4xl font-display font-bold text-stone-800">24h</p>
          <p className="text-sm text-stone-500 mt-1">de cuidado</p>
        </motion.div>
      </div>

      <motion.div
        className="hidden lg:flex flex-col gap-3 ml-12"
        style={{ opacity: progress }}
      >
        {SEGMENTS.map((seg, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-sm text-stone-600">{seg.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
