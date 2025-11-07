import { StepInfo } from '../core/ExecutionEngine';

interface EquationPanelProps {
  currentStep: StepInfo | null;
  stepNumber: number;
  totalSteps: number;
}

export default function EquationPanel({
  currentStep,
  stepNumber,
  totalSteps,
}: EquationPanelProps) {
  if (!currentStep) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc] mb-4">
          Current Step
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Click "Start" or "Next" to begin stepping through the computation
        </div>
      </div>
    );
  }

  const isForward = currentStep.mode === 'forward';
  const modeColor = isForward ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400';
  const modeIcon = isForward ? '→' : '←';
  const modeLabel = isForward ? 'Forward Pass' : 'Backward Pass';

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc]">
          Current Step
        </h3>
        <div className={`text-sm font-semibold ${modeColor}`}>
          {modeIcon} {modeLabel}
        </div>
      </div>

      {/* Step Counter */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Step {stepNumber + 1} of {totalSteps}</span>
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {currentStep.nodeName}
        </span>
      </div>

      {/* Equation Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Equation
        </div>
        <div className="font-mono text-lg text-gray-900 dark:text-[#f8fafc] break-words">
          {currentStep.equation}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Explanation
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {currentStep.explanation}
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(currentStep.values).map(([key, value]) => (
          <div
            key={key}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {key}
            </div>
            <div className="text-lg font-mono font-semibold text-gray-900 dark:text-[#f8fafc]">
              {typeof value === 'number' ? value.toFixed(4) : value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="pt-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((stepNumber + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
