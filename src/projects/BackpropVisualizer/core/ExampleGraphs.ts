/**
 * Example computational graphs for learning backpropagation
 * Each example builds understanding progressively
 */

import {
  ComputationGraph,
  InputNode,
  ParameterNode,
  MultiplyNode,
  AddNode,
  SigmoidNode,
  SquareNode,
  SubtractNode,
  MaxNode,
} from './ComputationGraph';

export interface Example {
  id: string;
  name: string;
  description: string;
  graph: ComputationGraph;
  defaultInputs: { [key: string]: number };
}

/**
 * Example 1: Simple Multiplication
 * Demonstrates: Basic chain rule, how gradients multiply
 */
export function createMultiplicationExample(): Example {
  const graph = new ComputationGraph();

  // Create nodes
  const x = new InputNode('x', 'x', 2.0);
  const y = new InputNode('y', 'y', 3.0);
  const z = new MultiplyNode('z', 'z', x, y);

  // Build graph
  graph.addNode(x);
  graph.addNode(y);
  graph.addNode(z);
  graph.setOutput(z);

  // Position nodes for visualization
  x.x = 100;
  x.y = 150;
  y.x = 100;
  y.y = 250;
  z.x = 300;
  z.y = 200;

  return {
    id: 'multiply',
    name: 'Simple Multiplication',
    description: 'Learn how gradients flow through multiplication. Change x and y to see how ∂L/∂x = y and ∂L/∂y = x.',
    graph,
    defaultInputs: { x: 2.0, y: 3.0 },
  };
}

/**
 * Example 2: Addition
 * Demonstrates: How gradients pass through unchanged
 */
export function createAdditionExample(): Example {
  const graph = new ComputationGraph();

  const x = new InputNode('x', 'x', 2.0);
  const y = new InputNode('y', 'y', 3.0);
  const z = new AddNode('z', 'z', x, y);

  graph.addNode(x);
  graph.addNode(y);
  graph.addNode(z);
  graph.setOutput(z);

  x.x = 100;
  x.y = 150;
  y.x = 100;
  y.y = 250;
  z.x = 300;
  z.y = 200;

  return {
    id: 'add',
    name: 'Addition',
    description: 'See how addition distributes gradients equally: ∂L/∂x = ∂L/∂z and ∂L/∂y = ∂L/∂z.',
    graph,
    defaultInputs: { x: 2.0, y: 3.0 },
  };
}

/**
 * Example 3: Chain of Operations
 * Demonstrates: Chain rule in action
 */
export function createChainExample(): Example {
  const graph = new ComputationGraph();

  const x = new InputNode('x', 'x', 2.0);
  const y = new InputNode('y', 'y', 3.0);
  const c = new InputNode('c', 'c', 1.0);

  const mul = new MultiplyNode('mul', 'x×y', x, y);
  const z = new AddNode('z', 'z', mul, c);

  graph.addNode(x);
  graph.addNode(y);
  graph.addNode(c);
  graph.addNode(mul);
  graph.addNode(z);
  graph.setOutput(z);

  x.x = 80;
  x.y = 150;
  y.x = 80;
  y.y = 250;
  c.x = 220;
  c.y = 300;
  mul.x = 220;
  mul.y = 200;
  z.x = 380;
  z.y = 230;

  return {
    id: 'chain',
    name: 'Chain Rule',
    description: 'Watch the chain rule in action: z = (x×y) + c. Gradients flow backward through multiple operations.',
    graph,
    defaultInputs: { x: 2.0, y: 3.0, c: 1.0 },
  };
}

/**
 * Example 4: Simple Neuron
 * Demonstrates: Weighted sum with activation
 */
export function createNeuronExample(): Example {
  const graph = new ComputationGraph();

  const x = new InputNode('x', 'x', 0.5);
  const w = new ParameterNode('w', 'w', 2.0);
  const b = new ParameterNode('b', 'b', -1.0);

  const wx = new MultiplyNode('wx', 'w×x', w, x);
  const z = new AddNode('z', 'z', wx, b);
  const a = new SigmoidNode('a', 'σ(z)', z);

  graph.addNode(x);
  graph.addNode(w);
  graph.addNode(b);
  graph.addNode(wx);
  graph.addNode(z);
  graph.addNode(a);
  graph.setOutput(a);

  x.x = 80;
  x.y = 150;
  w.x = 80;
  w.y = 250;
  b.x = 280;
  b.y = 300;
  wx.x = 200;
  wx.y = 200;
  z.x = 300;
  z.y = 230;
  a.x = 450;
  a.y = 230;

  return {
    id: 'neuron',
    name: 'Simple Neuron',
    description: 'A single neuron: σ(w×x + b). See how gradients flow through activation functions and learn parameters w and b.',
    graph,
    defaultInputs: { x: 0.5, w: 2.0, b: -1.0 },
  };
}

/**
 * Example 5: Loss Computation
 * Demonstrates: How loss gradients are computed (MSE)
 */
