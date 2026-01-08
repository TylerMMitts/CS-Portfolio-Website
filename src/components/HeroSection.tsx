import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShuffleText } from './ShuffleText';
import { ASCIIDecorations } from './ASCIIDecorations';
import profileImage from 'figma:asset/9af604b38792234218744ca7e0e559ee94c00208.png';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  const title = "Computer Science";

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 px-4">
      {/* Background dithering pattern */}
      <div className="absolute inset-0 dither-bg tech-grid opacity-30" />
      
      {/* Animated background elements */}
      <motion.div
        className="absolute top-32 left-20 w-3 h-3 rounded-full"
        style={{ backgroundColor: '#81B29A' }}
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          delay: 0
        }}
      />
      <motion.div
        className="absolute top-40 right-32 w-2 h-2 rounded-full"
        style={{ backgroundColor: '#F2CC8F' }}
        animate={{ 
          y: [0, -15, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          delay: 1
        }}
      />
      <motion.div
        className="absolute bottom-32 left-40 w-4 h-4 rounded-full"
        style={{ backgroundColor: '#E07A5F' }}
        animate={{ 
          y: [0, -25, 0],
          opacity: [0.4, 0.9, 0.4]
        }}
        transition={{ 
          duration: 3.5,
          repeat: Infinity,
          delay: 2
        }}
      />

      <div className="relative z-20 text-center">
        {/* Profile Image and Name Container */}
        <div className="relative mb-8 z-30">
          {/* Profile Image */}
          <motion.div
            className="relative mx-auto w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 aspect-square rounded-full overflow-hidden pixel-corners glow-pixel bg-white/20 backdrop-blur-sm"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          >
            <ImageWithFallback
              src={profileImage}
              alt="Tyler Mitts"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-burnt-orange/20" />
            
            {/* Floating tech elements around profile */}
            <motion.div
              className="absolute -top-6 -right-6 w-10 h-10 pixel-corners"
              style={{ backgroundColor: '#81B29A' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -bottom-6 -left-6 w-8 h-8 pixel-corners"
              style={{ backgroundColor: '#F2CC8F' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Shuffle Text Animation - Slightly overlapping the image */}
          <motion.div
            className="absolute -bottom-4 md:-bottom-6 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <ShuffleText 
              text="Tyler Mitts"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl relative whitespace-nowrap"
              duration={2.5}
              delay={1.5}
              loop={true}
              loopDelay={5}
            />
          </motion.div>
        </div>

        {/* Title with typewriter effect */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.h2
            className="text-lg sm:text-xl md:text-2xl font-medium text-burnt-orange mb-6"
            initial={{ width: 0 }}
            animate={{ width: "auto" }}
            transition={{ delay: 2, duration: 1.5 }}
            style={{ overflow: "hidden", whiteSpace: "nowrap" }}
          >
            {title}
          </motion.h2>
        </motion.div>



        {/* Call to action */}
        <motion.button
          onClick={onExploreClick}
          className="mt-8 px-8 py-4 rounded-full pixel-border glow-pixel transition-all duration-300 hover:scale-105"
          style={{ 
            backgroundColor: '#E07A5F',
            color: '#F4F1DE'
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 3 }}
          whileHover={{ 
            boxShadow: "0 0 20px rgba(224, 122, 95, 0.6)" 
          }}
          whileTap={{ scale: 0.95 }}
        >
          Explore My Work
        </motion.button>
      </div>

      {/* ASCII Tech Decorations */}
      <ASCIIDecorations />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
      >
        <motion.div
          className="w-6 h-10 border-2 rounded-full flex justify-center"
          style={{ borderColor: '#3D405B' }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 rounded-full mt-2"
            style={{ backgroundColor: '#E07A5F' }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}