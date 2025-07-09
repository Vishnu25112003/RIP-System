"use client"; // <-- THIS IS CRITICAL IN NEXT.JS APP ROUTER

import React from "react";
import  { motion } from "framer-motion";
const AvailableDomain: React.FC = () => {
  const domains = [
    { name: "Web Development", color: "from-blue-500 to-blue-400", icon: "🌐" },
    { name: "Data Science", color: "from-green-500 to-teal-400", icon: "📊" },
    { name: "UI/UX Design", color: "from-purple-500 to-pink-500", icon: "🎨" },
    { name: "Digital Marketing", color: "from-red-500 to-orange-400", icon: "📈" },
    { name: "Mobile Development", color: "from-yellow-500 to-amber-400", icon: "📱" },
  ];

  const cardVariants = {
    offscreen: {
      y: 10,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Internship Domains</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our diverse range of internship opportunities tailored to your skills and interests.
          </p>
        </div>

        {/* Left to Right Scrolling */}
        <div className="mb-12 overflow-hidden">
          <motion.div
            className="flex"
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...domains, ...domains].map((domain, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: false, amount: 0.3 }}
                className="flex-shrink-0 mx-4"
              >
                <div
                  className={`bg-white backdrop-blur-sm shadow-lg rounded-xl p-6 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 min-w-[220px] border border-gray-200`}
                >
                  <div className="text-3xl mb-4 flex justify-center">{domain.icon}</div>
                  <h3 className="font-semibold text-lg text-gray-800 text-center">{domain.name}</h3>
                  <div className={`w-full h-1 mt-4 rounded-full bg-gradient-to-r ${domain.color}`}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right to Left Scrolling */}
        <div className="overflow-hidden">
          <motion.div
            className="flex"
            initial={{ x: "-50%" }}
            animate={{ x: 0 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...domains.reverse(), ...domains].map((domain, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: false, amount: 0.3 }}
                className="flex-shrink-0 mx-4"
              >
                <div
                  className={`bg-white backdrop-blur-sm shadow-lg rounded-xl p-6 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 min-w-[220px] border border-gray-200`}
                >
                  <div className="text-3xl mb-4 flex justify-center">{domain.icon}</div>
                  <h3 className="font-semibold text-lg text-gray-800 text-center">{domain.name}</h3>
                  <div className={`w-full h-1 mt-4 rounded-full bg-gradient-to-r ${domain.color}`}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AvailableDomain;