import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Search, ExternalLink, Github } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projects } from '../data/projects';

interface AllProjectsPageProps {
  onBack: () => void;
  onProjectClick: (projectId: number) => void;
}

export function AllProjectsPage({ onBack, onProjectClick }: AllProjectsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    // First, immediately jump to top to ensure we start there
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Then use smooth scrolling for any subsequent scroll-to-top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  }, []); // Empty dependency array means this runs once when component mounts

  // Extract all unique technologies
  const allTech = ['All', ...new Set(projects.flatMap(p => p.tech))];
  const allStatuses = ['All', ...new Set(projects.map(p => p.status))];

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tech.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTech = selectedTech === 'All' || project.tech.includes(selectedTech);
    const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
    
    return matchesSearch && matchesTech && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-cream relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 dither-bg opacity-20" />
      
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b-2 border-deep-slate/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-full pixel-border bg-cream text-deep-slate hover:bg-deep-slate hover:text-cream transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back to Portfolio</span>
            </motion.button>

            <motion.h1
              className="text-2xl md:text-3xl font-bold text-deep-slate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              All Projects
            </motion.h1>

            <div className="w-32" /> {/* Spacer for balance */}
          </div>
        </div>
      </motion.header>

      {/* Filters and Search */}
      <motion.section
        className="sticky top-16 z-30 bg-cream/95 backdrop-blur-sm border-b border-deep-slate/10 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-deep-slate/50" size={16} />
              <input
                type="text"
                placeholder="Search projects, technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full pixel-border bg-cream/80 text-deep-slate placeholder-deep-slate/50 focus:outline-none focus:ring-2 focus:ring-burnt-orange/50"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-deep-slate/70" />
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="px-3 py-1 rounded-full pixel-border bg-cream text-deep-slate text-sm focus:outline-none focus:ring-2 focus:ring-burnt-orange/50"
                >
                  {allTech.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1 rounded-full pixel-border bg-cream text-deep-slate text-sm focus:outline-none focus:ring-2 focus:ring-burnt-orange/50"
              >
                {allStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <motion.div
            className="mt-3 text-sm text-deep-slate/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Showing {filteredProjects.length} of {projects.length} projects
          </motion.div>
        </div>
      </motion.section>

      {/* Projects Grid */}
      <motion.main
        className="py-8 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 pixel-corners bg-deep-slate/20" />
              <h3 className="text-lg font-bold text-deep-slate mb-2">No projects found</h3>
              <p className="text-deep-slate/70">Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  onClick={() => onProjectClick(project.id)}
                  whileHover={{ y: -8 }}
                >
                  <div className="relative overflow-hidden rounded-lg pixel-border bg-cream/80 backdrop-blur-sm h-full flex flex-col">
                    {/* Project Image */}
                    <div className="relative h-40 overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Status badge */}
                      <div className="absolute top-2 left-2">
                        <span 
                          className="px-2 py-1 text-xs rounded-full pixel-border text-cream"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.status}
                        </span>
                      </div>

                      {/* Quick action buttons */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {project.liveUrl && (
                          <motion.a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-full bg-cream/90 text-deep-slate hover:bg-deep-slate hover:text-cream transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ExternalLink size={12} />
                          </motion.a>
                        )}
                        {project.githubUrl && (
                          <motion.a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-full bg-cream/90 text-deep-slate hover:bg-deep-slate hover:text-cream transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Github size={12} />
                          </motion.a>
                        )}
                      </div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Project Info */}
                    <div className="p-4 flex flex-col flex-grow">
                      <motion.h3 
                        className="text-base font-bold text-deep-slate mb-2 line-clamp-2"
                        animate={{ 
                          color: hoveredProject === project.id ? project.color : '#3D405B'
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {project.title}
                      </motion.h3>
                      
                      <p className="text-deep-slate/70 text-xs leading-relaxed mb-3 flex-grow line-clamp-3">
                        {project.description}
                      </p>

                      {/* Tech stack (limited) */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tech.slice(0, 3).map((tech, i) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-xs rounded pixel-border bg-cream/60 text-deep-slate"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.tech.length > 3 && (
                          <span className="px-2 py-1 text-xs text-deep-slate/50">
                            +{project.tech.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Duration and team */}
                      <div className="text-xs text-deep-slate/50 mt-auto">
                        {project.duration} • {project.team}
                      </div>
                    </div>

                    {/* Decorative corner */}
                    <motion.div
                      className="absolute bottom-2 right-2 w-2 h-2 pixel-corners"
                      style={{ backgroundColor: project.color }}
                      animate={{ 
                        rotate: hoveredProject === project.id ? 45 : 0,
                        scale: hoveredProject === project.id ? 1.2 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Hover border effect */}
                    {hoveredProject === project.id && (
                      <motion.div
                        className="absolute -inset-1 rounded-lg"
                        style={{ 
                          border: `2px solid ${project.color}`,
                          backgroundColor: 'transparent'
                        }}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.main>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ 
              backgroundColor: ['#E07A5F', '#81B29A', '#F2CC8F', '#3D405B'][i % 4],
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}