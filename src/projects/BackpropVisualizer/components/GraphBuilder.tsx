import { useState, useCallback, useEffect } from 'react';
import {
  ComputationGraph,
  ComputationNode,
  InputNode,
  ParameterNode,
  MultiplyNode,
  AddNode,
  SubtractNode,
  MaxNode,
  SigmoidNode,
  ReLUNode,
  SquareNode,
  NodeType,
} from '../core/ComputationGraph';
import { ExecutionEngine } from '../core/ExecutionEngine';
import ComputationGraphVisualizer from './ComputationGraphVisualizer';
import EquationPanel from './EquationPanel';
import StepController from './StepController';

interface NodeConfig {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  value?: number;
  inputs?: string[]; // IDs of input nodes
}

interface EdgeConfig {
  from: string;
  to: string;
  inputIndex: number; // Which input slot (0 or 1)
}

const NODE_TYPES = [
  { type: 'input' as NodeType, label: 'Input', color: '#60a5fa', requiresInputs: 0 },
  { type: 'parameter' as NodeType, label: 'Parameter', color: '#8b5cf6', requiresInputs: 0 },
  { type: 'multiply' as NodeType, label: 'Multiply (×)', color: '#10b981', requiresInputs: 2 },
  { type: 'add' as NodeType, label: 'Add (+)', color: '#10b981', requiresInputs: 2 },
  { type: 'subtract' as NodeType, label: 'Subtract (−)', color: '#10b981', requiresInputs: 2 },
  { type: 'max' as NodeType, label: 'Max', color: '#10b981', requiresInputs: 2 },
  { type: 'sigmoid' as NodeType, label: 'Sigmoid (σ)', color: '#f59e0b', requiresInputs: 1 },
  { type: 'relu' as NodeType, label: 'ReLU', color: '#f59e0b', requiresInputs: 1 },
  { type: 'square' as NodeType, label: 'Square (x²)', color: '#f59e0b', requiresInputs: 1 },
];

