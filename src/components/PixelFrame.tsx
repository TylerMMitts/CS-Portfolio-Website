import { motion } from 'motion/react';

export function PixelFrame() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* Top Border */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-4 flex"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="flex-1 h-full" style={{ backgroundColor: '#3D405B' }}>
          <div className="w-full h-full relative">
            {/* Decorative tech elements */}
            <div className="absolute left-4 top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#E07A5F' }} />
            <div className="absolute left-8 top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#81B29A' }} />
            <div className="absolute left-12 top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#F2CC8F' }} />
          </div>
        </div>
      </motion.div>

      {/* Bottom Border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-4"
        style={{ backgroundColor: '#3D405B' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <div className="w-full h-full relative">
          {/* Pixel pattern */}
          <div className="absolute right-4 top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#E07A5F' }} />
          <div className="absolute right-8 top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#81B29A' }} />
          <div className="absolute right-12 top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#F2CC8F' }} />
        </div>
      </motion.div>

      {/* Left Border */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-4"
        style={{ backgroundColor: '#3D405B' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <div className="w-full h-full relative">
          {/* Vertical decorative elements */}
          <motion.div
            className="absolute top-20 left-1 w-2 h-2 pixel-corners"
            style={{ backgroundColor: '#81B29A' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-40 left-1 w-2 h-2 pixel-corners"
            style={{ backgroundColor: '#F2CC8F' }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </div>
      </motion.div>

      {/* Right Border */}
      <motion.div
        className="absolute top-0 bottom-0 right-0 w-4"
        style={{ backgroundColor: '#3D405B' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <div className="w-full h-full relative">
          {/* Vertical decorative elements */}
          <motion.div
            className="absolute top-32 right-1 w-2 h-2 pixel-corners"
            style={{ backgroundColor: '#E07A5F' }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-60 right-1 w-2 h-2 pixel-corners"
            style={{ backgroundColor: '#81B29A' }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Corner Elements */}
      {/* Top-left corner */}
      <motion.div
        className="absolute top-0 left-0 w-4 h-4"
        style={{ backgroundColor: '#3D405B' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <motion.div
          className="w-2 h-2 absolute bottom-1 right-1 pixel-corners"
          style={{ backgroundColor: '#E07A5F' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Top-right corner */}
      <motion.div
        className="absolute top-0 right-0 w-4 h-4"
        style={{ backgroundColor: '#3D405B' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <motion.div
          className="w-2 h-2 absolute bottom-1 left-1 pixel-corners"
          style={{ backgroundColor: '#81B29A' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Bottom-left corner */}
      <motion.div
        className="absolute bottom-0 left-0 w-4 h-4"
        style={{ backgroundColor: '#3D405B' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <motion.div
          className="w-2 h-2 absolute top-1 right-1 pixel-corners"
          style={{ backgroundColor: '#F2CC8F' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Bottom-right corner */}
      <motion.div
        className="absolute bottom-0 right-0 w-4 h-4"
        style={{ backgroundColor: '#3D405B' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
      >
        <motion.div
          className="w-2 h-2 absolute top-1 left-1 pixel-corners"
          style={{ backgroundColor: '#E07A5F' }}
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
        />
      </motion.div>
    </div>
  );
}