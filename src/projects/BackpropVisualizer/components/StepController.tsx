import { useState, useEffect } from 'react';

interface StepControllerProps {
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onJumpToStep: (step: number) => void;
  isAtStart: boolean;
  isAtEnd: boolean;
  currentStep: number;
  totalSteps: number;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
}

export default function StepController({
  onStepForward,
  onStepBackward,
  onReset,
  onJumpToStep,
  isAtStart,
  isAtEnd,
  currentStep,
  totalSteps,
  playbackSpeed,
  onPlaybackSpeedChange,
}: StepControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    if (isAtEnd) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      onStepForward();
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, isAtEnd, onStepForward, playbackSpeed, currentStep]);

  const handlePlayPause = () => {
    if (isAtEnd) {
      onReset();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    onStepForward();
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    onStepBackward();
  };

  const handleReset = () => {
    setIsPlaying(false);
    onReset();
  };

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc]">
        Playback Controls
      </h3>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Previous */}
        <button
          onClick={handleStepBackward}
          disabled={isAtStart}
          className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous Step"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          disabled={isAtEnd && !isPlaying}
          className="p-4 rounded-full bg-[#2563eb] dark:bg-[#60a5fa] text-white hover:bg-[#1d4ed8] dark:hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Next */}
        <button
          onClick={handleStepForward}
          disabled={isAtEnd}
          className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next Step"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
      >
        Reset
      </button>

      {/* Playback Speed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Playback Speed
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {playbackSpeed}ms
          </span>
        </div>
        <input
          type="range"
          min="200"
          max="2000"
          step="100"
          value={playbackSpeed}
          onChange={(e) => onPlaybackSpeedChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Jump to Step
        </label>
        <input
          type="range"
          min="-1"
          max={totalSteps - 1}
          value={currentStep}
          onChange={(e) => {
            setIsPlaying(false);
            onJumpToStep(Number(e.target.value));
          }}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Start</span>
          <span>End</span>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="pt-4 border-t border-gray-200 dark:border-[#2d3748]">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
          Keyboard Shortcuts
        </div>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>Space</span>
            <span className="text-gray-400 dark:text-gray-500">Play/Pause</span>
          </div>
          <div className="flex items-center justify-between">
            <span>→</span>
            <span className="text-gray-400 dark:text-gray-500">Next Step</span>
          </div>
          <div className="flex items-center justify-between">
            <span>←</span>
            <span className="text-gray-400 dark:text-gray-500">Previous Step</span>
          </div>
          <div className="flex items-center justify-between">
            <span>R</span>
            <span className="text-gray-400 dark:text-gray-500">Reset</span>
          </div>
        </div>
      </div>
    </div>
  );
}
