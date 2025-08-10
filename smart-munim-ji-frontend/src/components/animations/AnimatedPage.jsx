// src/components/animations/AnimatedPage.jsx

import React from "react";
import { motion } from "framer-motion";

/**
 * A reusable wrapper component that applies a fade-in and subtle slide-up animation
 * to any page it wraps. This component leverages framer-motion for smooth transitions.
 *
 * It works in conjunction with <AnimatePresence> in the routing setup (App.jsx).
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, // Start 20 pixels below its final position
  },
  in: {
    opacity: 1,
    y: 0, // Animate to its natural position
  },
  out: {
    opacity: 0,
    y: -20, // Exit by sliding up and fading out
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate", // A pleasing easing curve
  duration: 0.5, // Animation duration in seconds
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: "100%", height: "100%" }} // Ensures the animation covers the full page area
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
