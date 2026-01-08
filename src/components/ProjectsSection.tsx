import { motion } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { featuredProjects } from '../data/projects';

interface ProjectsSectionProps {
  onProjectClick: (projectId: number) => void;
}

export function ProjectsSection({ onProjectClick }: ProjectsSectionProps) {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  return (
    <section className="min-h-screen py-20 relative overflow-hidden z-10">
      <div className="absolute inset-0 dither-bg opacity-20" />
      
      {/* Section Header */}
      <motion.div
        className="text-center mb-16 relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="inline-block relative">
          <h2 
            className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold pixel-border p-4 sm:p-6 rounded-lg mb-8"
            style={{ 
              color: 'white',
              backgroundColor: '#3D405B',
              borderColor: '#3D405B',
              fontFamily: '"Press Start 2P", monospace',
              width: '90vw',
              maxWidth: '1120px',
              textAlign: 'center' as const
            }}
          >
            Featured Projects
          </h2>
        </div>
        <div className="w-24 h-1 mx-auto rounded-full mt-4" style={{ backgroundColor: '#E07A5F' }} />
      </motion.div>

      {/* Flowing Projects Grid */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.2,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
              onClick={() => onProjectClick(project.id)}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              {/* Project Card */}
              <div className="relative overflow-hidden rounded-lg pixel-border bg-cream/80 backdrop-blur-sm h-full flex flex-col z-20">
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  {/* Tech badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {project.tech.map((tech, i) => (
                      <motion.span
                        key={tech}
                        className="px-2 py-1 text-xs rounded pixel-border bg-cream/90 text-deep-slate"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: hoveredProject === project.id ? 1 : 0,
                          x: hoveredProject === project.id ? 0 : -10
                        }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <motion.h3 
                    className="text-xl font-bold text-deep-slate mb-2"
                    animate={{ 
                      color: hoveredProject === project.id ? project.color : '#3D405B'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {project.title}
                  </motion.h3>
                  <p className="text-deep-slate/70 text-sm leading-relaxed mb-4 flex-grow">
                    {project.description}
                  </p>
                  
                  {/* Action button */}
                  <motion.button
                    className="self-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 pixel-border"
                    style={{ 
                      backgroundColor: hoveredProject === project.id ? project.color : 'transparent',
                      color: hoveredProject === project.id ? 'white' : '#3D405B',
                      borderColor: project.color
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Project →
                  </motion.button>
                </div>
              </div>

              {/* Floating elements around card */}
              <motion.div
                className="absolute -top-2 -right-2 w-4 h-4 pixel-corners z-10"
                style={{ backgroundColor: project.color }}
                animate={{ 
                  rotate: hoveredProject === project.id ? 180 : 0,
                  scale: hoveredProject === project.id ? 1.2 : 1
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-6 h-6 pixel-corners"
        style={{ backgroundColor: '#81B29A' }}
        animate={{ 
          y: [0, -30, 0],
          x: [0, 15, 0],
          opacity: [0.3, 1, 0.3]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-40 right-20 w-3 h-3 pixel-corners"
        style={{ backgroundColor: '#F2CC8F' }}
        animate={{ 
          rotate: 360,
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </section>
  );
}