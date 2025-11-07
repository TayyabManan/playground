import { Link } from 'react-router-dom';

export default function BackpropVisualizer() {
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
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-[#f8fafc] mb-6">
              Backpropagation Visualizer
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-[#6b7280] max-w-3xl">
              Interactive visualization of backpropagation through neural networks. Watch gradients flow in real-time.
            </p>
          </div>

          {/* Visualization Area */}
          <div className="bg-gray-50 dark:bg-[#1a1f2e] rounded-lg p-8 sm:p-12 border border-gray-200 dark:border-[#2d3748]">
            <div className="text-center text-gray-600 dark:text-[#6b7280] space-y-4">
              <div className="text-6xl mb-4">🧠</div>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-[#f8fafc] mb-6">
                Building Your Neural Network Visualizer
              </p>
              <p className="text-sm sm:text-base max-w-2xl mx-auto">
                This interactive tool will help you understand how backpropagation works by visualizing:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mt-8">
                <div className="bg-white dark:bg-[#0a0f1e] p-6 rounded-lg border border-gray-200 dark:border-[#2d3748]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc] mb-3">
                    Forward Pass
                  </h3>
                  <ul className="text-left text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Input propagation through layers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Activation function visualization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Output prediction display</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-[#0a0f1e] p-6 rounded-lg border border-gray-200 dark:border-[#2d3748]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc] mb-3">
                    Backward Pass
                  </h3>
                  <ul className="text-left text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Gradient flow animation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Weight update visualization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Chain rule computation display</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-[#0a0f1e] p-6 rounded-lg border border-gray-200 dark:border-[#2d3748]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc] mb-3">
                    Interactive Controls
                  </h3>
                  <ul className="text-left text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Adjust network architecture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Change learning rate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Step through epochs</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-[#0a0f1e] p-6 rounded-lg border border-gray-200 dark:border-[#2d3748]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f8fafc] mb-3">
                    Real-time Metrics
                  </h3>
                  <ul className="text-left text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Loss function tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Gradient magnitude display</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563eb] dark:text-[#60a5fa]">•</span>
                      <span>Accuracy visualization</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
