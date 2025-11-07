import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NeuralNetwork } from '../core/NeuralNetwork';

interface NetworkGraphProps {
  network: NeuralNetwork;
  width?: number;
  height?: number;
  showWeights?: boolean;
  showGradients?: boolean;
}

interface Node {
  id: string;
  layerIndex: number;
  nodeIndex: number;
  x: number;
  y: number;
  value?: number;
  gradient?: number;
}

interface Edge {
  source: Node;
  target: Node;
  weight: number;
  gradient?: number;
}

export default function NetworkGraph({
  network,
  width = 800,
  height = 600,
  showWeights = false,
  showGradients = false,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Get network architecture
    const architecture = network.getArchitecture();

    // Create nodes
    const nodes: Node[] = [];
    const layerSizes: number[] = [architecture[0].inputSize, ...architecture.map(l => l.outputSize)];

    const layerSpacing = width / (layerSizes.length + 1);

    layerSizes.forEach((size, layerIndex) => {
      const nodeSpacing = height / (size + 1);

      for (let nodeIndex = 0; nodeIndex < size; nodeIndex++) {
        const x = layerSpacing * (layerIndex + 1);
        const y = height / 2 + (nodeIndex - (size - 1) / 2) * Math.min(nodeSpacing, 60);

        nodes.push({
          id: `L${layerIndex}N${nodeIndex}`,
          layerIndex,
          nodeIndex,
          x,
          y,
        });
      }
    });

    // Create edges
    const edges: Edge[] = [];
    for (let layerIdx = 0; layerIdx < layerSizes.length - 1; layerIdx++) {
      const sourceLayer = nodes.filter(n => n.layerIndex === layerIdx);
      const targetLayer = nodes.filter(n => n.layerIndex === layerIdx + 1);

      // Get weights from network
      const layer = network.layers[layerIdx];
      const params = layer.getParameters();

      sourceLayer.forEach((source) => {
        targetLayer.forEach((target) => {
          const weight = params.weights.get(target.nodeIndex, source.nodeIndex);
          const gradient = params.weightGradients?.get(target.nodeIndex, source.nodeIndex);

          edges.push({
            source,
            target,
            weight,
            gradient,
          });
        });
      });
    }

    // Set up SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Add gradient definitions for edges
    const defs = svg.append('defs');

    // Positive gradient (green)
    const gradientPos = defs.append('linearGradient')
      .attr('id', 'grad-pos')
      .attr('gradientUnits', 'userSpaceOnUse');
    gradientPos.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.8);
    gradientPos.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#059669')
      .attr('stop-opacity', 0.2);

    // Negative gradient (red)
    const gradientNeg = defs.append('linearGradient')
      .attr('id', 'grad-neg')
      .attr('gradientUnits', 'userSpaceOnUse');
    gradientNeg.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ef4444')
      .attr('stop-opacity', 0.8);
    gradientNeg.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#dc2626')
      .attr('stop-opacity', 0.2);

    // Draw edges
    const edgeGroup = svg.append('g').attr('class', 'edges');

    edgeGroup.selectAll('line')
      .data(edges)
      .join('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', d => {
        if (showGradients && d.gradient !== undefined) {
          return d.gradient > 0 ? 'url(#grad-pos)' : 'url(#grad-neg)';
        }
        return d.weight > 0 ? '#60a5fa' : '#ef4444';
      })
      .attr('stroke-width', d => {
        if (showWeights) {
          return Math.abs(d.weight) * 2 + 0.5;
        }
        return 1;
      })
      .attr('opacity', d => {
        if (showGradients && d.gradient !== undefined) {
          return Math.min(Math.abs(d.gradient) * 10 + 0.1, 0.8);
        }
        return 0.3;
      })
      .attr('class', 'transition-all duration-300');

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    nodeGroup.selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 12)
      .attr('fill', d => {
        if (d.layerIndex === 0) {
          return '#60a5fa'; // Input layer
        } else if (d.layerIndex === layerSizes.length - 1) {
          return '#10b981'; // Output layer
        } else {
          return '#8b5cf6'; // Hidden layers
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('class', 'cursor-pointer hover:scale-110 transition-transform')
      .append('title')
      .text(d => `Layer ${d.layerIndex}, Node ${d.nodeIndex}`);

    // Add layer labels
    const labelGroup = svg.append('g').attr('class', 'labels');

    layerSizes.forEach((size, layerIndex) => {
      const x = layerSpacing * (layerIndex + 1);

      labelGroup.append('text')
        .attr('x', x)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('class', 'fill-gray-700 dark:fill-gray-300 text-sm font-semibold')
        .text(() => {
          if (layerIndex === 0) return 'Input';
          if (layerIndex === layerSizes.length - 1) return 'Output';
          return `Hidden ${layerIndex}`;
        });

      labelGroup.append('text')
        .attr('x', x)
        .attr('y', height - 20)
        .attr('text-anchor', 'middle')
        .attr('class', 'fill-gray-500 dark:fill-gray-400 text-xs')
        .text(`${size} nodes`);
    });

  }, [network, width, height, showWeights, showGradients]);

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] p-4">
      <svg
        ref={svgRef}
        className="w-full"
        style={{ maxHeight: height }}
      />
    </div>
  );
}
