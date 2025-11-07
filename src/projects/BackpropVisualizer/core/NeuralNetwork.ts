/**
 * Neural Network implementation with complete backpropagation
 * Orchestrates layers, training, and tracks all intermediate values
 */

import { Matrix } from './Matrix';
import { Layer } from './Layer';
import { LossFunction, getLoss, LossType } from './Loss';
import { ActivationType } from './Activation';

export interface NetworkConfig {
  layers: Array<{
    outputSize: number;
    activation: ActivationType;
  }>;
  inputSize: number;
  loss: LossType;
  learningRate?: number;
}

export interface TrainingHistory {
  epoch: number;
  loss: number;
  accuracy?: number;
}

export interface ForwardPassData {
  layerIndex: number;
  input: Matrix;
  preActivation: Matrix;
  activation: Matrix;
}

export interface BackwardPassData {
  layerIndex: number;
  gradient: Matrix;
  weightGradient: Matrix;
  biasGradient: Matrix;
}

/**
 * Neural Network class
 * Implements complete forward and backward propagation
 */
export class NeuralNetwork {
  layers: Layer[];
  lossFunction: LossFunction;
  learningRate: number;
  history: TrainingHistory[];

  // Visualization data
  private lastForwardPass: ForwardPassData[] = [];
  private lastBackwardPass: BackwardPassData[] = [];
  private lastLoss = 0;

  constructor(config: NetworkConfig) {
    this.learningRate = config.learningRate || 0.01;
    this.lossFunction = getLoss(config.loss);
    this.history = [];
    this.layers = [];

    // Build network layers
    let inputSize = config.inputSize;
    for (const layerConfig of config.layers) {
      this.layers.push(
        new Layer({
          inputSize,
          outputSize: layerConfig.outputSize,
          activation: layerConfig.activation,
          useBias: true,
        })
      );
      inputSize = layerConfig.outputSize;
    }
  }

  /**
   * Forward propagation through entire network
   * @param input - Input data (inputSize × batchSize)
   * @returns Network output (outputSize × batchSize)
   */
  forward(input: Matrix): Matrix {
    this.lastForwardPass = [];

    let output = input;

    // Propagate through each layer
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      output = layer.forward(output);

      // Store data for visualization
      const cached = layer.getCachedValues();
      if (cached.input && cached.preActivation && cached.activation) {
        this.lastForwardPass.push({
          layerIndex: i,
          input: cached.input,
          preActivation: cached.preActivation,
          activation: cached.activation,
        });
      }
    }

