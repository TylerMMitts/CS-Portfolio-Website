import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Github, Calendar, Users, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEffect } from 'react';
import { SlideViewer } from './SlideViewer';

interface ProjectDetailProps {
  project: {
    id: number;
    title: string;
    description: string;
    image: string;
    tech: string[];
    color: string;
    fullDescription: string;
    challenges: string[];
    solutions: string[];
    images: string[];
    imageDescriptions?: string[];
    pdfUrl?: string;
    pdfTitle?: string;
    pdfDescription?: string;
    videoUrl?: string;
    videoTitle?: string;
    videoDescription?: string;
    liveUrl?: string;
    liveLabel?: string;
    layout?: 'slides';
    slides?: string[];
    githubUrl?: string;
    team: string;
    status: string;
  };
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
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
  }, [project.id]); // Also depend on project.id to ensure it triggers when switching projects

  const renderBackButton = (fixed: boolean) => (
    <motion.button
      onClick={() => {
        onBack();
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 50);
      }}
      className={`${fixed ? 'fixed top-4 left-4 sm:top-6 sm:left-6 ' : ''}z-50 flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full pixel-border bg-cream/90 backdrop-blur-sm text-deep-slate hover:bg-deep-slate hover:text-cream transition-all duration-300`}
      style={fixed ? undefined : { flexShrink: 0 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft size={16} />
      <span className="text-sm">Back to Projects</span>
    </motion.button>
  );

  // Slides layout: a short intro, then the deck front and center
  // Fills exactly one screen (no page scroll): compact header, then the deck
  // takes all remaining space, sized so a full slide is visible at once.
  if (project.layout === 'slides' && project.pdfUrl) {
    return (
      <div
        className="bg-cream flex flex-col overflow-hidden"
        style={{ position: 'fixed', inset: 0, height: '100dvh' }}
      >
        <header
          className="text-center"
          style={{ padding: '12px 16px 10px', paddingTop: 'max(12px, env(safe-area-inset-top))', flexShrink: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            {renderBackButton(false)}
            <h1
              className="font-bold text-deep-slate"
              style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', lineHeight: 1.15, margin: 0, flex: '1 1 auto', textAlign: 'center' }}
            >
              {project.title}
            </h1>
            {/* Spacer the width of the back button keeps the title centered */}
            <div className="hidden sm:block" style={{ width: 170, flexShrink: 0 }} />
          </div>
          <p className="text-deep-slate/60" style={{ fontSize: '0.75rem', margin: '4px 0 0' }}>
            {project.team.replace(/^Mentors?:\s*/, 'Mentored by ')}
          </p>
          <p className="text-deep-slate/80" style={{ fontSize: '0.875rem', margin: '6px auto 0', maxWidth: '44rem' }}>
            {project.fullDescription}{' '}
            <a
              href={project.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: project.color, textDecoration: 'underline', whiteSpace: 'nowrap' }}
            >
              Open full screen
            </a>
          </p>
        </header>

        <div className="flex-1" style={{ minHeight: 0, padding: '0 16px 12px', width: '100%', maxWidth: 1400, margin: '0 auto' }}>
          {project.slides && project.slides.length > 0 ? (
            <SlideViewer slides={project.slides} title={project.title} accent={project.color} />
          ) : (
            <div className="bg-white rounded-lg pixel-border overflow-hidden" style={{ width: '100%', height: '100%' }}>
              <iframe
                src={`${project.pdfUrl}#toolbar=1&navpanes=0&view=Fit`}
                title={project.pdfTitle || project.title}
                style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream relative">
      {/* Background Effects */}
      <div className="absolute inset-0 dither-bg opacity-10" />
      
      {renderBackButton(true)}

      {/* Hero Section */}
      <motion.section
        className="pt-28 pb-12 px-4 sm:pt-32 sm:pb-16 sm:px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto mt-8 sm:mt-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Project Info */}
            <div>
              <motion.div
                className="flex items-center gap-2 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div 
                  className="w-4 h-4 pixel-corners"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-sm text-deep-slate/70 uppercase tracking-wider">
                  {project.status}
                </span>
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-deep-slate mb-6 leading-tight break-words"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {project.title}
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg text-deep-slate/80 mb-8 leading-relaxed break-words"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {project.fullDescription}
              </motion.p>

              {/* Project Meta */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex items-center gap-2 text-sm text-deep-slate/70">
                  <Users size={16} />
                  <span>{project.team}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-deep-slate/70">
                  <Star size={16} />
                  <span>Featured Project</span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-wrap gap-4 relative z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {project.liveUrl && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium pixel-border cursor-pointer relative z-30"
                    style={{
                      backgroundColor: project.color,
                      color: '#F4F1DE',
                      pointerEvents: 'auto'
                    }}
                  >
                    <ExternalLink size={16} />
                    {project.liveLabel || 'View Live'}
                  </button>
                )}
                {project.githubUrl && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium pixel-border bg-transparent cursor-pointer relative z-30"
                    style={{
                      color: '#3D405B',
                      borderColor: '#3D405B',
                      pointerEvents: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3D405B';
                      e.currentTarget.style.color = '#F4F1DE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#3D405B';
                    }}
                  >
                    <Github size={16} />
                    View Code
                  </button>
                )}
              </motion.div>
            </div>

            {/* Project Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="aspect-video rounded-lg overflow-hidden pixel-border bg-deep-slate/5">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 pixel-corners"
                style={{ backgroundColor: project.color }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Tech Stack */}
      <motion.section
        className="py-12 px-4 sm:py-16 sm:px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-deep-slate mb-6 sm:mb-8 text-center break-words">
            Technology Stack
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {project.tech.map((tech, index) => (
              <motion.div
                key={tech}
                className="px-4 py-2 rounded-full pixel-border bg-cream/80 text-deep-slate text-sm font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: project.color,
                  color: '#F4F1DE'
                }}
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Project Details */}
      <motion.section
        className="py-12 px-4 sm:py-16 sm:px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Challenges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-deep-slate mb-4 sm:mb-6 break-words">
                Challenges & Problems
              </h3>
              <div className="space-y-4">
                {project.challenges.map((challenge, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div 
                      className="w-2 h-2 pixel-corners mt-2 flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <p className="text-deep-slate/80 text-sm leading-relaxed break-words">
                      {challenge}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-deep-slate mb-4 sm:mb-6 break-words">
                Solutions & Approach
              </h3>
              <div className="space-y-4">
                {project.solutions.map((solution, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div 
                      className="w-2 h-2 pixel-corners mt-2 flex-shrink-0"
                      style={{ backgroundColor: '#81B29A' }}
                    />
                    <p className="text-deep-slate/80 text-sm leading-relaxed break-words">
                      {solution}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Video Section */}
      {project.videoUrl && (
        <motion.section
          className="py-12 px-4 sm:py-16 sm:px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-deep-slate mb-6 sm:mb-8 text-center break-words">
              {project.videoTitle || "Project Video"}
            </h2>
            {project.videoDescription && (
              <p className="text-base sm:text-lg text-deep-slate/80 max-w-2xl mx-auto text-center leading-relaxed mb-6 sm:mb-8 break-words">
                {project.videoDescription}
              </p>
            )}
            
            {/* Video Player */}
            <motion.div
              className="relative bg-deep-slate/5 rounded-lg pixel-border overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <video
                controls
                className="w-full h-auto"
                style={{ maxHeight: '600px' }}
              >
                <source src={project.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>

            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-sm text-deep-slate/60">
                Use the video controls to play, pause, and adjust volume
              </p>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* PDF Viewer Section */}
      {project.pdfUrl && (
        <motion.section
          className="py-12 px-4 sm:py-16 sm:px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-deep-slate mb-6 sm:mb-8 text-center break-words">
              {project.pdfTitle || "Project Documentation"}
            </h2>
            {project.pdfDescription && (
              <p className="text-base sm:text-lg text-deep-slate/80 max-w-2xl mx-auto text-center leading-relaxed mb-6 sm:mb-8 break-words">
                {project.pdfDescription}
              </p>
            )}
            
            {/* PDF Embed */}
            <motion.div
              className="relative bg-white rounded-lg pixel-border overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <iframe
                src={`${project.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
                width="100%"
                height="600"
                title={project.pdfTitle || "Project PDF"}
                className="border-0"
                style={{ minHeight: '400px' }}
              />
            </motion.div>

            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-sm text-deep-slate/60">
                Use your browser's PDF controls to navigate, zoom, and search within the document
              </p>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Additional Images */}
      {project.images.length > 0 && (
        <motion.section
          className="py-12 px-4 sm:py-16 sm:px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-deep-slate mb-8 sm:mb-12 text-center break-words">
              Project Gallery
            </h2>
            <div className="space-y-12">
              {project.images.map((image, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="flex justify-center rounded-lg overflow-hidden pixel-border mb-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${project.title} - Image ${index + 1}`}
                      className="object-contain"
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '500px',
                        height: 'auto',
                        width: 'auto'
                      }}
                    />
                  </motion.div>
                  
                  {/* Image Description */}
                  {project.imageDescriptions && project.imageDescriptions[index] && (
                    <motion.div
                      className="text-center max-w-2xl"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center justify-center mb-3">
                        <div 
                          className="w-3 h-3 pixel-corners mr-3"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-sm font-medium text-deep-slate/70 uppercase tracking-wider">
                          Image {index + 1}
                        </span>
                        <div 
                          className="w-3 h-3 pixel-corners ml-3"
                          style={{ backgroundColor: project.color }}
                        />
                      </div>
                      <p className="text-deep-slate/80 text-sm sm:text-base leading-relaxed break-words px-4">
                        {project.imageDescriptions[index]}
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Decorative divider for all but last image */}
                  {index < project.images.length - 1 && (
                    <motion.div
                      className="mt-8 flex items-center justify-center w-full"
                      initial={{ opacity: 0, scaleX: 0 }}
                      whileInView={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="h-px bg-gradient-to-r from-transparent via-deep-slate/20 to-transparent w-full max-w-md" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ 
              backgroundColor: project.color,
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.8, 0],
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