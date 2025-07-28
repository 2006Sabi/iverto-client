import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const COLORS = [
  "#cd0447",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#3b82f6",
  "#ef4444",
];

export interface PieChartInlineLabelProps {
  data: { name: string; value: number }[];
}

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const RADIAN = Math.PI / 180;
  const isMobile = window.innerWidth < 768;

  // Adjust positioning based on screen size
  const labelDistance = isMobile ? 15 : 30;
  const dotDistance = isMobile ? 8 : 10;
  const textOffset = isMobile ? 8 : 12;

  // Position label outside the sector
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + dotDistance) * cos;
  const sy = cy + (outerRadius + dotDistance) * sin;
  const mx = cx + (outerRadius + labelDistance) * cos;
  const my = cy + (outerRadius + labelDistance) * sin;
  const ex = mx;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";
  const percentValue = (percent * 100).toFixed(1);

  return (
    <g>
      {/* Main sector with shadow for 3D effect */}
      <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="6"
          stdDeviation="4"
          floodColor="#000"
          floodOpacity="0.15"
        />
      </filter>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + (isMobile ? 8 : 12)}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={isMobile ? 1 : 2}
        filter="url(#pieShadow)"
      />
      {/* Connector line */}
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
        strokeWidth={isMobile ? 1 : 1.5}
      />
      <circle
        cx={ex}
        cy={ey}
        r={isMobile ? 2 : 4}
        fill={fill}
        stroke="white"
        strokeWidth={isMobile ? 1 : 2}
      />
      {/* Label outside */}
      <text
        x={ex + (cos >= 0 ? textOffset : -textOffset)}
        y={ey}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className={`font-semibold ${isMobile ? "text-xs" : "text-base"}`}
        fill="#222"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.08))" }}
      >
        {isMobile
          ? `${payload.name}: ${value}`
          : `${payload.name}: ${value} (${percentValue}%)`}
      </text>
    </g>
  );
};

const renderLabelLine = (props: any) => {
  // Hide default label lines, we use our own in activeShape
  return null;
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload, label }: any) => {
  const isMobile = window.innerWidth < 768;

  if (active && payload && payload.length) {
    const { name, value } = payload[0] || {};
    // Calculate total from payload's payload array
    const total = payload.reduce(
      (sum: number, p: any) => sum + (p.value || 0),
      0
    );
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
    return (
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: isMobile ? "6px 10px" : "8px 14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          fontSize: isMobile ? 12 : 14,
          color: "#222",
        }}
      >
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div>
          {value} anomalies
          <br />
          {percent}%
        </div>
      </div>
    );
  }
  return null;
};

const PieChartInlineLabel: React.FC<PieChartInlineLabelProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  // Fallback for empty data
  const chartData =
    data && data.length > 0
      ? data
      : [
          { name: "Motion", value: 20 },
          { name: "Intrusion", value: 60 },
          { name: "Fire", value: 70 },
          { name: "Loitering", value: 80 },
        ];
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  // Custom label for non-active sectors (outside, but less prominent)
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, name, value, index } = props;
    if (activeIndex === index) return null;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const ex = cx + (outerRadius + (isMobile ? 8 : 12)) * cos;
    const ey = cy + (outerRadius + (isMobile ? 8 : 12)) * sin;
    const textAnchor = cos >= 0 ? "start" : "end";
    const textOffset = isMobile ? 6 : 8;
    // Calculate percent from chartData
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
    return (
      <text
        x={ex + (cos >= 0 ? textOffset : -textOffset)}
        y={ey}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
        fill="#444"
        style={{ opacity: 0.85 }}
      >
        {isMobile ? `${name}: ${value}` : name}
      </text>
    );
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full"
      style={{ minHeight: isMobile ? 200 : 300 }}
    >
      <h2
        className={`font-bold mb-2 sm:mb-4 ${isMobile ? "text-sm" : "text-lg"}`}
      >
        Anomaly Types
      </h2>
      <div
        style={{
          width: "100%",
          height: isMobile ? 180 : 400,
          maxWidth: isMobile ? 300 : 520,
          overflow: "visible",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={isMobile ? 60 : 100}
              dataKey="value"
              activeIndex={activeIndex ?? undefined}
              activeShape={renderActiveShape}
              label={renderCustomLabel}
              labelLine={renderLabelLine}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(_, idx) => setActiveIndex(idx)}
              isAnimationActive={true}
            >
              {chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartInlineLabel;
