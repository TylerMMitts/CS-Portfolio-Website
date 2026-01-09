import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface ASCIIArtProps {
  className?: string;
  delay?: number;
}

export function ComputerASCII({ className = "", delay = 0 }: ASCIIArtProps) {
  return (
    <motion.pre
      className={`font-mono text-xs leading-none select-none ${className}`}
      style={{ color: '#3D405B' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1 }}
    >
      {`    ┌─────────────────┐
    │  ░░░░░░░░░░░░░  │
    │  ░ PORTFOLIO ░  │
    │  ░░░░░░░░░░░░░  │
    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │
    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │
    └─────────────────┘
         ┌─────┐
         │  ○  │
         └─────┘`}
    </motion.pre>
  );
}

export function TerminalASCII({ className = "", delay = 0 }: ASCIIArtProps) {
  const [cursor, setCursor] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCursor(prev => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.pre
      className={`font-mono text-xs leading-none select-none ${className}`}
      style={{ color: '#E07A5F' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.8 }}
    >
      {`┌─ terminal ─────────┐
│ $ whoami          │
│ tyler_mitts       │
│ $ ls skills/      │
│ react.js          │
│ design.js         │
│ creativity.js     │
│ $ ./portfolio     │
│ ► Loading...      │
│ ► Ready!${cursor ? '█' : ' '}         │
└───────────────────┘`}
    </motion.pre>
  );
}

export function CircuitASCII({ className = "", delay = 0 }: ASCIIArtProps) {
  return (
    <motion.pre
      className={`font-mono text-xs leading-none select-none ${className}`}
      style={{ color: '#81B29A' }}
      initial={{ opacity: 0, rotate: -5 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ delay, duration: 1.2 }}
    >
      {`    ◊───┬───◊
       │   │
    ◊──┼───┼──◊
       │   │
    ◊──┴─┬─┴──◊
         │
      ◊──┼──◊
         │
      ◊──┴──◊`}
    </motion.pre>
  );
}

export function CodeBlockASCII({ className = "", delay = 0 }: ASCIIArtProps) {
  const [highlightLine, setHighlightLine] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightLine(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.pre
      className={`font-mono text-xs leading-none select-none ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
    >
      {`╭─ code.tsx ─────────╮
│                    │
│ ${highlightLine === 0 ? '►' : ' '} const magic = () │
│ ${highlightLine === 1 ? '►' : ' '}   return <Art>   │
│ ${highlightLine === 2 ? '►' : ' '}     {creative}   │
│ ${highlightLine === 3 ? '►' : ' '}   </Art>        │
│                    │
╰────────────────────╯`}
    </motion.pre>
  );
}

export function BinaryStreamASCII({ className = "", delay = 0 }: ASCIIArtProps) {
  const [binary, setBinary] = useState(['1010', '0101', '1100', '0011']);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBinary(prev => prev.map(() => 
        Math.random().toString(2).substr(2, 4).padStart(4, '0')
      ));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.pre
      className={`font-mono text-xs leading-none select-none ${className}`}
      style={{ color: '#F2CC8F' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 1 }}
    >
      {`┌─ data_stream ─┐
│  ${binary[0]}      │
│  ${binary[1]}      │
│  ${binary[2]}      │
│  ${binary[3]}      │
│  flowing...   │
└───────────────┘`}
    </motion.pre>
  );
}

export function PixelArtRocket({ className = "", delay = 0 }: ASCIIArtProps) {
  return (
    <motion.pre
      className={`font-mono text-xs leading-none select-none ${className}`}
      style={{ color: '#E07A5F' }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: 1, 
        y: [50, 0, -5, 0] 
      }}
      transition={{ 
        delay, 
        duration: 2,
        y: { 
          duration: 3, 
          repeat: Infinity, 
          repeatType: "reverse" 
        }
      }}
    >
      {`    ▲
   ███
   █▓█
   ███
   █▓█
   ███
  ▄█▓█▄
 ▄██▓██▄
   ▓▓▓
   ▓▓▓
   ░░░`}
    </motion.pre>
  );
}

export function WifiSignalASCII({ className = "", delay = 0 }: ASCIIArtProps) {
  const [signalStrength, setSignalStrength] = useState(4);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalStrength(prev => {
        const newStrength = Math.floor(Math.random() * 5) + 1;
        return newStrength;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.pre
      className={`font-mono text-xs leading-none select-none ${className}`}
      style={{ color: '#81B29A' }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
    >
      {`   ◢◤
  ◢◤◥◣
 ◢◤   ◥◣
◢◤     ◥◣

${signalStrength >= 1 ? '█' : '░'} ${signalStrength >= 2 ? '█' : '░'} ${signalStrength >= 3 ? '█' : '░'} ${signalStrength >= 4 ? '█' : '░'} ${signalStrength >= 5 ? '█' : '░'}
CONNECTED`}
    </motion.pre>
  );
}

export function ASCIIDecorations() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return null;
  }

  return (
    <>
      {/* Top Left */}
      <motion.div
        className="absolute top-20 left-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 2 }}
      >
        <ComputerASCII delay={2.2} />
      </motion.div>

      {/* Top Right */}
      <motion.div
        className="absolute top-16 right-12 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 2.5 }}
      >
        <TerminalASCII delay={2.7} />
      </motion.div>

      {/* Middle Left */}
      <motion.div
        className="absolute top-1/2 left-6 transform -translate-y-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 3 }}
      >
        <CircuitASCII delay={3.2} />
      </motion.div>

      {/* Middle Right */}
      <motion.div
        className="absolute top-1/2 right-8 transform -translate-y-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 3.5 }}
      >
        <CodeBlockASCII delay={3.7} />
      </motion.div>

      {/* Bottom Left */}
      <motion.div
        className="absolute bottom-32 left-12 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 4 }}
      >
        <BinaryStreamASCII delay={4.2} />
      </motion.div>

      {/* Bottom Right */}
      <motion.div
        className="absolute bottom-24 right-16 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 4.5 }}
      >
        <PixelArtRocket delay={4.7} />
      </motion.div>

      {/* Floating WiFi Signal */}
      <motion.div
        className="absolute top-1/3 right-1/4 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 5 }}
      >
        <WifiSignalASCII delay={5.2} />
      </motion.div>

      {/* Additional decorative elements for mobile */}
      <motion.div
        className="absolute top-1/4 left-1/4 z-10 hidden sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 5.5 }}
      >
        <motion.pre
          className="font-mono text-xs leading-none select-none"
          style={{ color: '#3D405B' }}
          animate={{ 
            rotate: [0, 2, -2, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {`   ◆ ◇ ◆
  ◇ ◆ ◇ ◆
 ◆ ◇ ◆ ◇ ◆
  ◇ ◆ ◇ ◆
   ◆ ◇ ◆`}
        </motion.pre>
      </motion.div>
    </>
  );
}