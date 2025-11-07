/**
 * Dense (Fully Connected) Layer implementation
 * Implements accurate forward and backward propagation
 */

import { Matrix } from './Matrix';
import { ActivationFunction, getActivation, ActivationType } from './Activation';

export interface LayerConfig {
  inputSize: number;
  outputSize: number;
  activation: ActivationType;
  useBias?: boolean;
}

/**
 * Dense/Fully Connected Layer
 *
 * Forward pass: y = activation(W * x + b)
 * Where:
 * - W: weight matrix (outputSize × inputSize)
 * - x: input vector (inputSize × 1)
 * - b: bias vector (outputSize × 1)
 * - y: output vector (outputSize × 1)
 */
export class Layer {
  inputSize: number;
  outputSize: number;
  weights: Matrix;          // W: (outputSize × inputSize)
  biases: Matrix;           // b: (outputSize × 1)
  activation: ActivationFunction;
  useBias: boolean;

  // Cache for backpropagation
  private lastInput: Matrix | null = null;
  private lastZ: Matrix | null = null;  // Pre-activation (W*x + b)
  private lastA: Matrix | null = null;  // Post-activation

  // Gradients
  private dWeights: Matrix | null = null;
  private dBiases: Matrix | null = null;

  constructor(config: LayerConfig) {
    this.inputSize = config.inputSize;
    this.outputSize = config.outputSize;
    this.activation = getActivation(config.activation);
    this.useBias = config.useBias !== false;

    // Initialize weights using Xavier/Glorot initialization
    // Helps prevent vanishing/exploding gradients
    this.weights = Matrix.random(this.outputSize, this.inputSize);

    // Initialize biases to zeros (common practice)
    this.biases = Matrix.zeros(this.outputSize, 1);
  }

  /**
   * Forward propagation through the layer
   *
   * Steps:
   * 1. Compute z = W * x + b (linear transformation)
   * 2. Compute a = activation(z)
   * 3. Cache values for backprop
   *
   * @param input - Input matrix (inputSize × batchSize)
   * @returns Output matrix (outputSize × batchSize)
   */
  forward(input: Matrix): Matrix {
    if (input.rows !== this.inputSize) {
      throw new Error(
        `Input size mismatch: expected ${this.inputSize}, got ${input.rows}`
      );
    }

    // Cache input for backprop
    this.lastInput = input.copy();

    // Step 1: Linear transformation z = W * x + b
    let z = this.weights.multiply(input);

    if (this.useBias) {
      // Broadcast bias to all batch samples
      for (let col = 0; col < z.cols; col++) {
        for (let row = 0; row < z.rows; row++) {
          z.set(row, col, z.get(row, col) + this.biases.get(row, 0));
        }
      }
    }

    // Cache pre-activation
    this.lastZ = z.copy();

    // Step 2: Apply activation function
    const a = this.activation.forward(z);

    // Cache activation
    this.lastA = a.copy();

    return a;
  }

  /**
   * Backward propagation through the layer
   *
   * Given gradient from next layer (dL/da), compute:
   * 1. dL/dz = dL/da ⊙ activation'(z)  (element-wise multiplication)
   * 2. dL/dW = dL/dz * x^T             (weight gradient)
   * 3. dL/db = sum(dL/dz) across batch (bias gradient)
   * 4. dL/dx = W^T * dL/dz             (input gradient for previous layer)
   *
   * @param dLoss - Gradient from next layer (outputSize × batchSize)
   * @returns Gradient for previous layer (inputSize × batchSize)
   */
  backward(dLoss: Matrix): Matrix {
    if (!this.lastInput || !this.lastZ || !this.lastA) {
      throw new Error('Forward pass must be called before backward pass');
    }

    if (dLoss.rows !== this.outputSize) {
      throw new Error(
        `Gradient size mismatch: expected ${this.outputSize}, got ${dLoss.rows}`
      );
    }

    const batchSize = this.lastInput.cols;

    // Step 1: Compute dL/dz = dL/da ⊙ activation'(z)
    // This applies the chain rule through the activation function
    const activationGradient = this.activation.backward(this.lastZ);
    const dZ = dLoss.hadamard(activationGradient);

    // Step 2: Compute weight gradient dL/dW = (1/m) * dL/dz * x^T
    // where m is batch size
    this.dWeights = dZ.multiply(this.lastInput.transpose()).scale(1 / batchSize);

    // Step 3: Compute bias gradient dL/db = (1/m) * sum(dL/dz) across batch
    if (this.useBias) {
      this.dBiases = Matrix.zeros(this.outputSize, 1);
      for (let row = 0; row < dZ.rows; row++) {
        let sum = 0;
        for (let col = 0; col < dZ.cols; col++) {
          sum += dZ.get(row, col);
        }
        this.dBiases.set(row, 0, sum / batchSize);
      }
    }

    // Step 4: Compute input gradient dL/dx = W^T * dL/dz
    // This gradient is passed to the previous layer
    const dInput = this.weights.transpose().multiply(dZ);

    return dInput;
  }

  /**
   * Update weights and biases using computed gradients
   *
   * Implements gradient descent:
   * W = W - learning_rate * dL/dW
   * b = b - learning_rate * dL/db
   *
   * @param learningRate - Step size for gradient descent
   */
  updateWeights(learningRate: number): void {
    if (!this.dWeights) {
      throw new Error('Backward pass must be called before updating weights');
    }

    // Update weights: W = W - lr * dW
    this.weights = this.weights.subtract(this.dWeights.scale(learningRate));

    // Update biases: b = b - lr * db
    if (this.useBias && this.dBiases) {
      this.biases = this.biases.subtract(this.dBiases.scale(learningRate));
    }
  }

  /**
   * Get layer parameters (for visualization)
   */
  getParameters(): {
    weights: Matrix;
    biases: Matrix;
    weightGradients: Matrix | null;
    biasGradients: Matrix | null;
  } {
    return {
      weights: this.weights.copy(),
      biases: this.biases.copy(),
      weightGradients: this.dWeights ? this.dWeights.copy() : null,
      biasGradients: this.dBiases ? this.dBiases.copy() : null,
    };
  }

  /**
   * Get cached values from forward/backward pass (for visualization)
   */
  getCachedValues(): {
    input: Matrix | null;
    preActivation: Matrix | null;
    activation: Matrix | null;
  } {
    return {
      input: this.lastInput ? this.lastInput.copy() : null,
      preActivation: this.lastZ ? this.lastZ.copy() : null,
      activation: this.lastA ? this.lastA.copy() : null,
    };
  }

  /**
   * Reset gradients (useful for batch processing)
   */
  resetGradients(): void {
    this.dWeights = null;
    this.dBiases = null;
  }

  /**
   * Get layer info for debugging
   */
  toString(): string {
    return `Layer(${this.inputSize} → ${this.outputSize}, activation: ${this.activation.name})`;
  }
}
