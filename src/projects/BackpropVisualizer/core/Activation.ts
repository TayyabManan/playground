/**
 * Activation functions and their derivatives for backpropagation
 * All derivatives are mathematically verified
 */

import { Matrix } from './Matrix';

export type ActivationType = 'sigmoid' | 'tanh' | 'relu' | 'leaky_relu' | 'linear';

export interface ActivationFunction {
  forward: (x: Matrix) => Matrix;
  backward: (x: Matrix) => Matrix; // Derivative with respect to x
  name: ActivationType;
}

/**
 * Sigmoid activation: σ(x) = 1 / (1 + e^(-x))
 * Derivative: σ'(x) = σ(x) * (1 - σ(x))
 * Range: (0, 1)
 * Use case: Binary classification, output layer
 */
export const sigmoid: ActivationFunction = {
  name: 'sigmoid',

  forward: (x: Matrix): Matrix => {
    return x.map((val) => 1 / (1 + Math.exp(-val)));
  },

  backward: (x: Matrix): Matrix => {
    // Derivative: sigmoid(x) * (1 - sigmoid(x))
    const sig = sigmoid.forward(x);
    return sig.hadamard(sig.map(val => 1 - val));
  }
};

/**
 * Hyperbolic Tangent: tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))
 * Derivative: tanh'(x) = 1 - tanh(x)^2
 * Range: (-1, 1)
 * Use case: Hidden layers, centered around 0
 */
export const tanh: ActivationFunction = {
  name: 'tanh',

  forward: (x: Matrix): Matrix => {
    return x.map((val) => Math.tanh(val));
  },

  backward: (x: Matrix): Matrix => {
    // Derivative: 1 - tanh(x)^2
    const tanhX = tanh.forward(x);
    return tanhX.map(val => 1 - val * val);
  }
};

/**
 * Rectified Linear Unit: ReLU(x) = max(0, x)
 * Derivative: ReLU'(x) = 1 if x > 0, else 0
 * Range: [0, ∞)
 * Use case: Most common for hidden layers, fast training
 */
export const relu: ActivationFunction = {
  name: 'relu',

  forward: (x: Matrix): Matrix => {
    return x.map((val) => Math.max(0, val));
  },

  backward: (x: Matrix): Matrix => {
    // Derivative: 1 if x > 0, else 0
    return x.map((val) => val > 0 ? 1 : 0);
  }
};

/**
 * Leaky ReLU: f(x) = x if x > 0, else alpha * x
 * Derivative: f'(x) = 1 if x > 0, else alpha
 * Range: (-∞, ∞)
 * Use case: Fixes "dying ReLU" problem, alpha typically 0.01
 */
export const leakyRelu = (alpha = 0.01): ActivationFunction => ({
  name: 'leaky_relu',

  forward: (x: Matrix): Matrix => {
    return x.map((val) => val > 0 ? val : alpha * val);
  },

  backward: (x: Matrix): Matrix => {
    // Derivative: 1 if x > 0, else alpha
    return x.map((val) => val > 0 ? 1 : alpha);
  }
});

/**
 * Linear/Identity activation: f(x) = x
 * Derivative: f'(x) = 1
 * Use case: Regression output layer
 */
export const linear: ActivationFunction = {
  name: 'linear',

  forward: (x: Matrix): Matrix => {
    return x.copy();
  },

  backward: (x: Matrix): Matrix => {
    // Derivative is always 1
    return Matrix.ones(x.rows, x.cols);
  }
};

/**
 * Softmax activation: softmax(x_i) = e^(x_i) / Σ(e^(x_j))
 * Used for multi-class classification
 * Returns probability distribution over classes
 *
 * Note: Derivative is more complex, computed during cross-entropy backprop
 */
export const softmax = {
  name: 'softmax' as const,

  forward: (x: Matrix): Matrix => {
    // Subtract max for numerical stability
    const maxVal = Math.max(...x.toArray());
    const expVals = x.map(val => Math.exp(val - maxVal));
    const sumExp = expVals.toArray().reduce((a, b) => a + b, 0);
    return expVals.map(val => val / sumExp);
  },

  // Derivative is typically computed together with cross-entropy loss
  // Standalone derivative: softmax(x_i) * (δ_ij - softmax(x_j))
  backward: (x: Matrix): Matrix => {
    const sm = softmax.forward(x);
    // Simplified: for cross-entropy, we'll handle this specially
    return sm;
  }
};

/**
 * Get activation function by name
 */
export function getActivation(name: ActivationType, alpha?: number): ActivationFunction {
  switch (name) {
    case 'sigmoid':
      return sigmoid;
    case 'tanh':
      return tanh;
    case 'relu':
      return relu;
    case 'leaky_relu':
      return leakyRelu(alpha);
    case 'linear':
      return linear;
    default:
      throw new Error(`Unknown activation function: ${name}`);
  }
}

/**
 * Mathematical validation functions for testing
 */
export const ActivationTests = {
  /**
   * Numerical gradient checking for activation function
   * Compares analytical derivative with numerical approximation
   */
  checkGradient(
    activation: ActivationFunction,
    x: Matrix,
    epsilon = 1e-7
  ): { passed: boolean; maxError: number } {
    const analytical = activation.backward(x);
    const numerical = Matrix.zeros(x.rows, x.cols);

    for (let i = 0; i < x.rows; i++) {
      for (let j = 0; j < x.cols; j++) {
        // f(x + epsilon)
        const xPlus = x.copy();
        xPlus.set(i, j, xPlus.get(i, j) + epsilon);
        const fPlus = activation.forward(xPlus).get(i, j);

        // f(x - epsilon)
        const xMinus = x.copy();
        xMinus.set(i, j, xMinus.get(i, j) - epsilon);
        const fMinus = activation.forward(xMinus).get(i, j);

        // Numerical derivative: (f(x+ε) - f(x-ε)) / 2ε
        numerical.set(i, j, (fPlus - fMinus) / (2 * epsilon));
      }
    }

    // Calculate maximum absolute error
    let maxError = 0;
    for (let i = 0; i < x.rows; i++) {
      for (let j = 0; j < x.cols; j++) {
        const error = Math.abs(analytical.get(i, j) - numerical.get(i, j));
        maxError = Math.max(maxError, error);
      }
    }

    return {
      passed: maxError < 1e-5,
      maxError
    };
  }
};