export default function GraphBuilder() {
  const [nodes, setNodes] = useState<NodeConfig[]>([]);
  const [edges, setEdges] = useState<EdgeConfig[]>([]);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);
  const [connectionMode, setConnectionMode] = useState<{
    active: boolean;
    fromNodeId: string | null;
    toNodeId: string | null;
    inputSlot: number;
  }>({
    active: false,
    fromNodeId: null,
    toNodeId: null,
    inputSlot: 0,
  });
  const [outputNodeId, setOutputNodeId] = useState<string | null>(null);
  const [nextNodeId, setNextNodeId] = useState(1);

  // Track counters for each node type
  const [typeCounters, setTypeCounters] = useState<Map<NodeType, number>>(new Map());

  // Execution state
  const [builtGraph, setBuiltGraph] = useState<ComputationGraph | null>(null);
  const [engine, setEngine] = useState<ExecutionEngine | null>(null);
  const [executionState, setExecutionState] = useState<any>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [isVisualizingMode, setIsVisualizingMode] = useState(false);
  const [showGradients, setShowGradients] = useState(false);

  // Store gradients for display
  const [nodeGradients, setNodeGradients] = useState<Map<string, number>>(new Map());

  // Instructions visibility
  const [showInstructions, setShowInstructions] = useState(true);

  // Status message
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [outputValue, setOutputValue] = useState<number | null>(null);

  // Add node to canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedNodeType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const typeInfo = NODE_TYPES.find(t => t.type === selectedNodeType);

    // Get or initialize counter for this type
    const currentCount = typeCounters.get(selectedNodeType) || 0;
    const newCount = currentCount + 1;

    // Create readable name based on type
    let nodeName = '';
    if (selectedNodeType === 'input') {
      nodeName = `x${newCount}`;
    } else if (selectedNodeType === 'parameter') {
      nodeName = `w${newCount}`;
    } else {
      nodeName = `${typeInfo?.label || selectedNodeType}${newCount}`;
    }

    const newNode: NodeConfig = {
      id: `node${nextNodeId}`,
      type: selectedNodeType,
      name: nodeName,
      x,
      y,
      value: selectedNodeType === 'input' || selectedNodeType === 'parameter' ? 1.0 : undefined,
      inputs: [],
    };

    setNodes([...nodes, newNode]);
    setNextNodeId(nextNodeId + 1);

    // Update type counter
    const newCounters = new Map(typeCounters);
    newCounters.set(selectedNodeType, newCount);
    setTypeCounters(newCounters);

    setSelectedNodeType(null);
  };

  // Start connection
  const handleNodeClick = (nodeId: string) => {
    if (!connectionMode.active) {
      setConnectionMode({
        active: true,
        fromNodeId: nodeId,
        toNodeId: null,
        inputSlot: 0,
      });
    } else if (connectionMode.fromNodeId && connectionMode.fromNodeId !== nodeId) {
      // Complete connection
      const toNode = nodes.find(n => n.id === nodeId);
      const typeInfo = NODE_TYPES.find(t => t.type === toNode?.type);

      if (typeInfo && typeInfo.requiresInputs > 0) {
        const existingConnections = edges.filter(e => e.to === nodeId);
        if (existingConnections.length < typeInfo.requiresInputs) {
          setEdges([
            ...edges,
            {
              from: connectionMode.fromNodeId,
              to: nodeId,
              inputIndex: existingConnections.length,
            },
          ]);
        }
      }

      setConnectionMode({
        active: false,
        fromNodeId: null,
        toNodeId: null,
        inputSlot: 0,
      });
    }
  };

  // Cancel connection
  const cancelConnection = () => {
    setConnectionMode({
      active: false,
      fromNodeId: null,
      toNodeId: null,
      inputSlot: 0,
    });
  };

  // Delete node
  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.from !== nodeId && e.to !== nodeId));
    if (outputNodeId === nodeId) setOutputNodeId(null);
  };

  // Update node value
  const updateNodeValue = (nodeId: string, value: number) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, value } : n));
  };

  // Update node displayed values from computation graph
  const updateNodeValuesFromGraph = (graph: ComputationGraph) => {
    const updatedNodes = nodes.map(nodeConfig => {
      const computedNode = graph.nodes.get(nodeConfig.id);
      if (computedNode) {
        return { ...nodeConfig, value: computedNode.value };
      }
      return nodeConfig;
    });
    setNodes(updatedNodes);
  };

  // Calculate dynamic dimensions based on node positions
  const calculateGraphDimensions = () => {
    if (nodes.length === 0) return { width: 600, height: 400 };

    const padding = 100; // Space around the graph
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));

    const width = Math.max(600, maxX - minX + padding * 2);
    const height = Math.max(400, maxY - minY + padding * 2);

    return { width, height };
  };

  // Update gradients from computation graph
  const updateGradientsFromGraph = (graph: ComputationGraph) => {
    const gradMap = new Map<string, number>();
    for (const [id, node] of graph.nodes) {
      gradMap.set(id, node.gradient);
    }
    setNodeGradients(gradMap);
    setShowGradients(true);
  };

  // Step controls for visualization
  const handleStepForward = useCallback(() => {
    if (engine && engine.stepForward()) {
      setExecutionState(engine.getState());
    }
  }, [engine]);

  const handleStepBackward = useCallback(() => {
    if (engine && engine.stepBackward()) {
      setExecutionState(engine.getState());
    }
  }, [engine]);

  const handleReset = useCallback(() => {
    if (engine) {
      engine.reset();
      engine.executeForward();
      setExecutionState(engine.getState());
    }
  }, [engine]);

  const handleJumpToStep = useCallback((step: number) => {
    if (engine) {
      engine.jumpToStep(step);
      setExecutionState(engine.getState());
    }
  }, [engine]);

  // Keyboard shortcuts for step-by-step mode
  useEffect(() => {
    if (!isVisualizingMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
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
  }, [isVisualizingMode, handleStepForward, handleStepBackward, handleReset]);

  // Build and execute graph
  const buildGraph = (): ComputationGraph | null => {
    try {
      const graph = new ComputationGraph();
      const nodeMap = new Map<string, ComputationNode>();

      // Create all nodes first
      for (const nodeConfig of nodes) {
        let node: ComputationNode | null = null;

        if (nodeConfig.type === 'input') {
          node = new InputNode(nodeConfig.id, nodeConfig.name, nodeConfig.value || 0);
        } else if (nodeConfig.type === 'parameter') {
          node = new ParameterNode(nodeConfig.id, nodeConfig.name, nodeConfig.value || 0);
        }

        if (node) {
          node.x = nodeConfig.x;
          node.y = nodeConfig.y;
          nodeMap.set(nodeConfig.id, node);
          graph.addNode(node);
        }
      }

      // Create operation nodes (need inputs)
      for (const nodeConfig of nodes) {
        if (nodeConfig.type !== 'input' && nodeConfig.type !== 'parameter') {
          const nodeEdges = edges.filter(e => e.to === nodeConfig.id);
          nodeEdges.sort((a, b) => a.inputIndex - b.inputIndex);

          const inputs = nodeEdges.map(e => nodeMap.get(e.from)).filter(n => n) as ComputationNode[];

          let node: ComputationNode | null = null;

          if (nodeConfig.type === 'multiply' && inputs.length === 2) {
            node = new MultiplyNode(nodeConfig.id, nodeConfig.name, inputs[0], inputs[1]);
          } else if (nodeConfig.type === 'add' && inputs.length === 2) {
            node = new AddNode(nodeConfig.id, nodeConfig.name, inputs[0], inputs[1]);
          } else if (nodeConfig.type === 'subtract' && inputs.length === 2) {
            node = new SubtractNode(nodeConfig.id, nodeConfig.name, inputs[0], inputs[1]);
          } else if (nodeConfig.type === 'max' && inputs.length === 2) {
            node = new MaxNode(nodeConfig.id, nodeConfig.name, inputs[0], inputs[1]);
          } else if (nodeConfig.type === 'sigmoid' && inputs.length === 1) {
            node = new SigmoidNode(nodeConfig.id, nodeConfig.name, inputs[0]);
          } else if (nodeConfig.type === 'relu' && inputs.length === 1) {
            node = new ReLUNode(nodeConfig.id, nodeConfig.name, inputs[0]);
          } else if (nodeConfig.type === 'square' && inputs.length === 1) {
            node = new SquareNode(nodeConfig.id, nodeConfig.name, inputs[0]);
          }

          if (node) {
            node.x = nodeConfig.x;
            node.y = nodeConfig.y;
            nodeMap.set(nodeConfig.id, node);
            graph.addNode(node);
          }
        }
      }

      // Set output node
      if (outputNodeId && nodeMap.has(outputNodeId)) {
        graph.setOutput(nodeMap.get(outputNodeId)!);
      }

      return graph;
    } catch (error) {
      console.error('Error building graph:', error);
      return null;
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setOutputNodeId(null);
    setNextNodeId(1);
    setTypeCounters(new Map());
  };

  // Save graph to localStorage
  const saveGraph = () => {
    const graphData = {
      nodes,
      edges,
      outputNodeId,
      nextNodeId,
      typeCounters: Array.from(typeCounters.entries()), // Convert Map to array for JSON
    };
    const name = prompt('Enter a name for this graph:');
    if (name) {
      const savedGraphs = JSON.parse(localStorage.getItem('customGraphs') || '{}');
      savedGraphs[name] = graphData;
      localStorage.setItem('customGraphs', JSON.stringify(savedGraphs));
      alert(`Graph "${name}" saved successfully!`);
    }
  };

  // Load graph from localStorage
  const loadGraph = () => {
    const savedGraphs = JSON.parse(localStorage.getItem('customGraphs') || '{}');
    const names = Object.keys(savedGraphs);

    if (names.length === 0) {
      alert('No saved graphs found.');
      return;
    }

    const name = prompt(`Enter graph name to load:\n\nAvailable graphs:\n${names.join('\n')}`);
    if (name && savedGraphs[name]) {
      const graphData = savedGraphs[name];
      setNodes(graphData.nodes);
      setEdges(graphData.edges);
      setOutputNodeId(graphData.outputNodeId);
      setNextNodeId(graphData.nextNodeId);

      // Restore type counters (handle old saved graphs without this field)
      if (graphData.typeCounters) {
        setTypeCounters(new Map(graphData.typeCounters));
      } else {
        setTypeCounters(new Map());
      }

      alert(`Graph "${name}" loaded successfully!`);
    } else if (name) {
      alert(`Graph "${name}" not found.`);
    }
  };

  return (
    <div className="space-y-4">
      {!isVisualizingMode && (
        <>
      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc] mb-3">
          Node Palette
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {NODE_TYPES.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => setSelectedNodeType(nodeType.type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedNodeType === nodeType.type
                  ? 'ring-2 ring-blue-500 scale-105'
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: selectedNodeType === nodeType.type ? nodeType.color : `${nodeType.color}40`,
                color: selectedNodeType === nodeType.type ? 'white' : nodeType.color,
              }}
            >
              {nodeType.label}
            </button>
          ))}
        </div>
        {selectedNodeType && (
          <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
            Click on the canvas below to place a {NODE_TYPES.find(t => t.type === selectedNodeType)?.label} node
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full p-4 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
            📚 How to Use
          </h4>
          <svg
            className={`w-5 h-5 text-blue-900 dark:text-blue-300 transition-transform ${
              showInstructions ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showInstructions && (
          <div className="px-4 pb-4">
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Select a node type from the palette above</li>
              <li>Click on the canvas to place the node</li>
              <li>Click a node to start connecting, then click another node to complete the connection</li>
              <li>Set values for input/parameter nodes using the sliders</li>
              <li><strong>Mark one node as output</strong> (click "Out" button below node - required!)</li>
              <li>Click <strong>"Forward Pass"</strong> to see computed values (blue badges above nodes)</li>
              <li>Click <strong>"Backprop"</strong> to compute gradients (orange badges below nodes)</li>
              <li>Click <strong>"Step-by-Step"</strong> for detailed visualization with equations</li>
            </ol>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc]">
            Canvas
          </h3>
          <div className="flex gap-2">
            {connectionMode.active && (
              <button
                onClick={cancelConnection}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Cancel Connection
              </button>
            )}
            <button
              onClick={saveGraph}
              disabled={nodes.length === 0}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={loadGraph}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Load
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All
            </button>
          </div>
        </div>

        <div
          onClick={handleCanvasClick}
          className="relative w-full h-[600px] bg-gray-50 dark:bg-gray-900 rounded border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-crosshair overflow-auto"
        >
          {/* Draw edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <marker
                id="arrowhead-builder"
                viewBox="0 0 10 10"
                refX={10}
                refY={5}
                markerWidth={6}
                markerHeight={6}
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
            </defs>
            {edges.map((edge, idx) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              // Calculate offset to edge of circle (radius = 32px = half of 64px node)
              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const angle = Math.atan2(dy, dx);
              const radius = 32;

              const x1 = fromNode.x + radius * Math.cos(angle);
              const y1 = fromNode.y + radius * Math.sin(angle);
              const x2 = toNode.x - radius * Math.cos(angle);
              const y2 = toNode.y - radius * Math.sin(angle);

              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#3b82f6"
                    strokeWidth={3}
                    markerEnd="url(#arrowhead-builder)"
                  />
                  {/* Edge label showing connection order */}
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2}
                    fill="#3b82f6"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {edge.inputIndex + 1}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Draw nodes */}
          {nodes.map((node) => {
            const typeInfo = NODE_TYPES.find(t => t.type === node.type);
            return (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.id);
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 ${
                  connectionMode.active && connectionMode.fromNodeId === node.id
                    ? 'ring-4 ring-yellow-400'
                    : ''
                } ${outputNodeId === node.id ? 'ring-4 ring-green-400' : ''}`}
                style={{ left: node.x, top: node.y }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg"
                  style={{ backgroundColor: typeInfo?.color }}
                >
                  {node.name}
                </div>

                {/* Value display above node */}
                {node.value !== undefined && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                    v={node.value.toFixed(2)}
                  </div>
                )}

                {/* Gradient display below node name */}
                {showGradients && nodeGradients.has(node.id) && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                    ∂L={nodeGradients.get(node.id)?.toFixed(3)}
                  </div>
                )}

                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOutputNodeId(node.id);
                    }}
                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    title="Set as output"
                  >
                    Out
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}

          {nodes.length === 0 && !selectedNodeType && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
              Select a node type and click to place it on the canvas
            </div>
          )}
        </div>
      </div>

      {/* Input value controls */}
      {nodes.some(n => n.type === 'input' || n.type === 'parameter') && (
        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc] mb-3">
            Input Values
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {nodes
              .filter(n => n.type === 'input' || n.type === 'parameter')
              .map((node) => (
                <div key={node.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {node.name} = {node.value?.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    value={node.value || 0}
                    onChange={(e) => updateNodeValue(node.id, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {(nodes.some(n => n.value !== undefined) || showGradients) && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-center gap-6 text-xs">
          {nodes.some(n => n.value !== undefined) && (
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white px-2 py-1 rounded font-bold">v=0.00</div>
              <span className="text-gray-700 dark:text-gray-300">Forward values</span>
            </div>
          )}
          {showGradients && (
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 text-white px-2 py-1 rounded font-bold">∂L=0.000</div>
              <span className="text-gray-700 dark:text-gray-300">Gradients (backprop)</span>
            </div>
          )}
        </div>
      )}

      {/* Status message display */}
      {statusMessage && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
          <span className="text-blue-800 dark:text-blue-200">{statusMessage}</span>
          {outputValue !== null && (
            <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
              Output = {outputValue.toFixed(3)}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => {
            const graph = buildGraph();
            if (graph) {
              const result = graph.forward();
              updateNodeValuesFromGraph(graph);
              setShowGradients(false);
              setOutputValue(result);
              setStatusMessage('✅ Forward pass complete!');
            } else {
              setStatusMessage('❌ Failed to build graph. Make sure all operations have correct inputs and output is set.');
              alert('Failed to build graph. Make sure all operation nodes have the correct number of inputs and an output node is set.');
            }
          }}
          disabled={!outputNodeId || nodes.length === 0}
          className="px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Forward Pass
        </button>
        <button
          onClick={() => {
            const graph = buildGraph();
            if (graph) {
              const result = graph.forward();
              updateNodeValuesFromGraph(graph);
              graph.backward();
              updateGradientsFromGraph(graph);
              setOutputValue(result);
              setStatusMessage('✅ Backpropagation complete! Orange badges show gradients.');
            } else {
              setStatusMessage('❌ Failed to build graph. Make sure all operations have correct inputs and output is set.');
              alert('Failed to build graph. Make sure all operation nodes have the correct number of inputs and an output node is set.');
            }
          }}
          disabled={!outputNodeId || nodes.length === 0}
          className="px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Backprop
        </button>
        <button
          onClick={() => {
            const graph = buildGraph();
            if (graph) {
              const newEngine = new ExecutionEngine(graph);
              newEngine.executeForward();
              updateNodeValuesFromGraph(graph);
              setBuiltGraph(graph);
              setEngine(newEngine);
              setExecutionState(newEngine.getState());
              setIsVisualizingMode(true);
            } else {
              alert('Failed to build graph. Make sure all operation nodes have the correct number of inputs and an output node is set.');
            }
          }}
          disabled={!outputNodeId || nodes.length === 0}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Step-by-Step
        </button>
      </div>
      </>
      )}

      {/* Visualization Section */}
      {isVisualizingMode && builtGraph && engine && executionState && (
        <>
          <div className="pt-8 border-t border-gray-200 dark:border-[#2d3748]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#f8fafc]">
                Execution Visualization
              </h3>
              <button
                onClick={() => {
                  setIsVisualizingMode(false);
                  setBuiltGraph(null);
                  setEngine(null);
                  setExecutionState(null);
                }}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Back to Editor
              </button>
            </div>

            {/* Layout with side controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Graph Visualization */}
              <div className="lg:col-span-3">
                <ComputationGraphVisualizer
                  graph={builtGraph}
                  executionState={executionState}
                  width={calculateGraphDimensions().width}
                  height={calculateGraphDimensions().height}
                />
              </div>

              {/* Step Controller - Sidebar */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-4">
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
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-200">
                    <strong>⌨️ Keyboard Shortcuts:</strong>
                    <div className="mt-2 space-y-1">
                      <div>→ Next step</div>
                      <div>← Previous step</div>
                      <div>R Reset</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Equation Panel - Full Width Below */}
            <div className="mb-8">
              <EquationPanel
                currentStep={engine.getCurrentStep()}
                stepNumber={executionState.currentStep}
                totalSteps={executionState.totalSteps}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
