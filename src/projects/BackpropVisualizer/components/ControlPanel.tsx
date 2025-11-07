import { useState } from 'react';

interface ControlPanelProps {
  onTrain: () => void;
  onStep: () => void;
  onReset: () => void;
  onRunTests: () => void;
  learningRate: number;
  onLearningRateChange: (lr: number) => void;
  isTraining: boolean;
  showWeights: boolean;
  onShowWeightsChange: (show: boolean) => void;
  showGradients: boolean;
  onShowGradientsChange: (show: boolean) => void;
}

export default function ControlPanel({
  onTrain,
  onStep,
  onReset,
  onRunTests,
  learningRate,
  onLearningRateChange,
  isTraining,
  showWeights,
  onShowWeightsChange,
  showGradients,
  onShowGradientsChange,
}: ControlPanelProps) {
  const [epochs, setEpochs] = useState(100);

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-[#f8fafc]">
        Controls
      </h2>

      {/* Training Controls */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
          Training
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onStep}
            disabled={isTraining}
            className="px-4 py-2 bg-[#2563eb] dark:bg-[#60a5fa] text-white rounded-lg hover:bg-[#1d4ed8] dark:hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Single Step
          </button>

          <button
            onClick={onTrain}
            disabled={isTraining}
            className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isTraining ? 'Training...' : `Train ${epochs} Epochs`}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Epochs: {epochs}
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={epochs}
            onChange={(e) => setEpochs(Number(e.target.value))}
            disabled={isTraining}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>10</span>
            <span>1000</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Learning Rate: {learningRate.toFixed(4)}
          </label>
          <input
            type="range"
            min="0.001"
            max="1"
            step="0.001"
            value={learningRate}
            onChange={(e) => onLearningRateChange(Number(e.target.value))}
            disabled={isTraining}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0.001</span>
            <span>1.0</span>
          </div>
        </div>
      </div>

      {/* Visualization Controls */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
          Visualization
        </h3>

        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showWeights}
              onChange={(e) => onShowWeightsChange(e.target.checked)}
              className="w-4 h-4 text-[#2563eb] dark:text-[#60a5fa] border-gray-300 dark:border-gray-600 rounded focus:ring-[#2563eb] dark:focus:ring-[#60a5fa]"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show Weight Magnitudes
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showGradients}
              onChange={(e) => onShowGradientsChange(e.target.checked)}
              className="w-4 h-4 text-[#2563eb] dark:text-[#60a5fa] border-gray-300 dark:border-gray-600 rounded focus:ring-[#2563eb] dark:focus:ring-[#60a5fa]"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show Gradient Flow
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-[#2d3748]">
        <button
          onClick={onRunTests}
          disabled={isTraining}
          className="w-full px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          🧪 Run Math Tests
        </button>

        <button
          onClick={onReset}
          disabled={isTraining}
          className="w-full px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Reset Network
        </button>
      </div>

      {/* Legend */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-[#2d3748]">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
          Legend
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#60a5fa]"></div>
            <span className="text-gray-600 dark:text-gray-400">Input Layer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#8b5cf6]"></div>
            <span className="text-gray-600 dark:text-gray-400">Hidden Layer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
            <span className="text-gray-600 dark:text-gray-400">Output Layer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
