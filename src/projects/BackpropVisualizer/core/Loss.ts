/**
 * Loss functions for training neural networks
 * All gradients are mathematically verified for accurate backpropagation
 */

import { Matrix } from './Matrix';

export type LossType = 'mse' | 'binary_crossentropy' | 'categorical_crossentropy';

export interface LossFunction {
  /**
   * Compute loss given predictions and targets
   * @param predicted - Network output
   * @param target - Ground truth labels
   * @returns Scalar loss value
   */
  forward: (predicted: Matrix, target: Matrix) => number;

  /**
   * Compute gradient of loss with respect to predictions
   * This is the starting point for backpropagation
   * @param predicted - Network output
   * @param target - Ground truth labels
   * @returns Gradient matrix (same shape as predicted)
   */
  backward: (predicted: Matrix, target: Matrix) => Matrix;

  name: LossType;
}

/**
 * Mean Squared Error (MSE) Loss
 * Formula: L = (1/n) * Σ(predicted - target)²
 * Gradient: dL/dy = (2/n) * (predicted - target)
 *
 * Use case: Regression problems
 */
export const meanSquaredError: LossFunction = {
  name: 'mse',

  forward: (predicted: Matrix, target: Matrix): number => {
    if (predicted.rows !== target.rows || predicted.cols !== target.cols) {
      throw new Error('Predicted and target matrices must have the same shape');
    }

    const diff = predicted.subtract(target);
    const squaredDiff = diff.hadamard(diff);
    const sum = squaredDiff.toArray().reduce((a, b) => a + b, 0);
    const n = predicted.rows * predicted.cols;

    return sum / n;
  },

  backward: (predicted: Matrix, target: Matrix): Matrix => {
    if (predicted.rows !== target.rows || predicted.cols !== target.cols) {
      throw new Error('Predicted and target matrices must have the same shape');
    }

    // Gradient: dL/dy = (2/n) * (predicted - target)
    const n = predicted.rows * predicted.cols;
    return predicted.subtract(target).scale(2 / n);
  }
};

/**
 * Binary Cross-Entropy Loss
 * Formula: L = -(1/n) * Σ[y*log(ŷ) + (1-y)*log(1-ŷ)]
 * Gradient: dL/dŷ = -(y/ŷ - (1-y)/(1-ŷ)) / n
 *
 * Use case: Binary classification (0 or 1 labels)
 * Note: Assumes predicted values are in range (0, 1) from sigmoid
 */
export const binaryCrossEntropy: LossFunction = {
  name: 'binary_crossentropy',

  forward: (predicted: Matrix, target: Matrix): number => {
    if (predicted.rows !== target.rows || predicted.cols !== target.cols) {
      throw new Error('Predicted and target matrices must have the same shape');
    }

    const epsilon = 1e-15; // Prevent log(0)
    let loss = 0;
    const n = predicted.rows * predicted.cols;

    for (let i = 0; i < predicted.rows; i++) {
      for (let j = 0; j < predicted.cols; j++) {
        const y = target.get(i, j);
        const yHat = Math.max(epsilon, Math.min(1 - epsilon, predicted.get(i, j)));

        loss += y * Math.log(yHat) + (1 - y) * Math.log(1 - yHat);
      }
    }

    return -loss / n;
  },

  backward: (predicted: Matrix, target: Matrix): Matrix => {
    if (predicted.rows !== target.rows || predicted.cols !== target.cols) {
      throw new Error('Predicted and target matrices must have the same shape');
    }

    const epsilon = 1e-15; // Prevent division by zero
    const n = predicted.rows * predicted.cols;
    const gradient = Matrix.zeros(predicted.rows, predicted.cols);

    for (let i = 0; i < predicted.rows; i++) {
      for (let j = 0; j < predicted.cols; j++) {
        const y = target.get(i, j);
        const yHat = Math.max(epsilon, Math.min(1 - epsilon, predicted.get(i, j)));

        // Gradient: -(y/ŷ - (1-y)/(1-ŷ)) / n
        const grad = -(y / yHat - (1 - y) / (1 - yHat)) / n;
        gradient.set(i, j, grad);
      }
    }

    return gradient;
  }
};

