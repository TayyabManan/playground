/**
 * Mathematical accuracy tests for backpropagation implementation
 * Verifies gradients using numerical approximation
 */

import { Matrix } from './Matrix';
import { NeuralNetwork } from './NeuralNetwork';
import { ActivationTests } from './Activation';
import { LossTests } from './Loss';
import * as Activation from './Activation';
import * as Loss from './Loss';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: number;
  message?: string;
}

/**
 * Run all mathematical accuracy tests
 */
export function runAllTests(): TestResult[] {
  const results: TestResult[] = [];

  console.log('🧪 Running Mathematical Accuracy Tests...\n');

  // Test 1: Matrix operations
  results.push(...testMatrixOperations());

  // Test 2: Activation functions
  results.push(...testActivationFunctions());

  // Test 3: Loss functions
  results.push(...testLossFunctions());

  // Test 4: XOR problem (classic test)
  results.push(testXORProblem());

  // Test 5: Gradient checking
  results.push(testGradientChecking());

  // Print summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log(`\n📊 Test Summary: ${passed}/${total} passed`);

  if (passed === total) {
    console.log('✅ All tests passed! Math is accurate.');
  } else {
    console.log('❌ Some tests failed. Check implementation.');
  }

  return results;
}

/**
 * Test 1: Matrix operations
 */
function testMatrixOperations(): TestResult[] {
  const results: TestResult[] = [];

  try {
    // Test matrix multiplication
    const A = new Matrix(2, 3, [[1, 2, 3], [4, 5, 6]]);
    const B = new Matrix(3, 2, [[7, 8], [9, 10], [11, 12]]);
    const C = A.multiply(B);

    const expected = new Matrix(2, 2, [[58, 64], [139, 154]]);

    let pass = true;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (Math.abs(C.get(i, j) - expected.get(i, j)) > 1e-10) {
          pass = false;
        }
      }
    }

    results.push({
      name: 'Matrix Multiplication',
      passed: pass,
      message: pass ? 'Correct' : 'Multiplication incorrect',
    });

    // Test transpose
    const D = new Matrix(2, 3, [[1, 2, 3], [4, 5, 6]]);
    const DT = D.transpose();

    pass = DT.rows === 3 && DT.cols === 2 && DT.get(0, 1) === 4 && DT.get(2, 0) === 3;

    results.push({
      name: 'Matrix Transpose',
      passed: pass,
      message: pass ? 'Correct' : 'Transpose incorrect',
    });

    // Test Hadamard product
    const E = new Matrix(2, 2, [[1, 2], [3, 4]]);
    const F = new Matrix(2, 2, [[5, 6], [7, 8]]);
    const G = E.hadamard(F);

    pass = G.get(0, 0) === 5 && G.get(0, 1) === 12 && G.get(1, 0) === 21 && G.get(1, 1) === 32;

    results.push({
      name: 'Hadamard Product',
      passed: pass,
      message: pass ? 'Correct' : 'Hadamard product incorrect',
    });

  } catch (error) {
    results.push({
      name: 'Matrix Operations',
      passed: false,
      message: `Error: ${error}`,
    });
  }

  return results;
}

/**
 * Test 2: Activation function gradients
 */
function testActivationFunctions(): TestResult[] {
  const results: TestResult[] = [];

  const testInput = new Matrix(3, 1, [[0.5], [-0.5], [0.0]]);

  // Test sigmoid
  const sigmoidResult = ActivationTests.checkGradient(Activation.sigmoid, testInput);
  results.push({
    name: 'Sigmoid Gradient',
    passed: sigmoidResult.passed,
    error: sigmoidResult.maxError,
    message: sigmoidResult.passed
      ? `Correct (error: ${sigmoidResult.maxError.toExponential(2)})`
      : `Failed (error: ${sigmoidResult.maxError})`,
  });

  // Test tanh
  const tanhResult = ActivationTests.checkGradient(Activation.tanh, testInput);
  results.push({
    name: 'Tanh Gradient',
    passed: tanhResult.passed,
    error: tanhResult.maxError,
    message: tanhResult.passed
      ? `Correct (error: ${tanhResult.maxError.toExponential(2)})`
      : `Failed (error: ${tanhResult.maxError})`,
  });

  // Test ReLU
  const reluResult = ActivationTests.checkGradient(Activation.relu, testInput);
  results.push({
    name: 'ReLU Gradient',
    passed: reluResult.passed,
    error: reluResult.maxError,
    message: reluResult.passed
      ? `Correct (error: ${reluResult.maxError.toExponential(2)})`
      : `Failed (error: ${reluResult.maxError})`,
  });

  return results;
}

/**
 * Test 3: Loss function gradients
 */
