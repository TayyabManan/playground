import { Link } from 'react-router-dom';

export default function MLCalculator() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="text-[#2563eb] dark:text-[#60a5fa] hover:text-[#1d4ed8] dark:hover:text-[#2563eb] transition-colors inline-flex items-center gap-2"
          >
            <span>&larr;</span> Back to Home
          </Link>
        </div>

        {/* Main Content */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-[#f8fafc] mb-6">
            ML Matrix Calculator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-[#6b7280] mb-8 max-w-3xl">
            Interactive matrix operations with neural network context.
          </p>

          <div className="bg-gray-50 dark:bg-[#1a1f2e] rounded-lg p-8 sm:p-12 border border-gray-200 dark:border-[#2d3748] max-w-3xl">
            <div className="text-gray-600 dark:text-[#6b7280] space-y-4">
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-[#f8fafc] mb-6">
                Coming Soon
              </p>
              <p className="text-sm sm:text-base">
                This project is currently under development. It will feature:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                  <span>Core matrix operations (add, multiply, transpose)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                  <span>Neural network layer implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                  <span>Interactive matrix calculator with exact arithmetic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                  <span>Multi-framework code export (PyTorch, TensorFlow, NumPy)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
