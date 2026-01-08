import { motion } from 'motion/react';

export const ScrollBinaryTree = () => {
  return (
    <div 
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ 
        height: '600px'
      }}
    >
      <div className="relative w-full max-w-5xl h-full">


        {/* SVG for all connections */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          style={{ zIndex: 1 }}
        >
          {/* Root to Level 1 connections */}
          <motion.line
            x1="50%" y1="20%" x2="30%" y2="35%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
          <motion.line
            x1="50%" y1="20%" x2="70%" y2="35%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          />

          {/* Level 1 to Level 2 connections */}
          <motion.line
            x1="30%" y1="35%" x2="20%" y2="50%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          />
          <motion.line
            x1="30%" y1="35%" x2="40%" y2="50%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          />
          <motion.line
            x1="70%" y1="35%" x2="60%" y2="50%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          />
          <motion.line
            x1="70%" y1="35%" x2="80%" y2="50%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.3, delay: 0.55 }}
          />

          {/* Level 2 to Level 3 connections */}
          <motion.line
            x1="20%" y1="50%" x2="15%" y2="65%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.7 }}
          />
          <motion.line
            x1="20%" y1="50%" x2="25%" y2="65%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.72 }}
          />
          <motion.line
            x1="40%" y1="50%" x2="35%" y2="65%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.75 }}
          />
          <motion.line
            x1="40%" y1="50%" x2="45%" y2="65%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.77 }}
          />
          <motion.line
            x1="60%" y1="50%" x2="55%" y2="65%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.8 }}
          />
          <motion.line
            x1="60%" y1="50%" x2="65%" y2="65%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.82 }}
          />
          <motion.line
            x1="80%" y1="50%" x2="75%" y2="65%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.85 }}
          />
          <motion.line
            x1="80%" y1="50%" x2="85%" y2="65%"
            stroke="#3D405B" 
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.87 }}
          />
        </svg>
        
        {/* Root Node */}
        <motion.div
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '50%',
            top: '20%',
            width: '24px',
            height: '24px',
            backgroundColor: '#E07A5F',
            border: '3px solid #3D405B',
            zIndex: 2
          }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05, type: "spring", stiffness: 200 }}
        />
        
        {/* Level 1 Nodes */}
        <motion.div
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '30%',
            top: '35%',
            width: '20px',
            height: '20px',
            backgroundColor: '#F2CC8F',
            border: '2px solid #3D405B',
            zIndex: 2
          }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.3, type: "spring", stiffness: 250 }}
        />
        <motion.div
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '70%',
            top: '35%',
            width: '20px',
            height: '20px',
            backgroundColor: '#F2CC8F',
            border: '2px solid #3D405B',
            zIndex: 2
          }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.35, type: "spring", stiffness: 250 }}
        />

        {/* Level 2 Nodes */}
        {[
          { x: '20%', delay: 0.6 },
          { x: '40%', delay: 0.62 },
          { x: '60%', delay: 0.65 },
          { x: '80%', delay: 0.67 }
        ].map((node, i) => (
          <motion.div
            key={`level2-${i}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: node.x,
              top: '50%',
              width: '18px',
              height: '18px',
              backgroundColor: '#81B29A',
              border: '2px solid #3D405B',
              zIndex: 2
            }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.2, delay: node.delay, type: "spring", stiffness: 300 }}
          />
        ))}

        {/* Level 3 Nodes (Leaves) */}
        {[
          { x: '15%', delay: 0.9 },
          { x: '25%', delay: 0.92 },
          { x: '35%', delay: 0.95 },
          { x: '45%', delay: 0.97 },
          { x: '55%', delay: 1.0 },
          { x: '65%', delay: 1.02 },
          { x: '75%', delay: 1.05 },
          { x: '85%', delay: 1.07 }
        ].map((node, i) => (
          <motion.div
            key={`level3-${i}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: node.x,
              top: '65%',
              width: '14px',
              height: '14px',
              backgroundColor: '#3D405B',
              border: '2px solid #3D405B',
              zIndex: 2
            }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.15, delay: node.delay, type: "spring", stiffness: 400 }}
          />
        ))}

        {/* Connection lines from bottom nodes to Featured Projects */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          style={{ zIndex: 3 }}
        >
          {/* Vertical lines from each bottom node extending downward */}
          {[
            { x: '15%' },
            { x: '25%' },
            { x: '35%' },
            { x: '45%' },
            { x: '55%' },
            { x: '65%' },
            { x: '75%' },
            { x: '85%' }
          ].map((line, i) => (
            <motion.line
              key={`vertical-connection-${i}`}
              x1={line.x} 
              y1="65%" 
              x2={line.x} 
              y2="100%"
              stroke="#3D405B" 
              strokeWidth="2"
              opacity="0.7"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: 1.15 + (i * 0.025)
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};