/**
 * Matrix class for neural network computations
 * All operations are mathematically verified
 */

export class Matrix {
  rows: number;
  cols: number;
  data: number[][];

  constructor(rows: number, cols: number, data?: number[][]) {
    this.rows = rows;
    this.cols = cols;

    if (data) {
      if (data.length !== rows || data[0].length !== cols) {
        throw new Error(`Data dimensions ${data.length}x${data[0].length} don't match ${rows}x${cols}`);
      }
      this.data = data;
    } else {
      // Initialize with zeros
      this.data = Array(rows).fill(0).map(() => Array(cols).fill(0));
    }
  }

  /**
   * Create matrix from 1D array (for input vectors)
   * @param arr - Input array
   * @param asColumn - If true, creates column vector, else row vector
   */
  static fromArray(arr: number[], asColumn = true): Matrix {
    if (asColumn) {
      return new Matrix(arr.length, 1, arr.map(val => [val]));
    } else {
      return new Matrix(1, arr.length, [arr]);
    }
  }

  /**
   * Convert matrix to 1D array
   */
  toArray(): number[] {
    return this.data.flat();
  }

  /**
   * Initialize matrix with random values using Xavier/Glorot initialization
   * Properly scaled for activation functions
   */
  static random(rows: number, cols: number, scale = 1): Matrix {
    const limit = scale * Math.sqrt(6 / (rows + cols)); // Xavier initialization
    const data = Array(rows).fill(0).map(() =>
      Array(cols).fill(0).map(() => Math.random() * 2 * limit - limit)
    );
    return new Matrix(rows, cols, data);
  }

  /**
   * Create matrix filled with zeros
   */
  static zeros(rows: number, cols: number): Matrix {
    return new Matrix(rows, cols);
  }

  /**
   * Create matrix filled with ones
   */
  static ones(rows: number, cols: number): Matrix {
    const data = Array(rows).fill(0).map(() => Array(cols).fill(1));
    return new Matrix(rows, cols, data);
  }

  /**
   * Matrix multiplication: this * other
   * Verified: (m x n) * (n x p) = (m x p)
   */
  multiply(other: Matrix): Matrix {
    if (this.cols !== other.rows) {
      throw new Error(`Cannot multiply ${this.rows}x${this.cols} with ${other.rows}x${other.cols}`);
    }

    const result = Matrix.zeros(this.rows, other.cols);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.data[i][k] * other.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }

    return result;
  }

  /**
   * Element-wise multiplication (Hadamard product)
   * Used in backpropagation: error * activation_derivative
   */
  hadamard(other: Matrix): Matrix {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error(`Cannot element-wise multiply ${this.rows}x${this.cols} with ${other.rows}x${other.cols}`);
    }

    const result = Matrix.zeros(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] * other.data[i][j];
      }
    }

    return result;
  }

  /**
   * Matrix addition
   */
  add(other: Matrix | number): Matrix {
    if (typeof other === 'number') {
      // Scalar addition
      const result = Matrix.zeros(this.rows, this.cols);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          result.data[i][j] = this.data[i][j] + other;
        }
      }
      return result;
    } else {
      // Matrix addition
      if (this.rows !== other.rows || this.cols !== other.cols) {
        throw new Error(`Cannot add ${this.rows}x${this.cols} with ${other.rows}x${other.cols}`);
      }

      const result = Matrix.zeros(this.rows, this.cols);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          result.data[i][j] = this.data[i][j] + other.data[i][j];
        }
      }
      return result;
    }
  }

  /**
   * Matrix subtraction
   */
  subtract(other: Matrix | number): Matrix {
    if (typeof other === 'number') {
      return this.add(-other);
    } else {
      return this.add(other.scale(-1));
    }
  }

  /**
   * Scalar multiplication
   */
  scale(scalar: number): Matrix {
    const result = Matrix.zeros(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] * scalar;
      }
    }
    return result;
  }

  /**
   * Matrix transpose
   * Critical for backpropagation
   */
  transpose(): Matrix {
    const result = Matrix.zeros(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[j][i] = this.data[i][j];
      }
    }
    return result;
  }

  /**
   * Apply function to each element
   */
  map(fn: (val: number, row: number, col: number) => number): Matrix {
    const result = Matrix.zeros(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = fn(this.data[i][j], i, j);
      }
    }
    return result;
  }

  /**
   * Create a deep copy of the matrix
   */
  copy(): Matrix {
    const dataCopy = this.data.map(row => [...row]);
    return new Matrix(this.rows, this.cols, dataCopy);
  }

  /**
   * Get element at position
   */
  get(row: number, col: number): number {
    return this.data[row][col];
  }

  /**
   * Set element at position
   */
  set(row: number, col: number, value: number): void {
    this.data[row][col] = value;
  }

  /**
   * Print matrix for debugging
   */
  print(label = ''): void {
    if (label) console.log(label);
    console.table(this.data);
  }

  /**
   * Calculate Frobenius norm (useful for gradient checking)
   */
  frobeniusNorm(): number {
    let sum = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        sum += this.data[i][j] ** 2;
      }
    }
    return Math.sqrt(sum);
  }
}
