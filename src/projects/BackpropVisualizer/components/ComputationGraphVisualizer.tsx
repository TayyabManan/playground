import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ComputationGraph } from '../core/ComputationGraph';
import { ExecutionState } from '../core/ExecutionEngine';

interface ComputationGraphVisualizerProps {
  graph: ComputationGraph;
  executionState: ExecutionState;
  width?: number;
  height?: number;
  onNodeClick?: (nodeId: string) => void;
}

interface VisNode {
  id: string;
  name: string;
  type: string;
  value: number;
  gradient: number;
  x: number;
  y: number;
  isActive: boolean;
}

interface VisEdge {
  source: VisNode;
  target: VisNode;
  isActive: boolean;
}

export default function ComputationGraphVisualizer({
  graph,
  executionState,
  width = 600,
  height = 400,
  onNodeClick,
}: ComputationGraphVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
    equation: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
    equation: '',
  });

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare node data
    const nodes: VisNode[] = [];
    for (const [_id, node] of graph.nodes) {
      nodes.push({
        id: node.id,
        name: node.name,
        type: node.type,
        value: node.value,
        gradient: node.gradient,
        x: node.x,
        y: node.y,
        isActive: executionState.activeNodes.has(node.id),
      });
    }

    // Prepare edge data
    const edges: VisEdge[] = [];
    for (const node of graph.nodes.values()) {
      for (const input of node.inputs) {
        const sourceNode = nodes.find(n => n.id === input.id);
        const targetNode = nodes.find(n => n.id === node.id);

        if (sourceNode && targetNode) {
          const isActive = executionState.activeNodes.has(input.id) &&
                          executionState.activeNodes.has(node.id);

          edges.push({
            source: sourceNode,
            target: targetNode,
            isActive,
          });
        }
      }
    }

    // Calculate bounds for proper viewBox
    const padding = 80;
    let minX = 0, maxX = width, minY = 0, maxY = height;

    if (nodes.length > 0) {
      minX = Math.min(...nodes.map(n => n.x)) - padding;
      maxX = Math.max(...nodes.map(n => n.x)) + padding;
      minY = Math.min(...nodes.map(n => n.y)) - padding;
      maxY = Math.max(...nodes.map(n => n.y)) + padding;
    }

    const viewBoxWidth = maxX - minX;
    const viewBoxHeight = maxY - minY;

    // Set up SVG with dynamic viewBox
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add arrow marker for edges
    const defs = svg.append('defs');

    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#94a3b8');

    defs.append('marker')
      .attr('id', 'arrowhead-active')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#60a5fa');

    // Draw edges
    const edgeGroup = svg.append('g').attr('class', 'edges');

    edgeGroup.selectAll('line')
      .data(edges)
      .join('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', d => d.isActive ? '#60a5fa' : '#94a3b8')
      .attr('stroke-width', d => d.isActive ? 3 : 1.5)
      .attr('opacity', d => d.isActive ? 0.8 : 0.3)
      .attr('marker-end', d => d.isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)')
      .attr('class', 'transition-all duration-300');

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const nodeCircles = nodeGroup.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .attr('class', 'cursor-pointer')
      .on('click', (_event, d) => {
        onNodeClick?.(d.id);
      })
      .on('mouseenter', function(event, d) {
        const node = graph.nodes.get(d.id);
        if (!node) return;

        const equation = executionState.mode === 'backward'
          ? node.getBackwardEquation()
          : node.getForwardEquation();
        const explanation = node.getExplanation();

        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect) return;

        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          content: explanation,
          equation: equation,
        });
      })
      .on('mousemove', function(event) {
        setTooltip(prev => ({
          ...prev,
          x: event.clientX,
          y: event.clientY,
        }));
      })
      .on('mouseleave', function() {
        setTooltip({
          visible: false,
          x: 0,
          y: 0,
          content: '',
          equation: '',
        });
      });

    // Node circles
    nodeCircles.append('circle')
      .attr('r', 20)
      .attr('fill', d => {
        if (d.type === 'input') return '#60a5fa';
        if (d.type === 'parameter') return '#8b5cf6';
        return '#10b981';
      })
      .attr('stroke', d => d.isActive ? '#fbbf24' : '#fff')
      .attr('stroke-width', d => d.isActive ? 4 : 2)
      .attr('opacity', d => d.isActive ? 1 : 0.7)
      .attr('class', 'transition-all duration-300');

    // Node labels (name) - inside the circle
    nodeCircles.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('class', 'fill-white text-xs font-semibold')
      .text(d => d.name);

    // Value badge above node (always show if value exists)
    nodeCircles.filter(d => d.value !== undefined)
      .append('rect')
      .attr('x', -25)
      .attr('y', -38)
      .attr('width', 50)
      .attr('height', 16)
      .attr('rx', 3)
      .attr('fill', '#2563eb')
      .attr('opacity', 0.95);

    nodeCircles.filter(d => d.value !== undefined)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -27)
      .attr('class', 'fill-white text-[10px] font-bold')
      .text(d => `v=${d.value.toFixed(2)}`);

    // Gradient badge above value (during backward pass)
    nodeCircles.filter(d => executionState.mode === 'backward' && d.gradient !== 0)
      .append('rect')
      .attr('x', -30)
      .attr('y', -56)
      .attr('width', 60)
      .attr('height', 16)
      .attr('rx', 3)
      .attr('fill', '#ea580c')
      .attr('opacity', 0.95);

    nodeCircles.filter(d => executionState.mode === 'backward' && d.gradient !== 0)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -45)
      .attr('class', 'fill-white text-[10px] font-bold')
      .text(d => `∂L=${d.gradient.toFixed(3)}`);

    // Add legend for node types (positioned relative to viewBox, in top-right corner)
    const legendGroup = svg.append('g')
      .attr('transform', `translate(${maxX - 70}, ${minY + 5})`);

    const legendItems = [
      { label: 'Input', color: '#60a5fa' },
      { label: 'Parameter', color: '#8b5cf6' },
      { label: 'Operation', color: '#10b981' },
    ];

    legendItems.forEach((item, i) => {
      const g = legendGroup.append('g')
        .attr('transform', `translate(0, ${i * 18})`);

      g.append('circle')
        .attr('r', 4)
        .attr('fill', item.color);

      g.append('text')
        .attr('x', 10)
        .attr('dy', 3)
        .attr('class', 'fill-gray-700 dark:fill-gray-300 text-[10px]')
        .text(item.label);
    });

  }, [graph, executionState, width, height, onNodeClick]);

  return (
    <div ref={containerRef} className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc]">
          Computational Graph
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {executionState.mode === 'forward' && '→ Forward Pass'}
          {executionState.mode === 'backward' && '← Backward Pass'}
          {executionState.mode === 'idle' && 'Ready'}
        </div>
      </div>

      <svg
        ref={svgRef}
        className="w-full"
        style={{ maxHeight: height }}
      />

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Hover over nodes to see details • Blue badges = values • Orange badges = gradients
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.equation && (
        <div
          className="fixed z-[9999] bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl border-2 border-blue-500 max-w-sm pointer-events-none"
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y + 15}px`,
          }}
        >
          <div className="font-mono text-sm mb-2 text-blue-300 font-bold">
            {tooltip.equation}
          </div>
          <div className="text-xs text-gray-200 border-t border-gray-600 pt-2 mt-2">
            {tooltip.content}
          </div>
        </div>
      )}
    </div>
  );
}
