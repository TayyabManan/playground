import { Link } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  description: string;
  route: string;
  status: 'coming-soon' | 'in-progress' | 'live';
  tags: string[];
}

const projects: Project[] = [
  {
    id: 'backprop-viz',
    title: 'Backpropagation Visualizer',
    description: 'Interactive visualization of backpropagation through neural networks. Watch gradients flow in real-time.',
    route: '/backprop-visualizer',
    status: 'in-progress',
    tags: ['Neural Networks', 'D3.js', 'TypeScript', 'Visualization']
  },
  {
    id: 'ml-calculator',
    title: 'ML Matrix Calculator',
    description: 'Interactive matrix operations with neural network context. Built with React, TypeScript, and D3.js.',
    route: '/ml-calculator',
    status: 'coming-soon',
    tags: ['Machine Learning', 'Matrix Math', 'Linear Algebra']
  },
  {
    id: 'neural-viz',
    title: 'Neural Network Visualizer',
    description: 'Real-time visualization of neural network training and inference.',
    route: '/neural-viz',
    status: 'coming-soon',
    tags: ['Deep Learning', 'Visualization', 'WebGL']
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-[#f8fafc] mb-4">
            Playground
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-[#6b7280] max-w-3xl">
            Interactive machine learning and data visualization projects by{' '}
            <a
              href="https://tayyabmanan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563eb] dark:text-[#60a5fa] hover:text-[#1d4ed8] dark:hover:text-[#2563eb] transition-colors"
            >
              Tayyab Manan
            </a>
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 sm:mt-16 text-gray-600 dark:text-[#6b7280]">
          <p className="text-sm sm:text-base">
            More projects coming soon. Check out my{' '}
            <a
              href="https://tayyabmanan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563eb] dark:text-[#60a5fa] hover:text-[#1d4ed8] dark:hover:text-[#2563eb] transition-colors"
            >
              main portfolio
            </a>
            {' '}for other work.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    'coming-soon': 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    'in-progress': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
    'live': 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
  };

  const statusText = {
    'coming-soon': 'Coming Soon',
    'in-progress': 'In Progress',
    'live': 'Live'
  };

  const card = (
    <div className="bg-gray-50 dark:bg-[#1a1f2e] rounded-lg p-6 border border-gray-200 dark:border-[#2d3748] hover:border-[#2563eb] dark:hover:border-[#60a5fa] transition-all duration-300 hover:shadow-lg hover:shadow-[#2563eb]/10 dark:hover:shadow-[#60a5fa]/10 cursor-pointer">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#f8fafc]">
          {project.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start ${statusColors[project.status]}`}>
          {statusText[project.status]}
        </span>
      </div>

      <p className="text-gray-600 dark:text-[#6b7280] mb-4 min-h-[60px] text-sm sm:text-base">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-gray-200 dark:bg-[#2d3748] text-[#2563eb] dark:text-[#60a5fa] rounded text-xs sm:text-sm border border-gray-200 dark:border-[#2d3748] hover:border-[#2563eb] dark:hover:border-[#60a5fa]/50 transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  if (project.status === 'coming-soon') {
    return card;
  }

  return (
    <Link to={project.route}>
      {card}
    </Link>
  );
}