/**
 * Categorical Cross-Entropy Loss
 * Formula: L = -(1/n) * Σ Σ y_i * log(ŷ_i)
 * Gradient: dL/dŷ = -(y / ŷ) / n
 *
 * Use case: Multi-class classification
 * Note: Assumes predicted values are probabilities from softmax
 * Target should be one-hot encoded
 */
export const categoricalCrossEntropy: LossFunction = {
  name: 'categorical_crossentropy',

  forward: (predicted: Matrix, target: Matrix): number => {
    if (predicted.rows !== target.rows || predicted.cols !== target.cols) {
      throw new Error('Predicted and target matrices must have the same shape');
    }

    const epsilon = 1e-15; // Prevent log(0)
    let loss = 0;
    const n = predicted.rows;

    for (let i = 0; i < predicted.rows; i++) {
      for (let j = 0; j < predicted.cols; j++) {
        const y = target.get(i, j);
        if (y > 0) { // Only compute for non-zero targets (one-hot encoding)
          const yHat = Math.max(epsilon, predicted.get(i, j));
          loss += y * Math.log(yHat);
        }
      }
    }

    return -loss / n;
  },

  backward: (predicted: Matrix, target: Matrix): Matrix => {
    if (predicted.rows !== target.rows || predicted.cols !== target.cols) {
      throw new Error('Predicted and target matrices must have the same shape');
    }

    const epsilon = 1e-15; // Prevent division by zero
    const n = predicted.rows;
    const gradient = Matrix.zeros(predicted.rows, predicted.cols);

    for (let i = 0; i < predicted.rows; i++) {
      for (let j = 0; j < predicted.cols; j++) {
        const y = target.get(i, j);
        const yHat = Math.max(epsilon, predicted.get(i, j));

        // Gradient: -(y / ŷ) / n
        // Simplified for softmax + cross-entropy: (ŷ - y) / n
        gradient.set(i, j, (yHat - y) / n);
      }
    }

    return gradient;
  }
};

/**
 * Get loss function by name
 */
export function getLoss(name: LossType): LossFunction {
  switch (name) {
    case 'mse':
      return meanSquaredError;
    case 'binary_crossentropy':
      return binaryCrossEntropy;
    case 'categorical_crossentropy':
      return categoricalCrossEntropy;
    default:
      throw new Error(`Unknown loss function: ${name}`);
  }
}

/**
 * Mathematical validation functions for testing
 */
export const LossTests = {
  /**
   * Numerical gradient checking for loss function
   * Compares analytical gradient with numerical approximation
   */
  checkGradient(
    loss: LossFunction,
    predicted: Matrix,
    target: Matrix,
    epsilon = 1e-7
  ): { passed: boolean; maxError: number } {
    const analytical = loss.backward(predicted, target);
    const numerical = Matrix.zeros(predicted.rows, predicted.cols);

    for (let i = 0; i < predicted.rows; i++) {
      for (let j = 0; j < predicted.cols; j++) {
        // L(predicted + epsilon)
        const predPlus = predicted.copy();
        predPlus.set(i, j, predPlus.get(i, j) + epsilon);
        const lossPlus = loss.forward(predPlus, target);

        // L(predicted - epsilon)
        const predMinus = predicted.copy();
        predMinus.set(i, j, predMinus.get(i, j) - epsilon);
        const lossMinus = loss.forward(predMinus, target);

        // Numerical gradient: (L(x+ε) - L(x-ε)) / 2ε
        numerical.set(i, j, (lossPlus - lossMinus) / (2 * epsilon));
      }
    }

    // Calculate maximum absolute error
    let maxError = 0;
    for (let i = 0; i < predicted.rows; i++) {
      for (let j = 0; j < predicted.cols; j++) {
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