export function createLossExample(): Example {
  const graph = new ComputationGraph();

  const pred = new InputNode('pred', 'ŷ', 0.8);
  const target = new InputNode('target', 'y', 1.0);

  const diff = new SubtractNode('diff', 'ŷ-y', pred, target);
  const loss = new SquareNode('loss', 'L', diff);

  graph.addNode(pred);
  graph.addNode(target);
  graph.addNode(diff);
  graph.addNode(loss);
  graph.setOutput(loss);

  pred.x = 100;
  pred.y = 150;
  target.x = 100;
  target.y = 250;
  diff.x = 280;
  diff.y = 200;
  loss.x = 450;
  loss.y = 200;

  return {
    id: 'loss',
    name: 'MSE Loss',
    description: 'Mean Squared Error: L = (ŷ-y)². Understand how the loss gradient ∂L/∂ŷ depends on the prediction error.',
    graph,
    defaultInputs: { pred: 0.8, target: 1.0 },
  };
}

/**
 * Example 6: XOR Gate Component
 * Demonstrates: More complex computation with multiple operations
 */
export function createXORComponentExample(): Example {
  const graph = new ComputationGraph();

  const x1 = new InputNode('x1', 'x₁', 1.0);
  const x2 = new InputNode('x2', 'x₂', 0.0);
  const w1 = new ParameterNode('w1', 'w₁', 1.5);
  const w2 = new ParameterNode('w2', 'w₂', 1.5);
  const b = new ParameterNode('b', 'b', -1.0);

  const w1x1 = new MultiplyNode('w1x1', 'w₁×x₁', w1, x1);
  const w2x2 = new MultiplyNode('w2x2', 'w₂×x₂', w2, x2);
  const sum = new AddNode('sum', 'Σ', w1x1, w2x2);
  const z = new AddNode('z', 'z', sum, b);
  const a = new SigmoidNode('a', 'σ(z)', z);

  graph.addNode(x1);
  graph.addNode(x2);
  graph.addNode(w1);
  graph.addNode(w2);
  graph.addNode(b);
  graph.addNode(w1x1);
  graph.addNode(w2x2);
  graph.addNode(sum);
  graph.addNode(z);
  graph.addNode(a);
  graph.setOutput(a);

  x1.x = 80;
  x1.y = 120;
  x2.x = 80;
  x2.y = 200;
  w1.x = 80;
  w1.y = 280;
  w2.x = 80;
  w2.y = 360;
  b.x = 380;
  b.y = 360;
  w1x1.x = 220;
  w1x1.y = 160;
  w2x2.x = 220;
  w2x2.y = 280;
  sum.x = 320;
  sum.y = 220;
  z.x = 420;
  z.y = 260;
  a.x = 550;
  a.y = 260;

  return {
    id: 'xor-component',
    name: 'XOR Component',
    description: 'A more complex neuron with 2 inputs. Part of solving XOR problem. Trace gradients through branching paths.',
    graph,
    defaultInputs: { x1: 1.0, x2: 0.0, w1: 1.5, w2: 1.5, b: -1.0 },
  };
}

/**
 * Example 7: Exam Q5 - Complex Expression
 * Demonstrates: f(x,y,z,w) = 2(xy + max(z,w))
 * Shows max operation, multiple paths, and chain rule through complex expression
 */
export function createQ5Example(): Example {
  const graph = new ComputationGraph();

  // Input nodes with values from Q5
  const x = new InputNode('x', 'x', 3.0);
  const y = new InputNode('y', 'y', -4.0);
  const z = new InputNode('z', 'z', 2.0);
  const w = new InputNode('w', 'w', -1.0);
  const two = new InputNode('const2', '2', 2.0); // Constant multiplier

  // Intermediate operations
  const xy = new MultiplyNode('xy', 'x×y', x, y);
  const maxzw = new MaxNode('maxzw', 'max(z,w)', z, w);
  const sum = new AddNode('sum', 'xy+max', xy, maxzw);
  const result = new MultiplyNode('result', 'f', sum, two);

  // Build graph
  graph.addNode(x);
  graph.addNode(y);
  graph.addNode(z);
  graph.addNode(w);
  graph.addNode(two);
  graph.addNode(xy);
  graph.addNode(maxzw);
  graph.addNode(sum);
  graph.addNode(result);
  graph.setOutput(result);

  // Position nodes for visualization (arrange in layers)
  // Layer 1: Inputs
  x.x = 80;
  x.y = 80;
  y.x = 80;
  y.y = 160;
  z.x = 80;
  z.y = 280;
  w.x = 80;
  w.y = 360;
  two.x = 420;
  two.y = 360;

  // Layer 2: First operations
  xy.x = 220;
  xy.y = 120;
  maxzw.x = 220;
  maxzw.y = 320;

  // Layer 3: Addition
  sum.x = 340;
  sum.y = 220;

  // Layer 4: Final multiplication
  result.x = 500;
  result.y = 260;

  return {
    id: 'q5-exam',
    name: 'Q5: f(x,y,z,w) = 2(xy + max(z,w))',
    description: 'Exam Question 5: Complex expression with max operation. Watch how gradients flow through multiple paths and the max gate.',
    graph,
    defaultInputs: { x: 3.0, y: -4.0, z: 2.0, w: -1.0 },
  };
}

/**
 * Get all examples
 */
export function getAllExamples(): Example[] {
  return [
    createMultiplicationExample(),
    createAdditionExample(),
    createChainExample(),
    createNeuronExample(),
    createLossExample(),
    createXORComponentExample(),
    createQ5Example(),
  ];
}

/**
 * Get example by ID
 */
export function getExampleById(id: string): Example | undefined {
  return getAllExamples().find(ex => ex.id === id);
}
