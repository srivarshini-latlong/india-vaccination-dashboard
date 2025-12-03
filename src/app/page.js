"use client";
import { useState } from "react";
import IndiaMap from "../components/IndiaMap";
import VaccinationChart from "../components/VaccinationChart";
import Legend from "../components/Legend";
// import VaccinationInsights from "../components/VaccinationInsights";
// import ComparativeAnalysis from "../components/ComparativeAnalysis";

export default function Dashboard() {
  const [highlighted, setHighlighted] = useState(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            India Vaccination Dashboard
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
            Interactive visualization of COVID-19 vaccination coverage across Indian states
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-[95vw] mx-auto px-4 sm:px-6 md:px-8 pb-8">
          {/* Top Section: Map with Side Panels */}
          <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-4 mb-6">
            {/* Left Panels - Hidden on small screens */}
            <div className="hidden md:block md:col-span-2 xl:col-span-2 space-y-4">
              <div className="sticky top-4">
                {/* <VaccinationInsights highlighted={highlighted} /> */}
              </div>
              <div className="sticky top-[calc(100vh-500px)]">
                {/* <ComparativeAnalysis highlighted={highlighted} /> */}
              </div>
            </div>

            {/* Center Map */}
            <div className="col-span-1 md:col-span-4 xl:col-span-10">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-4 border border-white/20">
                <div className="text-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Interactive State Map</h2>
                  <p className="text-sm sm:text-base text-gray-300">
                    Hover over any state to view detailed vaccination data
                  </p>
                </div>

                <div className="flex justify-center items-start px-2">
  <div className="w-full max-w-5xl mx-auto flex justify-center">
    <div className="w-full sm:w-[95%] md:w-[90%] lg:w-full">
      <IndiaMap highlighted={highlighted} setHighlighted={setHighlighted} />
    </div>
  </div>
</div>

                {/* <div className="flex justify-center mt-4 overflow-x-auto">
                  <Legend />
                </div> */}
              </div>
            </div>
          </div>

          {/* Mobile Panels - Shown only on small screens */}
          {/* <div className="block md:hidden space-y-4 mb-6"> */}
            {/* <VaccinationInsights highlighted={highlighted} /> */}
            {/* <ComparativeAnalysis highlighted={highlighted} /> */}
          {/* </div> */}

          {/* Bottom Section: Chart */}
          {/* <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 overflow-x-auto"> */}
            {/* <VaccinationChart highlighted={highlighted} /> */}
          {/* </div> */}
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            India COVID-19 Vaccination Dashboard
          </p>
        </footer>
      </div>
    </main>
  );
}