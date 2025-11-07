/**
 * Step-by-step execution engine for computational graphs
 * Allows users to step through forward and backward passes
 */

import { ComputationGraph } from './ComputationGraph';

export type ExecutionMode = 'forward' | 'backward' | 'idle';

export interface ExecutionState {
  mode: ExecutionMode;
  currentStep: number;
  totalSteps: number;
  activeNodes: Set<string>;
  steps: StepInfo[];
  isComplete: boolean;
}

export interface StepInfo {
  mode: 'forward' | 'backward';
  nodeId: string;
  nodeName: string;
  equation: string;
  explanation: string;
  values: { [key: string]: number };
  activeNodeIds: string[];
  activeEdgeIds: string[];
}

/**
 * Execution Engine - manages step-by-step execution of computational graph
 */
export class ExecutionEngine {
  private graph: ComputationGraph;
  private forwardSteps: StepInfo[] = [];
  private backwardSteps: StepInfo[] = [];
  private currentStepIndex: number = -1;
  private mode: ExecutionMode = 'idle';

  constructor(graph: ComputationGraph) {
    this.graph = graph;
    this.reset();
  }

  /**
   * Reset execution to beginning
   */
  reset(): void {
    this.currentStepIndex = -1;
    this.mode = 'idle';
    this.graph.reset();
    this.generateSteps();
  }

  /**
   * Generate all forward and backward steps
   */
  private generateSteps(): void {
    // Generate forward steps
    this.forwardSteps = [];
    const computationSteps = this.graph.getForwardSteps();

    for (const step of computationSteps) {
      // Get input node IDs
      const inputNodeIds = step.inputs.map(inp => {
        // Find node by name
        for (const [id, node] of this.graph.nodes) {
          if (node.name === inp.name) return id;
        }
        return '';
      }).filter(id => id !== '');

      // Get edge IDs (from inputs to this node)
      const edgeIds = inputNodeIds.map(inputId => `${inputId}-${step.nodeId}`);

      this.forwardSteps.push({
        mode: 'forward',
        nodeId: step.nodeId,
        nodeName: this.graph.nodes.get(step.nodeId)?.name || step.nodeId,
        equation: step.equation,
        explanation: step.explanation,
        values: {
          output: step.output,
          ...Object.fromEntries(step.inputs.map(inp => [inp.name, inp.value])),
        },
        activeNodeIds: [...inputNodeIds, step.nodeId],
        activeEdgeIds: edgeIds,
      });
    }

    // Generate backward steps (reverse order of forward)
    this.backwardSteps = [];
    const reverseOrder = [...this.graph.executionOrder].reverse();

    for (const node of reverseOrder) {
      const inputNodeIds = node.inputs.map(inp => inp.id);
      const edgeIds = inputNodeIds.map(inputId => `${node.id}-${inputId}`); // Reversed for backward

      this.backwardSteps.push({
        mode: 'backward',
        nodeId: node.id,
        nodeName: node.name,
        equation: node.getBackwardEquation(),
        explanation: `Computing gradients: ${node.getExplanation()}`,
        values: {
          gradient: node.gradient,
          value: node.value,
        },
        activeNodeIds: [node.id, ...inputNodeIds],
        activeEdgeIds: edgeIds,
      });
    }
  }

  /**
   * Execute forward pass completely (for initialization)
   */
  executeForward(): void {
    this.graph.forward();
    this.generateSteps();
  }

  /**
   * Execute backward pass completely (for initialization)
   */
  executeBackward(): void {
    this.graph.backward();
    this.generateSteps();
  }

  /**
   * Step forward one step
   */
  stepForward(): boolean {
    const allSteps = [...this.forwardSteps, ...this.backwardSteps];

    if (this.currentStepIndex >= allSteps.length - 1) {
      return false; // Already at end
    }

    this.currentStepIndex++;
    const currentStep = allSteps[this.currentStepIndex];

    // Update mode
    this.mode = currentStep.mode;

    // Execute the actual computation
    if (this.currentStepIndex < this.forwardSteps.length) {
      // Forward step - execute node
      const node = this.graph.nodes.get(currentStep.nodeId);
      if (node) {
        node.forward();
        node.isActive = true;
      }
    } else {
      // Backward step
      const backwardIndex = this.currentStepIndex - this.forwardSteps.length;
      if (backwardIndex === 0) {
        // First backward step - initialize with gradient 1.0
        this.graph.backward();
      }
      const node = this.graph.nodes.get(currentStep.nodeId);
      if (node) {
        node.isActive = true;
      }
    }

    return true;
  }

  /**
   * Step backward one step
   */
  stepBackward(): boolean {
    if (this.currentStepIndex < 0) {
      return false; // Already at beginning
    }

    // Deactivate current nodes
    const allSteps = [...this.forwardSteps, ...this.backwardSteps];
    const currentStep = allSteps[this.currentStepIndex];
    for (const nodeId of currentStep.activeNodeIds) {
      const node = this.graph.nodes.get(nodeId);
      if (node) node.isActive = false;
    }

    this.currentStepIndex--;

    if (this.currentStepIndex < 0) {
      this.mode = 'idle';
      this.graph.reset();
    } else {
      const newStep = allSteps[this.currentStepIndex];
      this.mode = newStep.mode;
    }

    return true;
  }

  /**
   * Jump to specific step
   */
  jumpToStep(stepIndex: number): void {
    const allSteps = [...this.forwardSteps, ...this.backwardSteps];

    if (stepIndex < 0 || stepIndex >= allSteps.length) {
      return;
    }

    // Reset and replay to target step
    this.currentStepIndex = -1;
    this.graph.reset();

    for (let i = 0; i <= stepIndex; i++) {
      this.stepForward();
    }
  }

  /**
   * Get current execution state
   */
  getState(): ExecutionState {
    const allSteps = [...this.forwardSteps, ...this.backwardSteps];
    const currentStep = this.currentStepIndex >= 0 ? allSteps[this.currentStepIndex] : null;

    const activeNodes = new Set<string>();
    if (currentStep) {
      currentStep.activeNodeIds.forEach(id => activeNodes.add(id));
    }

    return {
      mode: this.mode,
      currentStep: this.currentStepIndex,
      totalSteps: allSteps.length,
      activeNodes,
      steps: allSteps,
      isComplete: this.currentStepIndex === allSteps.length - 1,
    };
  }

  /**
   * Get current step info
   */
  getCurrentStep(): StepInfo | null {
    const allSteps = [...this.forwardSteps, ...this.backwardSteps];
    return this.currentStepIndex >= 0 && this.currentStepIndex < allSteps.length
      ? allSteps[this.currentStepIndex]
      : null;
  }

  /**
   * Get all steps (for timeline view)
   */
  getAllSteps(): StepInfo[] {
    return [...this.forwardSteps, ...this.backwardSteps];
  }

  /**
   * Check if at beginning
   */
  isAtStart(): boolean {
    return this.currentStepIndex < 0;
  }

  /**
   * Check if at end
   */
  isAtEnd(): boolean {
    const totalSteps = this.forwardSteps.length + this.backwardSteps.length;
    return this.currentStepIndex >= totalSteps - 1;
  }

  /**
   * Play through all steps with delay
   */
  async playAll(delayMs: number = 1000, onStep?: () => void): Promise<void> {
    while (!this.isAtEnd()) {
      this.stepForward();
      onStep?.();
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
