import { Link } from 'react-router-dom';

export default function MLCalculator() {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="text-[#60a5fa] hover:text-[#2563eb] transition-colors inline-flex items-center gap-2"
          >
            <span>&larr;</span> Back to Home
          </Link>
        </div>

        {/* Main Content */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#f8fafc] mb-6">
            ML Matrix Calculator
          </h1>
          <p className="text-xl text-[#6b7280] mb-8 max-w-3xl mx-auto">
            Interactive matrix operations with neural network backpropagation visualizer.
          </p>

          <div className="bg-[#1a1f2e] rounded-lg p-12 border border-[#2d3748] max-w-2xl mx-auto">
            <div className="text-[#6b7280] space-y-4">
              <p className="text-2xl font-semibold text-[#f8fafc] mb-6">
                Coming Soon
              </p>
              <p>
                This project is currently under development. It will feature:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#60a5fa]">•</span>
                  <span>Core matrix operations (add, multiply, transpose)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#60a5fa]">•</span>
                  <span>Neural network layer implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#60a5fa]">•</span>
                  <span>Backpropagation visualizer with D3.js</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#60a5fa]">•</span>
                  <span>Multi-framework code export (PyTorch, TensorFlow, NumPy)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#60a5fa]">•</span>
                  <span>Interactive gradient flow visualization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