function testLossFunctions(): TestResult[] {
  const results: TestResult[] = [];

  const predicted = new Matrix(3, 1, [[0.7], [0.2], [0.1]]);
  const target = new Matrix(3, 1, [[1.0], [0.0], [0.0]]);

  // Test MSE
  const mseResult = LossTests.checkGradient(Loss.meanSquaredError, predicted, target);
  results.push({
    name: 'MSE Gradient',
    passed: mseResult.passed,
    error: mseResult.maxError,
    message: mseResult.passed
      ? `Correct (error: ${mseResult.maxError.toExponential(2)})`
      : `Failed (error: ${mseResult.maxError})`,
  });

  // Test Binary Cross-Entropy
  const bceResult = LossTests.checkGradient(
    Loss.binaryCrossEntropy,
    new Matrix(2, 1, [[0.8], [0.3]]),
    new Matrix(2, 1, [[1.0], [0.0]])
  );
  results.push({
    name: 'Binary Cross-Entropy Gradient',
    passed: bceResult.passed,
    error: bceResult.maxError,
    message: bceResult.passed
      ? `Correct (error: ${bceResult.maxError.toExponential(2)})`
      : `Failed (error: ${bceResult.maxError})`,
  });

  return results;
}

/**
 * Test 4: XOR Problem
 * Classic test: network should learn XOR function
 */
function testXORProblem(): TestResult {
  try {
    // XOR dataset
    const inputs = [
      Matrix.fromArray([0, 0], true),
      Matrix.fromArray([0, 1], true),
      Matrix.fromArray([1, 0], true),
      Matrix.fromArray([1, 1], true),
    ];

    const targets = [
      Matrix.fromArray([0], true),
      Matrix.fromArray([1], true),
      Matrix.fromArray([1], true),
      Matrix.fromArray([0], true),
    ];

    // Create network: 2 -> 4 -> 1
    const network = new NeuralNetwork({
      inputSize: 2,
      layers: [
        { outputSize: 4, activation: 'sigmoid' },
        { outputSize: 1, activation: 'sigmoid' },
      ],
      loss: 'mse',
      learningRate: 0.5,
    });

    // Train
    network.train(inputs, targets, 1000, false);

    // Test predictions
    let correct = 0;
    for (let i = 0; i < inputs.length; i++) {
      const pred = network.predict(inputs[i]);
      const expected = targets[i].get(0, 0);
      const prediction = pred.get(0, 0);

      // Count as correct if within 0.3 of expected
      if (Math.abs(prediction - expected) < 0.3) {
        correct++;
      }
    }

    const passed = correct === 4;

    return {
      name: 'XOR Problem (2-4-1 network)',
      passed,
      message: passed
        ? `Network learned XOR (${correct}/4 correct)`
        : `Network failed to learn XOR (${correct}/4 correct)`,
    };
  } catch (error) {
    return {
      name: 'XOR Problem',
      passed: false,
      message: `Error: ${error}`,
    };
  }
}

/**
 * Test 5: Gradient Checking (numerical vs analytical)
 * Verifies backpropagation implementation
 */
function testGradientChecking(): TestResult {
  try {
    const network = new NeuralNetwork({
      inputSize: 2,
      layers: [
        { outputSize: 3, activation: 'sigmoid' },
        { outputSize: 1, activation: 'sigmoid' },
      ],
      loss: 'mse',
      learningRate: 0.01,
    });

    const input = Matrix.fromArray([0.5, 0.3], true);
    const target = Matrix.fromArray([0.8], true);

    // Do forward and backward pass to compute analytical gradients
    const predicted = network.forward(input);
    network.backward(predicted, target);

    // Get analytical gradients
    const analyticalGrads = network.layers.map((layer) => layer.getParameters().weightGradients);

    // Compute numerical gradients
    const epsilon = 1e-7;
    let maxError = 0;

    for (let layerIdx = 0; layerIdx < network.layers.length; layerIdx++) {
      const layer = network.layers[layerIdx];
      const weights = layer.getParameters().weights;

      for (let i = 0; i < weights.rows; i++) {
        for (let j = 0; j < weights.cols; j++) {
          // Perturb weight +epsilon
          const originalWeight = weights.get(i, j);
          weights.set(i, j, originalWeight + epsilon);
          const predPlus = network.forward(input);
          const lossPlus = network.lossFunction.forward(predPlus, target);

          // Perturb weight -epsilon
          weights.set(i, j, originalWeight - epsilon);
          const predMinus = network.forward(input);
          const lossMinus = network.lossFunction.forward(predMinus, target);

          // Restore original weight
          weights.set(i, j, originalWeight);

          // Numerical gradient
          const numericalGrad = (lossPlus - lossMinus) / (2 * epsilon);

          // Analytical gradient
          const analyticalGrad = analyticalGrads[layerIdx]?.get(i, j) || 0;

          // Compare
          const error = Math.abs(numericalGrad - analyticalGrad);
          maxError = Math.max(maxError, error);
        }
      }
    }

    // Restore network state
    network.forward(input);

    const passed = maxError < 1e-5;

    return {
      name: 'Gradient Checking (Backprop Accuracy)',
      passed,
      error: maxError,
      message: passed
        ? `Gradients match (max error: ${maxError.toExponential(2)})`
        : `Gradients don't match (max error: ${maxError})`,
    };
  } catch (error) {
    return {
      name: 'Gradient Checking',
      passed: false,
      message: `Error: ${error}`,
    };
  }
}

/**
 * Print test results to console
 */
export function printTestResults(results: TestResult[]): void {
  console.log('\n📋 Detailed Test Results:\n');

  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (result.message) {
      console.log(`   ${result.message}`);
    }
    if (result.error !== undefined) {
      console.log(`   Error: ${result.error.toExponential(4)}`);
    }
    console.log('');
  }
}
