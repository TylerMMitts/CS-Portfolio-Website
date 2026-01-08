import { motion } from 'motion/react';
import { FlowingContactMenu } from './FlowingContactMenu';

export function ContactSection() {

  return (
    <section className="min-h-screen py-20 relative overflow-hidden flex items-center">
      <div className="absolute inset-0 dither-bg opacity-15" />
      
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-deep-slate mb-6">
            Let's Create Something
          </h2>
          <motion.div
            className="text-4xl md:text-6xl font-bold mb-8"
            style={{ color: '#E07A5F' }}
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Amazing Together
          </motion.div>
          
          <p className="text-xl text-deep-slate/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            I'd love to hear about your project 
            and explore how we can collaborate to create something extraordinary.
          </p>
        </motion.div>

        {/* Flowing Contact Menu */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <FlowingContactMenu />
        </motion.div>


      </div>

      {/* Animated background elements */}
      <motion.div
        className="absolute top-40 left-10 w-6 h-6 pixel-corners"
        style={{ backgroundColor: '#81B29A' }}
        animate={{ 
          rotate: 360,
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ 
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          opacity: { duration: 3, repeat: Infinity }
        }}
      />
      
      <motion.div
        className="absolute bottom-32 right-16 w-4 h-4 rounded-full"
        style={{ backgroundColor: '#F2CC8F' }}
        animate={{ 
          y: [0, -30, 0],
          x: [0, 20, 0],
          opacity: [0.4, 1, 0.4]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-60 right-32 w-3 h-3 pixel-corners"
        style={{ backgroundColor: '#E07A5F' }}
        animate={{ 
          rotate: -360,
          scale: [1, 1.3, 1]
        }}
        transition={{ 
          rotate: { duration: 6, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity }
        }}
      />
    </section>
  );
}