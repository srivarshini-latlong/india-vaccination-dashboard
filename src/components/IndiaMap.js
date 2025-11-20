"use client";
import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import vaccinationData from "../data/vaccinationData";

export default function IndiaMap({ highlighted, setHighlighted }) {
  const [svgContent, setSvgContent] = useState("");
  const [selectedState, setSelectedState] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    stateId: null,
    stateName: "",
    data: null,
  });
  const [isMobilePopupOpen, setIsMobilePopupOpen] = useState(false);
  const mapRef = useRef(null);
  const tooltipRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [palette, setPalette] = useState("green");

  const COLOR_PALETTES = {
    green: ["#E5F6F0", "#BDE9D6", "#6DB68D", "#3C8B70", "#1AA850"],
    blue: ["#EDF6FF", "#C9E3F9", "#94C4F0", "#4380C2", "#1A2B3D"],
    red: ["#FCE8E6", "#F6B4AA", "#F36C60", "#D4423B", "#991F1B"],
    bluemint: ["#1AA850", "#88D8A9", "#F6BE7A", "#82A7D6", "#4380C2"],
  };
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load SVG
  useEffect(() => {
    fetch("/india.svg")
      .then((res) => res.text())
      .then((svg) => setSvgContent(svg));
  }, []);

  // Click outside to reset selection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mapRef.current && !mapRef.current.contains(event.target)) {
        setSelectedState(null);
        setHighlighted(null);
        setTooltip({
          visible: false,
          x: 0,
          y: 0,
          stateId: null,
          stateName: "",
          data: null,
        });
        setIsMobilePopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setHighlighted]);

  if (!svgContent)
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 md:h-80 lg:h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-2 sm:mb-4"></div>
          <p className="text-gray-300 text-xs sm:text-sm md:text-base">
            Loading map...
          </p>
        </div>
      </div>
    );

  // Color scale
  const values = Object.values(vaccinationData).map((d) => d.overall);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const getColor = (value) => {
    const paletteColors = COLOR_PALETTES[palette];
    const ratio = (value - min) / (max - min);

    if (ratio > 0.8) return paletteColors[0];
    if (ratio > 0.6) return paletteColors[1];
    if (ratio > 0.4) return paletteColors[2];
    if (ratio > 0.2) return paletteColors[3];
    return paletteColors[4];
  };

  // Desktop hover tooltip
  const handleMouseMove = (e) => {
    if (isMobile || selectedState) return;

    const stateId = e.target.id;
    if (stateId && vaccinationData[stateId]) {
      const stateData = vaccinationData[stateId];
      setHighlighted(stateId);

      const rect = e.currentTarget.getBoundingClientRect();
      let x = e.clientX - rect.left + 10;
      let y = e.clientY - rect.top - 10;

      // Adjust tooltip for overflow
      if (tooltipRef.current) {
        const { offsetWidth: ttWidth, offsetHeight: ttHeight } =
          tooltipRef.current;
        if (x + ttWidth > window.innerWidth - 10)
          x = window.innerWidth - ttWidth - 10;
        if (y + ttHeight > window.innerHeight - 10)
          y = window.innerHeight - ttHeight - 10;
        if (x < 10) x = 10;
        if (y < 10) y = 10;
      }

      setTooltip({
        visible: true,
        x,
        y,
        stateId,
        stateName: stateData.name,
        data: stateData,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!selectedState) {
      setHighlighted(null);
      setTooltip({
        visible: false,
        x: 0,
        y: 0,
        stateId: null,
        stateName: "",
        data: null,
      });
    }
  };

  // Handle click (desktop & mobile)
  const handleStateClick = (stateId) => {
    const stateData = vaccinationData[stateId];

    if (selectedState === stateId) {
      // Deselect
      setSelectedState(null);
      setHighlighted(null);
      setTooltip({
        visible: false,
        x: 0,
        y: 0,
        stateId: null,
        stateName: "",
        data: null,
      });
      setIsMobilePopupOpen(false);
      return;
    }

    setSelectedState(stateId);
    setHighlighted(stateId);

    if (isMobile) {
      setTooltip({
        visible: true,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        stateId,
        stateName: stateData.name,
        data: stateData,
      });
      setIsMobilePopupOpen(true);
    } else {
      setTooltip({
        visible: true,
        x: 0,
        y: 0,
        stateId,
        stateName: stateData.name,
        data: stateData,
      });
      setIsMobilePopupOpen(false);
    }
  };

  // Update SVG colors and strokes
  let updatedSvg = svgContent;
  Object.entries(vaccinationData).forEach(([id, d]) => {
    const isSelected = selectedState === id;
    const isHighlighted = highlighted === id;
    const fill = getColor(d.overall);
    let stroke = "#ffffff",
      strokeWidth = "1",
      filter = "none";

    if (isSelected) {
      stroke = "#1e40af";
      strokeWidth = "3";
      filter = "url(#glow)";
    } else if (isHighlighted && !selectedState) {
      stroke = "#1e40af";
      strokeWidth = "2";
      filter = "url(#glow)";
    }

    updatedSvg = updatedSvg.replace(
      new RegExp(`id="${id}"`, "g"),
      `id="${id}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" filter="${filter}" class="transition-all duration-200 cursor-pointer"`
    );
  });

  // Glow filter
  if (!updatedSvg.includes("filter=")) {
    updatedSvg = updatedSvg.replace(
      "</defs>",
      `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter></defs>`
    );
  }

  // Responsive SVG
  if (updatedSvg.includes("<svg")) {
    updatedSvg = updatedSvg
      .replace(/\swidth="[^"]*"/, "")
      .replace(/\sheight="[^"]*"/, "")
      .replace(
        "<svg",
        `<svg class="w-full h-auto max-w-full" preserveAspectRatio="xMidYMid meet"`
      );
  }

  const PIE_COLORS = ["#22c55e", "#facc15", "#a855f7"];
  const StatePieChart = ({ data }) => {
    const pieData = [
      { name: "Fully", value: data.total },
      { name: "Partial", value: data.partial },
      { name: "Precaution", value: data.precaution },
    ];
    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="w-full">
        <ResponsiveContainer width="100%" height={100}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={PIE_COLORS[index]}
                  stroke="#1e293b"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center text-[10px] text-gray-400 mt-1">
          Total: {new Intl.NumberFormat().format(total)}
        </div>
      </div>
    );
  };

  return (
    <div ref={mapRef} className="relative w-full flex justify-center">
      {/* SVG */}
      <div
        className={`w-full ${
          isMobile ? "max-w-full aspect-[1.2/1]" : "max-w-3xl aspect-[1/1]"
        }`}
        dangerouslySetInnerHTML={{ __html: updatedSvg }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) =>
          e.target.id &&
          vaccinationData[e.target.id] &&
          handleStateClick(e.target.id)
        }
      />

      <div className="h-full p-2 rounded bg-slate-800/95 text-white backdrop-blur">
        <div className="w-full flex flex-col items-center gap-3 my-4">
          <div className="text-white font-semibold text-sm">
            Choose Color Palette
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(COLOR_PALETTES).map(([name, colors]) => {
              const gradient = `linear-gradient(to right, ${colors.join(
                ", "
              )})`;

              return (
                <div
                  key={name}
                  onClick={() => setPalette(name)}
                  className={`cursor-pointer rounded-lg p-1 border transition-all ${
                    palette === name ? "border-white" : "border-gray-600"
                  }`}
                >
                  {/* Gradient preview strip */}
                  <div
                    className="w-40 h-6 rounded"
                    style={{ background: gradient }}
                  />

                  {/* Label */}
                  <p className="text-center text-xs text-gray-300 mt-1 capitalize">
                    {name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop hover tooltip */}
      {!selectedState && tooltip.visible && tooltip.data && !isMobile && (
        <div
          ref={tooltipRef}
          className="absolute bg-slate-800/95 backdrop-blur-md shadow-2xl rounded-lg p-3 w-72 z-50 border border-white/20 animate-fade-in pointer-events-none"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          <h3 className="font-bold text-white text-sm mb-1">
            {tooltip.stateName}
          </h3>
          <StatePieChart data={tooltip.data} />
          <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] sm:text-xs text-gray-200">
            {[
              { label: "Total", value: tooltip.data.overall, color: "blue" },
              { label: "Fully", value: tooltip.data.total, color: "green" },
              {
                label: "Partial",
                value: tooltip.data.partial,
                color: "yellow",
              },
              {
                label: "Precaution",
                value: tooltip.data.precaution,
                color: "purple",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className={`bg-${color}-500/20 p-2 rounded-lg border border-${color}-400/30`}
              >
                <div
                  className={`text-${color}-300 font-semibold text-[10px] uppercase`}
                >
                  {label}
                </div>
                <div className="text-white font-bold text-xs mt-1">
                  {new Intl.NumberFormat().format(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop clicked card */}
      {selectedState && tooltip.data && !isMobile && (
        <div
          className="fixed bg-slate-800/95 backdrop-blur-md shadow-2xl rounded-lg p-5 w-72 z-50 border border-white/20 animate-fade-in"
          style={{
            top: "25rem", // move closer to top
            right: "0.5rem", // move further right
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white text-sm sm:text-lg">
              {tooltip.stateName}
            </h3>
            <button
              onClick={() => {
                setSelectedState(null);
                setHighlighted(null);
                setTooltip({
                  visible: false,
                  x: 0,
                  y: 0,
                  stateId: null,
                  stateName: "",
                  data: null,
                });
              }}
              className="text-gray-400 hover:text-white text-lg"
            >
              ×
            </button>
          </div>
          <StatePieChart data={tooltip.data} />
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm mt-2">
            {[
              { label: "Total", value: tooltip.data.overall, color: "blue" },
              { label: "Fully", value: tooltip.data.total, color: "green" },
              {
                label: "Partial",
                value: tooltip.data.partial,
                color: "yellow",
              },
              {
                label: "Precaution",
                value: tooltip.data.precaution,
                color: "purple",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className={`bg-${color}-500/20 p-2 rounded-lg border border-${color}-400/30`}
              >
                <div
                  className={`text-${color}-300 font-semibold text-[10px] sm:text-xs uppercase`}
                >
                  {label}
                </div>
                <div className="text-white font-bold text-xs sm:text-base md:text-lg mt-1">
                  {new Intl.NumberFormat().format(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile popup */}
      {isMobilePopupOpen && tooltip.data && isMobile && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 w-11/12 max-w-sm z-50 animate-fade-in border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-bold text-base">
                {tooltip.stateName}
              </h3>
              <button
                onClick={() => setIsMobilePopupOpen(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ×
              </button>
            </div>
            <StatePieChart data={tooltip.data} />
            <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-gray-200">
              {[
                { label: "Total", value: tooltip.data.overall, color: "blue" },
                { label: "Fully", value: tooltip.data.total, color: "green" },
                {
                  label: "Partial",
                  value: tooltip.data.partial,
                  color: "yellow",
                },
                {
                  label: "Precaution",
                  value: tooltip.data.precaution,
                  color: "purple",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className={`bg-${color}-500/20 p-2 rounded-lg border border-${color}-400/30`}
                >
                  <div
                    className={`text-${color}-300 font-semibold text-[10px] uppercase`}
                  >
                    {label}
                  </div>
                  <div className="text-white font-bold text-xs mt-1">
                    {new Intl.NumberFormat().format(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