    return output;
  }

  /**
   * Backward propagation through entire network
   * @param predicted - Network output
   * @param target - Ground truth labels
   */
  backward(predicted: Matrix, target: Matrix): void {
    this.lastBackwardPass = [];

    // Step 1: Compute loss gradient (starting point for backprop)
    let gradient = this.lossFunction.backward(predicted, target);

    // Step 2: Backpropagate through layers in reverse order
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];

      // Backpropagate through this layer
      gradient = layer.backward(gradient);

      // Store gradients for visualization
      const params = layer.getParameters();
      if (params.weightGradients && params.biasGradients) {
        this.lastBackwardPass.unshift({
          layerIndex: i,
          gradient,
          weightGradient: params.weightGradients,
          biasGradient: params.biasGradients,
        });
      }
    }
  }

  /**
   * Update all layer weights using computed gradients
   */
  updateWeights(): void {
    for (const layer of this.layers) {
      layer.updateWeights(this.learningRate);
    }
  }

  /**
   * Train on a single batch
   * @param input - Input data
   * @param target - Target labels
   * @returns Loss value
   */
  trainBatch(input: Matrix, target: Matrix): number {
    // Forward pass
    const predicted = this.forward(input);

    // Compute loss
    const loss = this.lossFunction.forward(predicted, target);
    this.lastLoss = loss;

    // Backward pass
    this.backward(predicted, target);

    // Update weights
    this.updateWeights();

    return loss;
  }

  /**
   * Train for multiple epochs
   * @param inputs - Array of input matrices
   * @param targets - Array of target matrices
   * @param epochs - Number of training epochs
   * @param verbose - Print progress
   */
  train(
    inputs: Matrix[],
    targets: Matrix[],
    epochs: number,
    verbose = false
  ): void {
    if (inputs.length !== targets.length) {
      throw new Error('Number of inputs must match number of targets');
    }

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      // Train on each sample
      for (let i = 0; i < inputs.length; i++) {
        const loss = this.trainBatch(inputs[i], targets[i]);
        totalLoss += loss;
      }

      const avgLoss = totalLoss / inputs.length;

      // Store history
      this.history.push({
        epoch: epoch + 1,
        loss: avgLoss,
      });

      if (verbose && (epoch + 1) % 10 === 0) {
        console.log(`Epoch ${epoch + 1}/${epochs}, Loss: ${avgLoss.toFixed(6)}`);
      }
    }
  }

  /**
   * Make prediction (forward pass without training)
   * @param input - Input data
   * @returns Prediction
   */
  predict(input: Matrix): Matrix {
    return this.forward(input);
  }

  /**
   * Compute accuracy for classification tasks
   * @param inputs - Test inputs
   * @param targets - Test targets
   * @returns Accuracy (0-1)
   */
  evaluate(inputs: Matrix[], targets: Matrix[]): number {
    let correct = 0;

    for (let i = 0; i < inputs.length; i++) {
      const predicted = this.predict(inputs[i]);
      const target = targets[i];

      // Find predicted class (argmax)
      let predClass = 0;
      let maxPred = predicted.get(0, 0);
      for (let j = 1; j < predicted.rows; j++) {
        if (predicted.get(j, 0) > maxPred) {
          maxPred = predicted.get(j, 0);
          predClass = j;
        }
      }

      // Find target class (argmax)
      let targetClass = 0;
      let maxTarget = target.get(0, 0);
      for (let j = 1; j < target.rows; j++) {
        if (target.get(j, 0) > maxTarget) {
          maxTarget = target.get(j, 0);
          targetClass = j;
        }
      }

      if (predClass === targetClass) {
        correct++;
      }
    }

    return correct / inputs.length;
  }

  /**
   * Get visualization data from last forward/backward pass
   */
  getVisualizationData(): {
    forwardPass: ForwardPassData[];
    backwardPass: BackwardPassData[];
    loss: number;
    layers: Layer[];
  } {
    return {
      forwardPass: this.lastForwardPass,
      backwardPass: this.lastBackwardPass,
      loss: this.lastLoss,
      layers: this.layers,
    };
  }

  /**
   * Get network architecture info
   */
  getArchitecture(): Array<{
    inputSize: number;
    outputSize: number;
    activation: string;
    numWeights: number;
  }> {
    return this.layers.map((layer) => ({
      inputSize: layer.inputSize,
      outputSize: layer.outputSize,
      activation: layer.activation.name,
      numWeights: layer.inputSize * layer.outputSize + layer.outputSize,
    }));
  }

  /**
   * Reset training history
   */
  resetHistory(): void {
    this.history = [];
  }

  /**
   * Export network state
   */
  exportState(): {
    architecture: NetworkConfig;
    weights: number[][][];
    biases: number[][][];
    history: TrainingHistory[];
  } {
    return {
      architecture: {
        inputSize: this.layers[0].inputSize,
        layers: this.layers.map((layer) => ({
          outputSize: layer.outputSize,
          activation: layer.activation.name,
        })),
        loss: this.lossFunction.name,
        learningRate: this.learningRate,
      },
      weights: this.layers.map((layer) => layer.getParameters().weights.data),
      biases: this.layers.map((layer) => layer.getParameters().biases.data),
      history: this.history,
    };
  }

  /**
   * Get total number of parameters
   */
  getTotalParameters(): number {
    let total = 0;
    for (const layer of this.layers) {
      total += layer.inputSize * layer.outputSize; // weights
      total += layer.outputSize; // biases
    }
    return total;
  }

  /**
   * Set learning rate
   */
  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }

  /**
   * Get current learning rate
   */
  getLearningRate(): number {
    return this.learningRate;
  }
}
