import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export function PillNavigation({ activeSection, onSectionChange }: NavigationProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = (itemId: string) => {
    console.log('Navigation clicked:', itemId);
    onSectionChange(itemId);
  };

  // Mobile Navigation - Hidden for mobile users
  if (isMobile) {
    return null;
  }

  // Desktop Navigation - Original design restored
  return (
    <motion.nav 
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-center gap-2 bg-cream/95 backdrop-blur-sm rounded-full p-2 pixel-border shadow-lg">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative px-6 py-3 rounded-full transition-all duration-300 text-sm font-medium"
            style={{ color: '#3D405B' }}
          >
            {(activeSection === item.id || hoveredItem === item.id) && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#E07A5F' }}
                layoutId="pill-indicator"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            <span 
              className={`relative z-10 transition-colors duration-300 font-medium ${
                activeSection === item.id || hoveredItem === item.id 
                  ? 'text-cream' 
                  : 'text-deep-slate'
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
}