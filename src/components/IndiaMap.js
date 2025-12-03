"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import vaccinationData from "../data/vaccinationData.js";

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
  const [isMobile, setIsMobile] = useState(false);
  const [palette, setPalette] = useState("green");

  const mapRef = useRef(null);
  const tooltipRef = useRef(null);

  const COLOR_PALETTES = {
    green: ["#E5F6F0", "#BDE9D6", "#6DB68D", "#3C8B70", "#1AA850"],
    blue: ["#EDF6FF", "#C9E3F9", "#94C4F0", "#4380C2", "#1A2B3D"],
    red: ["#FCE8E6", "#F6B4AA", "#F36C60", "#D4423B", "#991F1B"],
    bluemint: ["#1AA850", "#88D8A9", "#F6BE7A", "#82A7D6", "#4380C2"],
  };

  /* 📌 Window size listener — always a hook */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* 📌 Load SVG */
  useEffect(() => {
    fetch("/india.layer1.svg")
      .then((res) => res.text())
      .then((svg) => setSvgContent(svg));
  }, []);

  /* 📌 Click outside to reset */
  useEffect(() => {
    const handleOutside = (event) => {
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
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [setHighlighted]);

  /* 🎨 Color scale */
  const values = Object.values(vaccinationData).map((d) => d.value);

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

  /* 🧠 Memo: compute updated SVG */
  const updatedSvg = useMemo(() => {
    if (!svgContent) return "";

    const parser = new DOMParser();
    const xml = parser.parseFromString(svgContent, "image/svg+xml");

    

// 🔥 remove SVG default style that forces fill color
const styleTag = xml.querySelector("style");
if (styleTag) {
  styleTag.textContent = ""; // keep tag, but empty it
}

    const paths = xml.querySelectorAll("[data-id]");



    paths.forEach((el) => {
  let id = el.getAttribute("data-id");
  if (!id) {
    const className = el.getAttribute("class");
    if (className) id = className.trim();
  }
  if (!vaccinationData[id]) {
  el.setAttribute("fill", "#e5e7eb"); // light gray
  el.setAttribute("stroke", "#ffffff");
  el.setAttribute("stroke-width", "0.4");
  return;
}



      const d = vaccinationData[id];
      const isSelected = selectedState === id;
      const isHighlighted = highlighted === id;

      const fill = getColor(d.value);
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

      el.setAttribute("fill", fill);
      el.setAttribute("stroke", stroke);
      el.setAttribute("stroke-width", strokeWidth);
      el.setAttribute("filter", filter);
    });

    const serializer = new XMLSerializer();
    let result = serializer.serializeToString(xml);

    // ❌ Remove XML header
    result = result.replace(/<\?xml[^>]*?>/g, "");

    // ❌ Remove <defs/> that causes duplicate <svg>
    result = result.replace(/<defs\s*\/>/g, "");

    // 🔥 keep only first <svg>, convert all others to <g>
    let svgCount = 0;
    result = result.replace(/<\/?svg[^>]*>/gi, (match) => {
      svgCount++;
      if (svgCount === 1) return match; // keep root <svg>
      return match.startsWith("</") ? "</g>" : "<g>"; // convert others
    });

    /* Glow filter */
    // ensure <defs> block is inserted BEFORE </svg> and not after <defs/>
    if (!result.includes('id="glow"')) {
      result = result.replace(
        /<\/svg>\s*$/,
        `<defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs></svg>`
      );
    }

    /* Responsive */
    // make responsive without breaking svg tag
    // Remove width and height only
    result = result
      .replace(/\swidth="[^"]*"/, "")
      .replace(/\sheight="[^"]*"/, "");

    // Add responsive class *without replacing the <svg> tag*
    // Add responsive class *without replacing the <svg> tag*
if (!result.includes('class="w-full')) {
  result = result.replace(
  /<svg([^>]*?)>/,
  `<svg$1 class="w-full h-auto max-w-full" preserveAspectRatio="xMidYMid meet" viewBox="0 0 700 650">`
);

}

/* 🔥 Keep ONLY the first <svg> */
result = result.match(/<svg[\s\S]*?<\/svg>/i)?.[0] || result;

console.log("FIRST 300 CHARS:", result.substring(0, 300));
return result;

  }, [svgContent, selectedState, highlighted, palette]);

  /* 🖱 Hover */
  const handleMouseMove = (e) => {
    if (isMobile || selectedState) return;
    const stateId = e.target.getAttribute("data-id");
    if (!stateId || !vaccinationData[stateId]) return;

    const stateData = vaccinationData[stateId];
    setHighlighted(stateId);

    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left + 10;
    let y = e.clientY - rect.top - 10;

    if (tooltipRef.current) {
      const { offsetWidth, offsetHeight } = tooltipRef.current;
      x = Math.min(x, window.innerWidth - offsetWidth - 10);
      y = Math.min(y, window.innerHeight - offsetHeight - 10);
    }

    setTooltip({
      visible: true,
      x,
      y,
      stateId,
      stateName: stateData.name,
      data: stateData,
    });
  };
  const handleMouseLeave = () => {
    if (!selectedState) setTooltip({ visible: false });
  };

  /* 👆 Click */
  const handleStateClick = (stateId) => {
    const stateData = vaccinationData[stateId];
    if (!stateData) return;

    const deselect = selectedState === stateId;
    setSelectedState(deselect ? null : stateId);
    setHighlighted(deselect ? null : stateId);

    if (isMobile) {
      setTooltip({
        visible: true,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        stateId,
        stateName: stateData.name,
        data: stateData,
      });
      setIsMobilePopupOpen(!deselect);
    } else {
      setTooltip({
        visible: true,
        x: deselect ? 0 : 0,
        y: deselect ? 0 : 0,
        stateId,
        stateName: stateData.name,
        data: stateData,
      });
      setIsMobilePopupOpen(false);
    }
  };

  /* Pie chart component */
  // const PIE_COLORS = ["#22c55e", "#facc15", "#a855f7"];
  // const StatePieChart = ({ data }) => {
  //   const pie = [
  //     { name: "Fully", value: data.total },
  //     { name: "Partial", value: data.partial },
  //     { name: "Precaution", value: data.precaution },
  //   ];
  //   const total = pie.reduce((a, b) => a + b.value, 0);
  //   return (
  //     <div className="w-full">
  //       <ResponsiveContainer width="100%" height={100}>
  //         <PieChart>
  //           <Pie
  //             data={pie}
  //             cx="50%"
  //             cy="50%"
  //             innerRadius={20}
  //             outerRadius={40}
  //             dataKey="value"
  //           >
  //             {pie.map((_, i) => (
  //               <Cell
  //                 key={i}
  //                 fill={PIE_COLORS[i]}
  //                 stroke="#1e293b"
  //                 strokeWidth={2}
  //               />
  //             ))}
  //           </Pie>
  //         </PieChart>
  //       </ResponsiveContainer>
  //       <p className="text-center text-[10px] text-gray-400 mt-1">
  //         Total: {total.toLocaleString()}
  //       </p>
  //     </div>
  //   );
  // };


  console.log("svgContent loaded?", svgContent.length);
console.log("updatedSvg generated?", updatedSvg.length);

  /* 🛑 HOOKS FINISHED — SAFE TO BRANCH BELOW */
  return (
    <div ref={mapRef} className="relative w-full flex flex-col items-center gap-4">

      {/* Loading only inside JSX (not before hooks) */}
      {!svgContent && (
        <div className="flex items-center justify-center h-56">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 rounded-full border-b-2 mx-auto mb-2"></div>
            <p className="text-gray-300 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* SVG */}
      {svgContent && (
        <div
          className="w-full max-w-[800px] mx-auto"
          dangerouslySetInnerHTML={{ __html: updatedSvg }}
          
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => {
            const id = e.target.getAttribute("data-id");
            if (id && vaccinationData[id]) handleStateClick(id);
          }}
        />
      )}

      {/* Color palettes */}
      <div className="absolute top-4 right-4 z-40 bg-slate-900/85 backdrop-blur-md 
rounded-lg p-2 border border-white/20 shadow-xl w-36">

        <p className="text-sm text-white text-center font-semibold mb-2">
          Choose Color Palette
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.entries(COLOR_PALETTES).map(([name, colors]) => {
            const gradient = `linear-gradient(to right, ${colors.join(", ")})`;
            return (
              <div
                key={name}
                onClick={() => setPalette(name)}
                className={`cursor-pointer rounded-lg p-1 border text-white ${
                  palette === name ? "border-white" : "border-gray-600"
                }`}
              >
                <div
                  className="w-32 h-2 rounded"
                  style={{ background: gradient }}
                />
                <p className="text-center text-xs capitalize mt-1">{name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover tooltip — desktop */}
      {!selectedState && tooltip.visible && tooltip.data && !isMobile && (
        <div
          ref={tooltipRef}
          className="absolute bg-slate-800 shadow-2xl rounded-lg p-3 w-72 z-50 animate-fade-in pointer-events-none border border-white/20"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          <h3 className="text-white font-bold text-sm">{tooltip.stateName}</h3>
          
        </div>
      )}

      {/* Popup — mobile */}
      {isMobilePopupOpen && tooltip.data && isMobile && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40"></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 rounded-3xl p-5 w-11/12 max-w-sm z-50 animate-fade-in border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-bold">{tooltip.stateName}</h3>
              <button
                onClick={() => setIsMobilePopupOpen(false)}
                className="text-white text-lg"
              >
                ×
              </button>
            </div>
            {/* <StatePieChart data={tooltip.data} /> */}
          </div>
        </>
      )}
    </div>
  );
}
