'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function BackgroundParallax() {
  const { scrollY } = useScroll();

  // Unified spring physics configuration for lag-free visual interpolation
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothScrollY = useSpring(scrollY, springConfig);

  // Map scroll value coordinates to 3D translation parallax percentages
  const y1 = useTransform(smoothScrollY, [0, 1000], [0, 80]);
  const x1 = useTransform(smoothScrollY, [0, 1000], [0, 60]);

  const y2 = useTransform(smoothScrollY, [0, 1000], [0, -80]);
  const x2 = useTransform(smoothScrollY, [0, 1000], [0, -60]);

  const y3 = useTransform(smoothScrollY, [0, 1000], [0, -40]);
  const x3 = useTransform(smoothScrollY, [0, 1000], [0, 40]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Blob 1 - Indigo Mesh */}
      <motion.div
        style={{ x: x1, y: y1 }}
        className="absolute -top-[10%] -left-[10%] w-[45vw] h-[45vw] rounded-full bg-radial from-indigo-500/20 to-transparent blur-[120px] dark:from-indigo-500/10 mix-blend-multiply dark:mix-blend-screen opacity-70"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 30, 60, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Blob 2 - Emerald Mesh */}
      <motion.div
        style={{ x: x2, y: y2 }}
        className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-radial from-emerald-500/20 to-transparent blur-[120px] dark:from-emerald-500/10 mix-blend-multiply dark:mix-blend-screen opacity-70"
        animate={{
          x: [0, -60, 30, 0],
          y: [0, -40, -70, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Blob 3 - Pink Mesh */}
      <motion.div
        style={{ x: x3, y: y3 }}
        className="absolute top-[40%] left-[50%] w-[35vw] h-[35vw] rounded-full bg-radial from-pink-500/20 to-transparent blur-[120px] dark:from-pink-500/10 mix-blend-multiply dark:mix-blend-screen opacity-70"
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -30, 40, 0],
          scale: [0.95, 1.1, 0.9, 0.95],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
