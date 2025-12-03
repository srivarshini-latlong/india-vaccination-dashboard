"use client";
import vaccinationData from "../data/dataset";

export default function ComparativeAnalysis({ highlighted }) {
  const allValues = Object.values(vaccinationData).map(state => state.overall);
  const nationalAverage = Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length);
  const maxValue = Math.max(...allValues);

  const highlightedState = highlighted ? vaccinationData[highlighted] : null;
  const statePerformance = highlightedState
    ? Math.round((highlightedState.overall / maxValue) * 100)
    : null;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 h-full">
      <h3 className="text-white text-base sm:text-lg font-semibold mb-4">📊 Performance Insights</h3>

      <div className="space-y-6">
        {/* National Benchmark */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-300 mb-2">
            <span>National Benchmark</span>
            <span>{new Intl.NumberFormat().format(nationalAverage)}</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full"
              style={{ width: "50%" }}
            ></div>
          </div>
          <div className="text-gray-400 text-xs mt-1 text-center">
            Median vaccination coverage across all states
          </div>
        </div>

        {/* Highlighted State Comparison */}
        {highlightedState && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-300 mb-2">
              <span className="text-green-300 font-semibold">{highlightedState.name}</span>
              <span>{new Intl.NumberFormat().format(highlightedState.overall)}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full"
                style={{ width: `${statePerformance}%` }}
              ></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-400 mt-1">
              <span>Relative performance</span>
              <span
                className={
                  highlightedState.overall > nationalAverage
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {highlightedState.overall > nationalAverage ? "Above Average ✓" : "Below Average"}
              </span>
            </div>
          </div>
        )}

        {/* State Ranking */}
        {highlightedState && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white text-sm font-semibold mb-2">🏅 State Ranking</h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <span className="text-gray-300 text-sm">Position among all states</span>
              <span className="text-yellow-400 font-bold text-lg">
                #
                {Object.values(vaccinationData)
                  .sort((a, b) => b.overall - a.overall)
                  .findIndex(state => state.name === highlightedState.name) + 1}
              </span>
            </div>
          </div>
        )}

        {/* Fallback Message */}
        {!highlightedState && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400 text-sm sm:text-base">
              Select a state on the map to see comparative analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}