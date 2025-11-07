/**
 * Computational Graph for visualizing and understanding backpropagation
 * Each operation is a node that knows how to compute forward and backward
 */

export type NodeType =
  | 'input'
  | 'parameter'
  | 'multiply'
  | 'add'
  | 'sigmoid'
  | 'relu'
  | 'square'
  | 'subtract'
  | 'sum'
  | 'max';

export interface ComputationStep {
  nodeId: string;
  operation: string;
  inputs: { name: string; value: number }[];
  output: number;
  equation: string;
  explanation: string;
}

export interface GradientStep {
  nodeId: string;
  operation: string;
  localGradient: number;
  incomingGradient: number;
  outgoingGradients: { target: string; value: number }[];
  equation: string;
  explanation: string;
}

/**
 * Base class for computation nodes
 */
export abstract class ComputationNode {
  id: string;
  type: NodeType;
  name: string;
  value: number = 0;
  gradient: number = 0;
  inputs: ComputationNode[] = [];

  // For visualization
  x: number = 0;
  y: number = 0;
  isActive: boolean = false;

  constructor(id: string, type: NodeType, name: string) {
    this.id = id;
    this.type = type;
    this.name = name;
  }

  abstract forward(): number;
  abstract backward(upstreamGradient: number): void;
  abstract getForwardEquation(): string;
  abstract getBackwardEquation(): string;
  abstract getExplanation(): string;
}

/**
 * Input node - holds input values
 */
export class InputNode extends ComputationNode {
  constructor(id: string, name: string, value: number = 0) {
    super(id, 'input', name);
    this.value = value;
  }

  forward(): number {
    return this.value;
  }

  backward(upstreamGradient: number): void {
    this.gradient = upstreamGradient;
  }

  getForwardEquation(): string {
    return `${this.name} = ${this.value.toFixed(3)}`;
  }

  getBackwardEquation(): string {
    return `∂L/∂${this.name} = ${this.gradient.toFixed(3)}`;
  }

  getExplanation(): string {
    return `Input variable ${this.name}`;
  }

  setValue(val: number): void {
    this.value = val;
  }
}

/**
 * Parameter node - holds trainable parameters (weights, biases)
 */
export class ParameterNode extends ComputationNode {
  constructor(id: string, name: string, value: number = 0) {
    super(id, 'parameter', name);
    this.value = value;
  }

  forward(): number {
    return this.value;
  }

  backward(upstreamGradient: number): void {
    this.gradient = upstreamGradient;
  }

  getForwardEquation(): string {
    return `${this.name} = ${this.value.toFixed(3)}`;
  }

  getBackwardEquation(): string {
    return `∂L/∂${this.name} = ${this.gradient.toFixed(3)}`;
  }

  getExplanation(): string {
    return `Parameter ${this.name} (trainable)`;
  }

  setValue(val: number): void {
    this.value = val;
  }

  update(learningRate: number): void {
    this.value -= learningRate * this.gradient;
  }
}

/**
 * Multiply node: z = x * y
 * Gradient: ∂L/∂x = y * ∂L/∂z, ∂L/∂y = x * ∂L/∂z
 */
export class MultiplyNode extends ComputationNode {
  constructor(id: string, name: string, input1: ComputationNode, input2: ComputationNode) {
    super(id, 'multiply', name);
    this.inputs = [input1, input2];
  }

  forward(): number {
    this.value = this.inputs[0].value * this.inputs[1].value;
    return this.value;
  }

  backward(upstreamGradient: number): void {
    this.gradient = upstreamGradient;

    // ∂L/∂x = y * ∂L/∂z
    const gradInput1 = this.inputs[1].value * upstreamGradient;
    // ∂L/∂y = x * ∂L/∂z
    const gradInput2 = this.inputs[0].value * upstreamGradient;

    this.inputs[0].backward(gradInput1);
    this.inputs[1].backward(gradInput2);
  }

  getForwardEquation(): string {
    const [x, y] = this.inputs;
    return `${this.name} = ${x.name} × ${y.name} = ${x.value.toFixed(3)} × ${y.value.toFixed(3)} = ${this.value.toFixed(3)}`;
  }

  getBackwardEquation(): string {
    const [x, y] = this.inputs;
    return `∂L/∂${x.name} = ${y.name} × ∂L/∂${this.name} = ${y.value.toFixed(3)} × ${this.gradient.toFixed(3)} = ${(y.value * this.gradient).toFixed(3)}`;
  }

  getExplanation(): string {
    return `Multiplication: output = input1 × input2. Gradient multiplies by the other input.`;
  }
}

/**
 * Add node: z = x + y
 * Gradient: ∂L/∂x = ∂L/∂z, ∂L/∂y = ∂L/∂z
 */
export class AddNode extends ComputationNode {
  constructor(id: string, name: string, input1: ComputationNode, input2: ComputationNode) {
    super(id, 'add', name);
    this.inputs = [input1, input2];
  }

  forward(): number {
    this.value = this.inputs[0].value + this.inputs[1].value;
    return this.value;
  }

