import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { getAllExamples, Example } from './core/ExampleGraphs';
import { ExecutionEngine } from './core/ExecutionEngine';
import ComputationGraphVisualizer from './components/ComputationGraphVisualizer';
import EquationPanel from './components/EquationPanel';
import StepController from './components/StepController';
import GraphBuilder from './components/GraphBuilder';
import { ComputationNode, InputNode, ParameterNode } from './core/ComputationGraph';

type ViewMode = 'examples' | 'builder';

export default function BackpropVisualizer() {
  const [viewMode, setViewMode] = useState<ViewMode>('examples');
  const [examples] = useState<Example[]>(getAllExamples());
  const [currentExample, setCurrentExample] = useState<Example>(examples[0]);
  const [engine, setEngine] = useState<ExecutionEngine>(
    new ExecutionEngine(examples[0].graph)
  );
  const [executionState, setExecutionState] = useState(engine.getState());
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  // Initialize with forward pass executed
  useEffect(() => {
    engine.executeForward();
    setExecutionState(engine.getState());
  }, []);

  // Handle example change
  const handleExampleChange = (exampleId: string) => {
    const example = examples.find(ex => ex.id === exampleId);
    if (!example) return;

    setCurrentExample(example);
    const newEngine = new ExecutionEngine(example.graph);
    newEngine.executeForward();
    setEngine(newEngine);
    setExecutionState(newEngine.getState());
  };

  // Handle input changes
  const handleInputChange = (nodeId: string, value: number) => {
    const node = currentExample.graph.nodes.get(nodeId);
    if (node && (node instanceof InputNode || node instanceof ParameterNode)) {
      node.setValue(value);
      engine.reset();
      engine.executeForward();
      setExecutionState(engine.getState());
    }
  };

  // Step controls
  const handleStepForward = useCallback(() => {
    if (engine.stepForward()) {
      setExecutionState(engine.getState());
    }
  }, [engine]);

  const handleStepBackward = useCallback(() => {
    if (engine.stepBackward()) {
      setExecutionState(engine.getState());
    }
  }, [engine]);

  const handleReset = useCallback(() => {
    engine.reset();
    engine.executeForward();
    setExecutionState(engine.getState());
  }, [engine]);

  const handleJumpToStep = useCallback((step: number) => {
    engine.jumpToStep(step);
    setExecutionState(engine.getState());
  }, [engine]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          handleStepForward();
          break;
        case 'ArrowLeft':
          handleStepBackward();
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStepForward, handleStepBackward, handleReset]);

  // Get input/parameter nodes for controls
  const inputNodes: ComputationNode[] = [];
  for (const node of currentExample.graph.nodes.values()) {
    if (node.type === 'input' || node.type === 'parameter') {
      inputNodes.push(node);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="text-[#2563eb] dark:text-[#60a5fa] hover:text-[#1d4ed8] dark:hover:text-[#2563eb] transition-colors inline-flex items-center gap-2"
          >
            <span>&larr;</span> Back to Home
          </Link>
        </div>

        {/* Title */}
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-[#f8fafc]">
            Backpropagation Visualizer
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-[#6b7280] max-w-3xl">
            Learn how backpropagation works by stepping through computational graphs.
            See the math, understand the chain rule, and watch gradients flow backward.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-[#2d3748] p-1 bg-gray-100 dark:bg-gray-800">
            <button
              onClick={() => setViewMode('examples')}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'examples'
                  ? 'bg-white dark:bg-[#1a1f2e] text-[#2563eb] dark:text-[#60a5fa] shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Pre-built Examples
            </button>
            <button
              onClick={() => setViewMode('builder')}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'builder'
                  ? 'bg-white dark:bg-[#1a1f2e] text-[#2563eb] dark:text-[#60a5fa] shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Custom Graph Builder
            </button>
          </div>
        </div>

        {/* Examples View */}
        {viewMode === 'examples' && (
          <>
        {/* Example Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Choose an Example
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => handleExampleChange(example.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  currentExample.id === example.id
                    ? 'border-[#2563eb] dark:border-[#60a5fa] bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-[#2d3748] hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-[#f8fafc] mb-1">
                  {example.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {example.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Controls */}
        {inputNodes.length > 0 && (
          <div className="mb-8 bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc] mb-4">
              Adjust Inputs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inputNodes.map((node) => (
                <div key={node.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {node.name} = {node.value.toFixed(2)}
                    {node.type === 'parameter' && (
                      <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                        (trainable)
                      </span>
                    )}
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={node.value}
                    onChange={(e) => handleInputChange(node.id, Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>-5</span>
                    <span>5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Graph Visualization */}
          <div className="lg:col-span-2">
            <ComputationGraphVisualizer
              graph={currentExample.graph}
              executionState={executionState}
              width={600}
              height={400}
            />
          </div>

          {/* Step Controller */}
          <div>
            <StepController
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onReset={handleReset}
              onJumpToStep={handleJumpToStep}
              isAtStart={engine.isAtStart()}
              isAtEnd={engine.isAtEnd()}
              currentStep={executionState.currentStep}
              totalSteps={executionState.totalSteps}
              playbackSpeed={playbackSpeed}
              onPlaybackSpeedChange={setPlaybackSpeed}
            />
          </div>
        </div>

        {/* Equation Panel */}
        <div className="mb-8">
          <EquationPanel
            currentStep={engine.getCurrentStep()}
            stepNumber={executionState.currentStep}
            totalSteps={executionState.totalSteps}
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            📚 How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Understanding Forward Pass
              </h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Each node computes a value from its inputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Values flow left to right through the graph</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Watch the equation show exactly what's computed</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Understanding Backward Pass
              </h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Gradients flow right to left (reverse of forward)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Each node multiplies incoming gradient by local gradient</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>This is the chain rule in action!</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Tips for Learning
              </h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Start with simple examples (multiply, add)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Step through slowly and read each equation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Try different input values to see how gradients change</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Interactive Features
              </h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Adjust input sliders to see immediate effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Use keyboard shortcuts (→ ← R Space)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Click play to auto-advance through steps</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc] mb-3">
            About This Tool
          </h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>
              This visualizer helps you understand backpropagation by showing the exact mathematical
              operations at each step. Unlike traditional neural network visualizers that only show
              training progress, this tool reveals the computational graph and lets you trace how
              values and gradients flow through it.
            </p>
            <p>
              <strong>Key Concepts:</strong> Computational graphs represent mathematical expressions
              as directed acyclic graphs. Each node is an operation, each edge carries a value.
              The forward pass computes the output, while the backward pass (backpropagation) computes
              gradients using the chain rule.
            </p>
            <p>
              <strong>Mathematical Accuracy:</strong> All gradient computations are verified using
              numerical gradient checking to ensure correctness.
            </p>
          </div>
        </div>
        </>
        )}

        {/* Custom Graph Builder View */}
        {viewMode === 'builder' && (
          <GraphBuilder />
        )}
      </div>
    </div>
  );
}
