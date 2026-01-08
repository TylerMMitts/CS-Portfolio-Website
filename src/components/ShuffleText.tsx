import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface ShuffleTextProps {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  loop?: boolean;
  loopDelay?: number;
}

export function ShuffleText({ 
  text = "Tyler Mitts", 
  className = "",
  duration = 2,
  delay = 0,
  loop = true,
  loopDelay = 4
}: ShuffleTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Characters to shuffle through - tech/glitch inspired
  const shuffleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=<>[]{}|\\/-_~^';
  
  const startShuffle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const targetArray = text.split('');
    const workingArray = new Array(targetArray.length).fill('');
    
    // Track which characters have been revealed
    const revealed = new Array(targetArray.length).fill(false);
    
    // Calculate when each character should be revealed (staggered)
    const revealTimes = targetArray.map((_, index) => {
      // Add some randomness but generally left-to-right
      const baseTime = (index / targetArray.length) * duration * 1000;
      const randomOffset = (Math.random() - 0.5) * 300; // ±150ms randomness
      return Math.max(0, baseTime + randomOffset);
    });
    
    const startTime = Date.now();
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let allRevealed = true;
      
      for (let i = 0; i < targetArray.length; i++) {
        if (elapsed >= revealTimes[i] && !revealed[i]) {
          // Reveal this character
          revealed[i] = true;
          workingArray[i] = targetArray[i];
        } else if (!revealed[i]) {
          // Keep shuffling this character
          if (targetArray[i] === ' ') {
            workingArray[i] = ' '; // Preserve spaces
          } else {
            workingArray[i] = shuffleChars[Math.floor(Math.random() * shuffleChars.length)];
          }
          allRevealed = false;
        }
      }
      
      setDisplayText(workingArray.join(''));
      
      // Stop animation when all characters are revealed
      if (allRevealed) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsAnimating(false);
        
        // Schedule next loop if enabled
        if (loop) {
          timeoutRef.current = setTimeout(() => {
            startShuffle();
          }, loopDelay * 1000);
        }
      }
    }, 50); // Update every 50ms for smooth shuffling
  };
  
  useEffect(() => {
    // Start initial animation after delay
    const initialTimeout = setTimeout(() => {
      startShuffle();
    }, delay * 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearTimeout(initialTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <motion.div
      className={`font-bold ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span 
        className="inline-block tracking-wider"
        style={{ 
          color: '#FFFFFF',
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          WebkitTextStroke: '1px #E07A5F',
          textShadow: isAnimating 
            ? '0 0 20px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4), 0 0 8px rgba(224, 122, 95, 0.6)' 
            : '0 0 15px rgba(255, 255, 255, 0.6), 0 0 8px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.3)',
          filter: isAnimating ? 'brightness(1.3) drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' : 'brightness(1.1) drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))',
          transition: 'text-shadow 0.2s ease, filter 0.2s ease',
          letterSpacing: '0.1em'
        }}
      >
        {displayText || text}
      </span>
      
      {/* Glitch overlay effect during animation */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0, 0.15, 0, 0.08, 0],
            x: [0, -1, 1, -0.5, 0],
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <span 
            className="inline-block tracking-wider"
            style={{ 
              color: '#FFFFFF',
              fontFamily: '"Press Start 2P", "Courier New", monospace',
              WebkitTextStroke: '1px #E07A5F',
              filter: 'blur(0.5px)',
              opacity: 0.4,
              letterSpacing: '0.1em'
            }}
          >
            {displayText}
          </span>
        </motion.div>
      )}
      
      {/* Cursor effect during animation */}
      {isAnimating && (
        <motion.span
          className="inline-block ml-1"
          style={{ 
            color: '#FFFFFF',
            WebkitTextStroke: '1px #E07A5F',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
            fontFamily: '"Press Start 2P", "Courier New", monospace'
          }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          _
        </motion.span>
      )}
    </motion.div>
  );
}