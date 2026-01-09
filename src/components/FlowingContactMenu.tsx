import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Linkedin, FileText, ExternalLink } from 'lucide-react';

interface ContactItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  external?: boolean;
}

const contactItems: ContactItem[] = [
  {
    id: 'email',
    label: 'Email',
    icon: <Mail className="w-4 h-4 md:w-5 md:h-5" />,
    href: 'mailto:tmitts0206@gmail.com',
    external: true
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: <Linkedin className="w-4 h-4 md:w-5 md:h-5" />,
    href: 'https://www.linkedin.com/in/tyler-mitts-a67658375/',
    external: true
  },
  {
    id: 'resume',
    label: 'Resume',
    icon: <FileText className="w-4 h-4 md:w-5 md:h-5" />,
    href: '/assets/TylerMittsResume2026.pdf',
    external: true
  }
];

export function FlowingContactMenu() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play demo effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setAutoPlayIndex((prev) => (prev + 1) % contactItems.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Stop auto-play when user interacts
  useEffect(() => {
    if (hoveredIndex !== null) {
      setIsAutoPlaying(false);
    }
  }, [hoveredIndex]);

  const handleItemHover = (index: number) => {
    setHoveredIndex(index);
    setIsAutoPlaying(false);
  };

  const handleItemLeave = () => {
    setHoveredIndex(null);
    // Resume auto-play after a delay
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 3000);
  };

  const handleItemClick = (item: ContactItem, index: number) => {
    setActiveIndex(index);
    window.open(item.href, item.external ? '_blank' : '_self');
    
    // Reset active state after animation
    setTimeout(() => setActiveIndex(null), 600);
  };

  const isHighlighted = (index: number) => {
    return hoveredIndex === index || (isAutoPlaying && autoPlayIndex === index) || activeIndex === index;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Menu Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-deep-slate mb-4"
            style={{ fontFamily: '"Press Start 2P", "Courier New", monospace' }}>
          Let's Connect
        </h3>
        <div className="w-16 h-1 bg-burnt-orange mx-auto pixel-corners" />
      </motion.div>

      {/* Flowing Contact Menu */}
      <motion.div
        className="relative p-6 md:p-8 rounded-lg pixel-border glow-pixel"
        style={{ backgroundColor: '#3D405B' }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Dithering background pattern */}
        <div className="absolute inset-0 dither-bg opacity-20 rounded-lg" />
        
        {/* Contact Items Container */}
        <div 
          className="relative flex flex-wrap sm:flex-nowrap gap-4 md:gap-6 justify-center items-center"
          onMouseLeave={handleItemLeave}
        >
          {/* Contact Items */}
          {contactItems.map((item, index) => (
            <motion.button
              key={item.id}
              className="relative z-20 flex flex-col sm:flex-row items-center gap-2 md:gap-3 px-4 md:px-6 py-4 md:py-5 rounded-lg pixel-border transition-all duration-300 group min-w-[120px] md:min-w-[140px]"
              onMouseEnter={() => handleItemHover(index)}
              onClick={() => handleItemClick(item, index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: isHighlighted(index) ? 1.08 : 1,
                y: isHighlighted(index) ? -2 : 0,
                backgroundColor: isHighlighted(index) 
                  ? '#E07A5F' 
                  : 'rgba(244, 241, 222, 0.1)',
                borderColor: isHighlighted(index) 
                  ? '#E07A5F' 
                  : 'rgba(244, 241, 222, 0.3)',
                color: isHighlighted(index) 
                  ? '#F4F1DE' 
                  : '#F4F1DE'
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                backgroundColor: { duration: 0.3 },
                borderColor: { duration: 0.3 }
              }}
              style={{
                boxShadow: isHighlighted(index) 
                  ? `
                    0 0 15px rgba(224, 122, 95, 0.6),
                    0 0 30px rgba(224, 122, 95, 0.4),
                    0 0 45px rgba(224, 122, 95, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                  : 'none'
              }}
            >
              {/* Icon */}
              <motion.div
                className="relative"
                animate={{
                  rotate: isHighlighted(index) ? [0, -5, 5, 0] : 0
                }}
                transition={{ duration: 0.5 }}
              >
                {item.icon}
                {item.external && (
                  <ExternalLink className="absolute -top-1 -right-1 w-2 h-2 opacity-60" />
                )}
              </motion.div>

              {/* Label */}
              <span 
                className="text-xs md:text-sm font-medium tracking-wider"
                style={{ 
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  textShadow: isHighlighted(index) 
                    ? '0 0 8px rgba(244, 241, 222, 0.8)' 
                    : 'none'
                }}
              >
                {item.label}
              </span>

              {/* Liquid pixel noise effect when highlighted */}
              <AnimatePresence>
                {isHighlighted(index) && (
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
                        radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                        radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.25) 1px, transparent 1px)
                      `,
                      backgroundSize: '8px 8px, 12px 12px, 6px 6px'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>

              {/* Pulse effect when active */}
              <AnimatePresence>
                {isHighlighted(index) && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pixel-corners pointer-events-none"
                    style={{
                      border: '1px solid rgba(129, 178, 154, 0.5)',
                      backgroundColor: 'rgba(129, 178, 154, 0.1)'
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0, 0.6, 0],
                      scale: [0.8, 1.1, 1.2]
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Decorative corner elements */}
        <motion.div
          className="absolute top-2 left-2 w-3 h-3 pixel-corners"
          style={{ backgroundColor: '#81B29A' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 pixel-corners"
          style={{ backgroundColor: '#F2CC8F' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-2 left-2 w-2 h-2 pixel-corners"
          style={{ backgroundColor: '#F2CC8F' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-2 right-2 w-3 h-3 pixel-corners"
          style={{ backgroundColor: '#81B29A' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        {/* Auto-play indicator */}
        {isAutoPlaying && (
          <motion.div
            className="absolute -top-3 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full pixel-corners text-xs"
                 style={{ 
                   backgroundColor: '#81B29A', 
                   color: '#F4F1DE',
                   fontFamily: '"Press Start 2P", "Courier New", monospace'
                 }}>
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#F4F1DE' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Demo Mode
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}