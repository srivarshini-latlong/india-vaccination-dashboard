"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import vaccinationData from "../data/dataset";
import { useEffect, useState } from "react";

export default function VaccinationChart({ highlighted }) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prepare data
  const data = Object.entries(vaccinationData)
    .map(([id, d]) => ({
      id,
      name: d.name,
      value: d.overall,
      partial: d.partial,
      total: d.total,
      precaution: d.precaution,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  // Tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;

    const colorClasses = {
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-400/40', text: 'text-blue-300' },
      green: { bg: 'bg-green-500/20', border: 'border-green-400/40', text: 'text-green-300' },
      yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-400/40', text: 'text-yellow-300' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-400/40', text: 'text-purple-300' },
    };

    const dataPoints = [
      { label: "Tot", value: d.value, colorKey: "blue" },
      { label: "Full", value: d.total, colorKey: "green" },
      { label: "Part", value: d.partial, colorKey: "yellow" },
      { label: "Pre", value: d.precaution, colorKey: "purple" },
    ];

    return (
      <div
        className="p-2 bg-slate-800/95 backdrop-blur-md rounded shadow-xl border border-white/20"
        style={{
          width: "auto",
          maxWidth: "90vw",        // never overflow small screens
          minWidth: "100px",       // always readable on large screens
        }}
      >
        <p className="font-bold text-white mb-1 text-[10px] sm:text-[12px] break-words">
          {label}
        </p>
        <div className="space-y-0.5 text-[9px] sm:text-[10px]">
          {dataPoints.map(({ label, value, colorKey }) => {
            const classes = colorClasses[colorKey];
            return (
              <div
                key={label}
                className={`flex justify-between items-center ${classes.bg} px-1 py-0.5 rounded border ${classes.border}`}
              >
                <span className={`${classes.text} font-semibold break-words text-[8px] sm:text-[10px]`}>
                  {label}:
                </span>
                <span className="font-bold text-white text-[8px] sm:text-[10px]">
                  {value >= 1_000_000
                    ? `${(value / 1_000_000).toFixed(1)}M`
                    : value >= 1_000
                    ? `${(value / 1_000).toFixed(0)}K`
                    : value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="text-center mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-2 sm:mb-3">
          Top 15 States by Vaccination
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {isMobile
            ? "Vertical bars showing vaccination numbers for top-performing states"
            : "Horizontal bars showing vaccination numbers for top-performing states"}
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 sm:p-5 border border-white/20">
        <div className="flex justify-center overflow-x-hidden">
          <div className="w-full max-w-full">
            <ResponsiveContainer width="100%" height={isMobile ? 500 : 450}>
              <BarChart
                data={data}
                layout={isMobile ? "vertical" : "horizontal"}
                margin={
                  isMobile
                    ? { top: 10, right: 10, left: 40, bottom: 40 }
                    : { top: 10, right: 40, left: 80, bottom: 10 }
                }
              >
                <defs>
                  <linearGradient id="mainGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="highlightedGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>

                {/* ✅ Correct axis setup for both layouts */}
                {isMobile ? (
                  <>
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "#d1d5db", fontSize: 10 }}
                      width={80}
                      interval={0}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `${(v / 1_000_000).toFixed(1)}M`
                          : v >= 1_000
                          ? `${(v / 1_000).toFixed(0)}K`
                          : v
                      }
                      tick={{ fill: "#d1d5db", fontSize: 10 }}
                    />
                  </>
                ) : (
                  <>
                    <XAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "#d1d5db", fontSize: 10 }}
                      interval={0}
                      height={80}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis
                      type="number"
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `${(v / 1_000_000).toFixed(1)}M`
                          : v >= 1_000
                          ? `${(v / 1_000).toFixed(0)}K`
                          : v
                      }
                      tick={{ fill: "#d1d5db", fontSize: 10 }}
                    />
                  </>
                )}

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />

                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
                  {data.map((entry) => {
                    const isHighlighted = highlighted === entry.id;
                    return (
                      <Cell
                        key={entry.id}
                        fill={isHighlighted ? "url(#highlightedGradient)" : "url(#mainGradient)"}
                        stroke={isHighlighted ? "#10b981" : "#059669"}
                        strokeWidth={isHighlighted ? 2 : 1}
                        opacity={1} // Keep all bars fully visible
                        className={`transition-all duration-300 ${isHighlighted ? "filter drop-shadow-lg" : ""}`}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center mt-5 sm:mt-6 gap-3 sm:gap-5 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-[#34d399] via-[#10b981] to-[#059669] rounded"></div>
            <span className="text-green-300">All States</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] rounded"></div>
            <span className="text-blue-300">Highlighted State</span>
          </div>
        </div>
      </div>
    </div>
  );
}
