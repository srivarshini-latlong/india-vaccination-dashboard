"use client";
import vaccinationData from "../data/dataset";

export default function VaccinationInsights({ highlighted }) {
  // Calculate meaningful insights from your data
  const allStates = Object.values(vaccinationData);
  
  // Key metrics
  const totalVaccinations = allStates.reduce((sum, state) => sum + state.overall, 0);
  const topState = allStates.reduce((max, state) => state.overall > max.overall ? state : max);
  const bottomState = allStates.reduce((min, state) => state.overall < min.overall ? state : min);
  
  // Calculate coverage inequality (Gini-like coefficient)
  const sortedValues = allStates.map(s => s.overall).sort((a, b) => a - b);
  const gini = sortedValues.reduce((acc, val, i) => acc + (2 * i - allStates.length + 1) * val, 0) / 
               (allStates.length * sortedValues.reduce((a, b) => a + b, 0));
  
  const highlightedState = highlighted ? vaccinationData[highlighted] : null;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full">
      <h3 className="text-white text-lg font-semibold mb-4">💡 Key Insights</h3>
      
      <div className="space-y-4">
        {/* National Total */}
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-3 rounded-lg border border-blue-400/30">
          <div className="text-blue-300 text-sm font-semibold">National Total</div>
          <div className="text-white font-bold text-xl">
            {new Intl.NumberFormat().format(totalVaccinations)}
          </div>
          <div className="text-gray-400 text-xs">vaccinations administered</div>
        </div>

        {/* Performance Extremes */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-lg border border-green-400/30">
            <div className="text-green-300 text-xs font-semibold">Highest</div>
            <div className="text-white font-bold text-sm truncate" title={topState.name}>
              {topState.name}
            </div>
            <div className="text-gray-400 text-xs">
              {new Intl.NumberFormat().format(topState.overall)}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-3 rounded-lg border border-red-400/30">
            <div className="text-red-300 text-xs font-semibold">Lowest</div>
            <div className="text-white font-bold text-sm truncate" title={bottomState.name}>
              {bottomState.name}
            </div>
            <div className="text-gray-400 text-xs">
              {new Intl.NumberFormat().format(bottomState.overall)}
            </div>
          </div>

        {/* Coverage Distribution */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-lg border border-purple-400/30">
          <div className="text-purple-300 text-sm font-semibold">Coverage Spread</div>
          <div className="text-white text-sm mt-1">
            {gini < 0.3 ? 'Well Distributed' : gini < 0.5 ? 'Moderate Variation' : 'High Variation'}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full" 
              style={{ width: `${gini * 100}%` }}
            ></div>
          </div>
          <div className="text-gray-400 text-xs mt-1 text-center">
            Lower = More equal distribution
          </div>
        </div>

        {/* Highlighted State Insight */}
        {highlightedState && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 p-3 rounded-lg border border-yellow-400/30 animate-fade-in">
            <div className="text-yellow-300 text-sm font-semibold">Selected State</div>
            <div className="text-white font-bold text-lg">{highlightedState.name}</div>
            <div className="text-gray-300 text-sm mt-1">
              Contributes {((highlightedState.overall / totalVaccinations) * 100).toFixed(1)}% to national total
            </div>
          </div>
        )}

        {!highlightedState && (
          <div className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 p-4 rounded-lg border border-gray-400/30 text-center">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-gray-300 text-sm">
              Select a state for detailed insights
            </div>
          </div>
        )}
      </div>
    </div>
  );
}