  backward(upstreamGradient: number): void {
    this.gradient = upstreamGradient;

    // Addition distributes gradient equally
    this.inputs[0].backward(upstreamGradient);
    this.inputs[1].backward(upstreamGradient);
  }

  getForwardEquation(): string {
    const [x, y] = this.inputs;
    return `${this.name} = ${x.name} + ${y.name} = ${x.value.toFixed(3)} + ${y.value.toFixed(3)} = ${this.value.toFixed(3)}`;
  }

  getBackwardEquation(): string {
    const [x, _y] = this.inputs;
    return `∂L/∂${x.name} = ∂L/∂${this.name} = ${this.gradient.toFixed(3)}`;
  }

  getExplanation(): string {
    return `Addition: output = input1 + input2. Gradient passes through unchanged.`;
  }
}

/**
 * Sigmoid node: σ(x) = 1 / (1 + e^(-x))
 * Gradient: ∂L/∂x = σ(x) * (1 - σ(x)) * ∂L/∂σ
 */
export class SigmoidNode extends ComputationNode {
  constructor(id: string, name: string, input: ComputationNode) {
    super(id, 'sigmoid', name);
    this.inputs = [input];
  }

  forward(): number {
    this.value = 1 / (1 + Math.exp(-this.inputs[0].value));
    return this.value;
  }

  backward(upstreamGradient: number): void {
    this.gradient = upstreamGradient;

    // Local gradient: σ'(x) = σ(x) * (1 - σ(x))
    const localGrad = this.value * (1 - this.value);

    this.inputs[0].backward(localGrad * upstreamGradient);
  }

  getForwardEquation(): string {
    const x = this.inputs[0];
    return `${this.name} = σ(${x.name}) = 1/(1+e^(-${x.value.toFixed(3)})) = ${this.value.toFixed(3)}`;
  }

  getBackwardEquation(): string {
    const x = this.inputs[0];
    const localGrad = this.value * (1 - this.value);
    return `∂L/∂${x.name} = σ'(${x.name}) × ∂L/∂${this.name} = ${localGrad.toFixed(3)} × ${this.gradient.toFixed(3)} = ${(localGrad * this.gradient).toFixed(3)}`;
  }

  getExplanation(): string {
    return `Sigmoid activation: σ(x) = 1/(1+e^(-x)). Gradient: σ'(x) = σ(x)(1-σ(x))`;
  }
}

/**
 * ReLU node: ReLU(x) = max(0, x)
 * Gradient: ∂L/∂x = ∂L/∂ReLU if x > 0, else 0
 */
export class ReLUNode extends ComputationNode {
  constructor(id: string, name: string, input: ComputationNode) {
    super(id, 'relu', name);
    this.inputs = [input];
  }

  forward(): number {
    this.value = Math.max(0, this.inputs[0].value);
    return this.value;
  }

  backward(upstreamGradient: number): void {
    this.gradient = upstreamGradient;

    // Local gradient: 1 if x > 0, else 0
    const localGrad = this.inputs[0].value > 0 ? 1 : 0;

    this.inputs[0].backward(localGrad * upstreamGradient);
  }

  getForwardEquation(): string {
    const x = this.inputs[0];
    return `${this.name} = ReLU(${x.name}) = max(0, ${x.value.toFixed(3)}) = ${this.value.toFixed(3)}`;
  }

  getBackwardEquation(): string {
    const x = this.inputs[0];
    const localGrad = this.inputs[0].value > 0 ? 1 : 0;
    return `∂L/∂${x.name} = ${localGrad} × ∂L/∂${this.name} = ${localGrad} × ${this.gradient.toFixed(3)} = ${(localGrad * this.gradient).toFixed(3)}`;
  }

  getExplanation(): string {
    return `ReLU: max(0, x). Gradient: 1 if x > 0, else 0 (gate)`;
  }
}

/**
 * Square node: z = x²
 * Gradient: ∂L/∂x = 2x * ∂L/∂z
 */
export class SquareNode extends ComputationNode {
  constructor(id: string, name: string, input: ComputationNode) {
    super(id, 'square', name);
    this.inputs = [input];
  }

  forward(): number {
    this.value = this.inputs[0].value ** 2;
    return this.value;
  }

  backward(upstreamGradient: number): void {
    this.gradient = upstreamGradient;

    // Local gradient: 2x
    const localGrad = 2 * this.inputs[0].value;

    this.inputs[0].backward(localGrad * upstreamGradient);
  }

  getForwardEquation(): string {
    const x = this.inputs[0];
    return `${this.name} = ${x.name}² = (${x.value.toFixed(3)})² = ${this.value.toFixed(3)}`;
  }

  getBackwardEquation(): string {
    const x = this.inputs[0];
    const localGrad = 2 * this.inputs[0].value;
    return `∂L/∂${x.name} = 2×${x.name} × ∂L/∂${this.name} = ${localGrad.toFixed(3)} × ${this.gradient.toFixed(3)} = ${(localGrad * this.gradient).toFixed(3)}`;
  }

