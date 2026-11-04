import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PillNavigation } from './components/PillNavigation';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ContactSection } from './components/ContactSection';
import { PixelFrame } from './components/PixelFrame';
import { ProjectDetail } from './components/ProjectDetail';
import { AllProjectsPage } from './components/AllProjectsPage';
import { ScrollBinaryTree } from './components/ScrollBinaryTree';
import { projects, getProjectBySlug } from './data/projects';

type View = 'portfolio' | 'projects' | 'project';
const DEFAULT_TITLE = 'Tyler Mitts Portfolio';

// Map a URL path to a view: "/" -> portfolio, "/projects" -> all projects,
// "/<project-slug>" -> that project's page. Unknown paths fall back to home.
function routeFromPath(pathname: string): { view: View; projectId: number | null } {
  const slug = pathname.replace(/^\/+|\/+$/g, '');
  if (slug === '') return { view: 'portfolio', projectId: null };
  if (slug.toLowerCase() === 'projects') return { view: 'projects', projectId: null };
  const project = getProjectBySlug(slug);
  if (project) return { view: 'project', projectId: project.id };
  return { view: 'portfolio', projectId: null };
}

export default function App() {
  const initialRoute = routeFromPath(window.location.pathname);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<View>(initialRoute.view);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialRoute.projectId);

  // Push a new URL and switch to the matching view
  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    const route = routeFromPath(path);
    setCurrentView(route.view);
    setSelectedProjectId(route.projectId);
  };

  // Keep the view in sync with the browser's back/forward buttons,
  // and replace unknown paths with "/"
  useEffect(() => {
    const onPopState = () => {
      const route = routeFromPath(window.location.pathname);
      setCurrentView(route.view);
      setSelectedProjectId(route.projectId);
    };
    window.addEventListener('popstate', onPopState);
    if (initialRoute.view === 'portfolio' && window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/' + window.location.hash);
    }
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Tab title reflects the current page
  useEffect(() => {
    const project = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
    document.title =
      currentView === 'project' && project ? `${project.title} | Tyler Mitts`
      : currentView === 'projects' ? 'Projects | Tyler Mitts'
      : DEFAULT_TITLE;
  }, [currentView, selectedProjectId]);

  useEffect(() => {
    // Font loading optimization
    const loadFont = async () => {
      try {
        if ('fonts' in document) {
          await document.fonts.load('400 16px "Press Start 2P"');
          await document.fonts.ready;
        }
      } catch (error) {
        console.warn('Font loading failed, using fallback:', error);
      }
      
      // Set loaded after font is ready or timeout
      setTimeout(() => {
        setIsLoaded(true);
      }, 100);
    };

    loadFont();

    // Fallback timeout to prevent infinite loading
    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProjectClick = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    navigate(`/${project.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProjectsList = () => {
    navigate('/projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreClick = () => {
    navigate('/projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromAllProjects = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  if (!isLoaded) {
    return (
      <div className="size-full flex items-center justify-center bg-cream">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 pixel-corners"
            style={{ backgroundColor: '#E07A5F' }}
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
          />
          <motion.p
            className="text-deep-slate font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Initializing Portfolio...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Show project detail view
  if (currentView === 'project' && selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject} 
        onBack={handleBackToProjectsList}
      />
    );
  }

  // Show all projects view
  if (currentView === 'projects') {
    return (
      <AllProjectsPage 
        onBack={handleBackFromAllProjects}
        onProjectClick={handleProjectClick}
      />
    );
  }

  // Show main portfolio view
  return (
    <div className="min-h-screen w-full bg-cream overflow-x-hidden relative">
      {/* Background ASCII Art spanning multiple sections */}
      
      {/* Pixel Frame Border */}
      <PixelFrame />
      
      {/* Navigation */}
      <PillNavigation 
        activeSection={activeSection} 
        onSectionChange={scrollToSection}
      />

      {/* Main Content */}
      <main className="relative w-full max-w-full mx-auto z-10">
        {/* Hero Section */}
        <motion.div
          id="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <HeroSection onExploreClick={handleExploreClick} />
        </motion.div>

        {/* About Section */}
        <motion.div
          id="about"
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <AboutSection />
        </motion.div>

        {/* Binary Tree Transition */}
        <ScrollBinaryTree />

        {/* Projects Section */}
        <motion.div
          id="projects"
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <ProjectsSection 
            onProjectClick={handleProjectClick}
            onViewAllClick={handleExploreClick}
          />
        </motion.div>

        {/* Contact Section */}
        <motion.div
          id="contact"
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <ContactSection />
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        className="relative py-8 text-center border-t-2"
        style={{ borderColor: '#3D405B' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-6">

          
          <div className="flex justify-center items-center gap-4">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#E07A5F' }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <span className="text-deep-slate/70 text-sm">
              © 2026 Tyler Mitts
            </span>
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#81B29A' }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </div>
        </div>
      </motion.footer>


    </div>
  );
}