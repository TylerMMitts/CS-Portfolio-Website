import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

const terminalContent = [
  "tyler@portfolio:~$ whoami",
  "Tyler Mitts",
  "",
  "tyler@portfolio:~$ cat about.txt",
  "",
  "I'm a computer science major with a minor in mathematics at the University of",
  "Missouri-Columbia. I am passionate about software development and computer vision,",
  "in which I am exploring these interests through current projects and research that",
  "I am currently involved in.",
  "",
  "When I'm not coding, you'll find me staying active, either going on a hike,",
  "going to the gym, or playing sports with my friends. I am also active in the",
  "engineering fraternity here at Mizzou, Sigma Phi Delta, where I am pushed to",
  "be a better engineer and leader.",
  "",
  "My work is driven by creativity, using my imagination to push my learning and the",
  "limits of what is currently possible in whatever I am doing.",
  "",
  "tyler@portfolio:~$ ls skills/",
  "Software.js    Database.sql    UI.css    ImageProcessing.py    Creativity.gif",
  "",
  "tyler@portfolio:~$ █"
];



export function AboutSection() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex < terminalContent.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, terminalContent[currentLineIndex]]);
        setCurrentLineIndex(prev => prev + 1);
      }, currentLineIndex === 0 ? 1000 : Math.random() * 100 + 50);

      return () => clearTimeout(timer);
    }
  }, [currentLineIndex]);

  const getLineStyle = (line: string) => {
    if (line.startsWith('tyler@portfolio:~$')) {
      return 'text-sage-green font-bold';
    } else if (line.includes('.js') || line.includes('.art') || line.includes('.gif')) {
      return 'text-warm-yellow';
    } else if (line.startsWith('Tyler Mitts')) {
      return 'text-burnt-orange font-bold';
    } else if (line.includes("Let's build")) {
      return 'text-sage-green font-bold';
    } else {
      return 'text-cream/90';
    }
  };

  return (
    <section className="min-h-screen py-12 relative overflow-hidden z-10">
      <div className="absolute inset-0 dither-bg opacity-10" />
      

      
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full"
        >
          {/* Terminal Header */}
          <div className="mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-deep-slate mb-6">
              About Me
            </h2>
            <div className="w-24 h-1 rounded-full mx-auto" style={{ backgroundColor: '#81B29A' }} />
          </div>

          {/* Terminal Window */}
          <motion.div
            className="w-full bg-deep-slate pixel-border relative overflow-hidden z-20"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {/* Terminal Header Bar */}
            <div className="flex items-center justify-between p-4 bg-deep-slate border-b-2 border-white/20 bg-[rgba(242,204,143,1)]">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-white text-sm font-mono">
                terminal - tyler@portfolio
              </div>
              <div className="w-16"></div>
            </div>

            {/* Terminal Content */}
            <div 
              className="relative p-6 text-white min-h-[500px] overflow-hidden"
              style={{ 
                fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                background: `
                  linear-gradient(0deg, rgba(255, 255, 255, 0.02) 50%, transparent 50%),
                  radial-gradient(ellipse at center, rgba(255, 255, 255, 0.03) 0%, transparent 70%),
                  #3D405B
                `,
                backgroundSize: '100% 2px, 100% 100%',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                zIndex: 50
              }}
            >
              {displayedLines.map((line, index) => {
                const isLastLine = line === "tyler@portfolio:~$ █";
                const shouldBlinkCursor = isLastLine && currentLineIndex >= terminalContent.length;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1 }}
                    className={getLineStyle(line)}
                  >
                    {line === "" ? "\u00A0" : 
                     isLastLine ? (
                       <>
                         tyler@portfolio:~$ 
                         <motion.span
                           animate={shouldBlinkCursor ? { opacity: [1, 0] } : { opacity: 1 }}
                           transition={{ duration: 0.8, repeat: shouldBlinkCursor ? Infinity : 0 }}
                         >
                           █
                         </motion.span>
                       </>
                     ) : line
                    }
                  </motion.div>
                );
              })}
            </div>

            {/* Terminal Footer */}
            <div className="px-6 py-2 bg-deep-slate border-t border-white/10 text-white/80 text-xs font-mono bg-[rgba(242,204,143,1)]">
              <div className="flex justify-between">
                <span>UTF-8</span>
                <span>Lines: {displayedLines.length}</span>
                <span>Cols: 80</span>
              </div>
            </div>
          </motion.div>


        </motion.div>
      </div>
      
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 right-20 w-4 h-4 pixel-corners"
        style={{ backgroundColor: '#81B29A' }}
        animate={{ 
          rotate: 360,
          y: [0, -20, 0]
        }}
        transition={{ 
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          y: { duration: 4, repeat: Infinity }
        }}
      />
    </section>
  );
}