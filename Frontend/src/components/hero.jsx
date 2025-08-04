import { CreditCardModel } from "./card_model";
import { motion } from "framer-motion";
import { FaAngleRight } from "react-icons/fa";
import { Link } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.6,
      duration: 1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const Hero = () => {

  return (
    <section
      id="home"
      className="relative w-full h-screen bg-gradient-to-br from-gray-950 to-gray-900 overflow-hidden"
    >
      {/* Credit Card Model */}
      <div className="absolute top-1/2 right-10 transform -translate-y-1/2 z-5 md:block hidden">
        <CreditCardModel />
      </div>
      
      {/* Mobile Credit Card Model - positioned below text */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-5 md:hidden block">
        <CreditCardModel mobile={true} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-8 md:px-16"
      >
        <div className="w-full max-w-screen-xl mx-auto flex flex-col items-start justify-center -mt-16 md:-mt-8">
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-light mb-8 text-white"
          >
            Choose With <br />
            <span className="font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-300 bg-clip-text text-transparent">
              Confidence.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-gray-200 text-sm sm:text-base font-semibold max-w-xl mb-6 md:mb-8"
          >
            Whether you're new to credit or a rewards pro, we'll guide you to the right card.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4 items-center"
          >
            <RouterLink
              to="/questionnaire"
              className="border border-white text-white px-6 py-3 rounded-xl text-sm sm:text-md font-medium hover:bg-gray-200 hover:text-black transition duration-200"
            >
              Get Started
            </RouterLink>

            <Link
              to="about"
              smooth
              duration={500}
              className="text-white text-sm sm:text-md px-6 py-3 hover:text-blue-300 flex items-center gap-2 transition cursor-pointer"
            >
              Learn More <FaAngleRight />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