  getExplanation(): string {
    return `Square: x². Local gradient: 2x (power rule)`;
  }
}

/**
 * Subtract node: z = x - y
 * Gradient: ∂L/∂x = ∂L/∂z, ∂L/∂y = -∂L/∂z
 */
export class SubtractNode extends ComputationNode {
  constructor(id: string, name: string, input1: ComputationNode, input2: ComputationNode) {
    super(id, 'subtract', name);
    this.inputs = [input1, input2];
  }

  forward(): number {
    this.value = this.inputs[0].value - this.inputs[1].value;
    return this.value;
  }

  backward(upstreamGradient: number): void {
    this.gradient = upstreamGradient;

    // Gradient passes through to first input
    this.inputs[0].backward(upstreamGradient);
    // Negated gradient to second input
    this.inputs[1].backward(-upstreamGradient);
  }

  getForwardEquation(): string {
    const [x, y] = this.inputs;
    return `${this.name} = ${x.name} - ${y.name} = ${x.value.toFixed(3)} - ${y.value.toFixed(3)} = ${this.value.toFixed(3)}`;
  }

  getBackwardEquation(): string {
    const [x, y] = this.inputs;
    return `∂L/∂${x.name} = ${this.gradient.toFixed(3)}, ∂L/∂${y.name} = -${this.gradient.toFixed(3)}`;
  }

  getExplanation(): string {
    return `Subtraction: x - y. First input gets gradient, second gets negated gradient.`;
  }
}

/**
 * Max node: z = max(x, y)
 * Gradient: Flows only to the input that was maximum
 * ∂L/∂x = ∂L/∂z if x > y, else 0
 * ∂L/∂y = ∂L/∂z if y > x, else 0
 */
export class MaxNode extends ComputationNode {
  private maxIndex: number = 0; // Track which input was max

  constructor(id: string, name: string, input1: ComputationNode, input2: ComputationNode) {
    super(id, 'max', name);
    this.inputs = [input1, input2];
  }

  forward(): number {
    const val1 = this.inputs[0].value;
    const val2 = this.inputs[1].value;

    if (val1 > val2) {
      this.maxIndex = 0;
      this.value = val1;
    } else {
      this.maxIndex = 1;
      this.value = val2;
    }

    return this.value;
  }

  backward(upstreamGradient: number): void {
    this.gradient = upstreamGradient;

    // Gradient flows only to the input that was maximum
    if (this.maxIndex === 0) {
      this.inputs[0].backward(upstreamGradient);
      this.inputs[1].backward(0);
    } else {
      this.inputs[0].backward(0);
      this.inputs[1].backward(upstreamGradient);
    }
  }

  getForwardEquation(): string {
    const [x, y] = this.inputs;
    return `${this.name} = max(${x.name}, ${y.name}) = max(${x.value.toFixed(3)}, ${y.value.toFixed(3)}) = ${this.value.toFixed(3)}`;
  }

  getBackwardEquation(): string {
    const [x, y] = this.inputs;
    const winner = this.maxIndex === 0 ? x.name : y.name;
    return `∂L/∂${winner} = ${this.gradient.toFixed(3)} (gradient flows to max input only)`;
  }

  getExplanation(): string {
    const winner = this.maxIndex === 0 ? this.inputs[0].name : this.inputs[1].name;
    return `Max operation: Gradient flows only to the input that was larger (${winner}), like a gate.`;
  }
}

/**
 * Computation Graph - manages all nodes and execution
 */
export class ComputationGraph {
  nodes: Map<string, ComputationNode> = new Map();
  executionOrder: ComputationNode[] = [];
  outputNode: ComputationNode | null = null;

  addNode(node: ComputationNode): void {
    this.nodes.set(node.id, node);
  }

  setOutput(node: ComputationNode): void {
    this.outputNode = node;
    this.computeExecutionOrder();
  }

  private computeExecutionOrder(): void {
    // Topological sort for forward pass
    const visited = new Set<string>();
    const order: ComputationNode[] = [];

    const visit = (node: ComputationNode) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);

      for (const input of node.inputs) {
        visit(input);
      }

      order.push(node);
    };

    if (this.outputNode) {
      visit(this.outputNode);
    }

    this.executionOrder = order;
  }

  forward(): number {
    for (const node of this.executionOrder) {
      node.forward();
    }
    return this.outputNode ? this.outputNode.value : 0;
  }

  backward(): void {
    if (!this.outputNode) return;

    // Start with gradient 1.0 at output
    this.outputNode.backward(1.0);
  }

  getForwardSteps(): ComputationStep[] {
    const steps: ComputationStep[] = [];

    for (const node of this.executionOrder) {
      steps.push({
        nodeId: node.id,
        operation: node.type,
        inputs: node.inputs.map(input => ({
          name: input.name,
          value: input.value,
        })),
        output: node.value,
        equation: node.getForwardEquation(),
        explanation: node.getExplanation(),
      });
    }

    return steps;
  }

  reset(): void {
    for (const node of this.nodes.values()) {
      node.gradient = 0;
      node.isActive = false;
    }
  }
}
