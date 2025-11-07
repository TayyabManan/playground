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
    id: 'ml-calculator',
    title: 'ML Matrix Calculator',
    description: 'Interactive matrix operations with neural network backpropagation visualizer. Built with React, TypeScript, and D3.js.',
    route: '/ml-calculator',
    status: 'in-progress',
    tags: ['Machine Learning', 'D3.js', 'TypeScript', 'Neural Networks']
  },
  {
    id: 'neural-viz',
    title: 'Neural Network Visualizer',
    description: 'Real-time visualization of neural network training and inference.',
    route: '/neural-viz',
    status: 'coming-soon',
    tags: ['Deep Learning', 'Visualization', 'WebGL']
  },
  {
    id: 'data-explorer',
    title: 'Interactive Data Explorer',
    description: 'Explore and visualize datasets with interactive charts and statistical analysis.',
    route: '/data-explorer',
    status: 'coming-soon',
    tags: ['Data Science', 'Visualization', 'Analytics']
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#f8fafc] mb-4">
            Playground
          </h1>
          <p className="text-xl text-[#6b7280] max-w-2xl mx-auto">
            Interactive machine learning and data visualization projects by{' '}
            <a
              href="https://tayyabmanan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#60a5fa] hover:text-[#2563eb] transition-colors"
            >
              Tayyab Manan
            </a>
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-[#6b7280]">
          <p>
            More projects coming soon. Check out my{' '}
            <a
              href="https://tayyabmanan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#60a5fa] hover:text-[#2563eb] transition-colors"
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
    'coming-soon': 'bg-gray-700 text-gray-300',
    'in-progress': 'bg-yellow-900/40 text-yellow-300',
    'live': 'bg-green-900/40 text-green-300'
  };

  const statusText = {
    'coming-soon': 'Coming Soon',
    'in-progress': 'In Progress',
    'live': 'Live'
  };

  const card = (
    <div className="bg-[#1a1f2e] rounded-lg p-6 border border-[#2d3748] hover:border-[#60a5fa] transition-all duration-300 hover:shadow-lg hover:shadow-[#60a5fa]/10 cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-[#f8fafc]">{project.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[project.status]}`}>
          {statusText[project.status]}
        </span>
      </div>

      <p className="text-[#6b7280] mb-4 min-h-[60px]">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-[#2d3748] text-[#60a5fa] rounded text-sm border border-[#2d3748] hover:border-[#60a5fa]/50 transition-colors"
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
