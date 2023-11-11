import i18next from 'i18next';
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import "../styles/Main.css";

export default function Main({translation, sidebarHovered}) {
    const location = useLocation();
    const active = true;
    const [testData, setTestData] = useState({});
    const [gameLanguage, setGameLanguage] = useState(i18next.language);

    const pageTransition = {
      initial: {
        opacity: 0,
        x: -200
      },
      animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5 }
      },
      exit: {
        opacity: 0,
        x: 0,
        transition: { duration: 0.5 }
      },
    };  

    return (
        <motion.div
          className={sidebarHovered ? 'home-container-hovered' : 'home-container'}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransition}
          key={location.pathname}
        >
          <img className="home-logo-img" src="/images/logo/home_logo_3.png" />
          <div className="mckay89">
            <span>Pokemon - The Card Game</span><br />
            <span>Developed by McKay89</span><br />
            <span>Version ~ in development phase</span><br />
            <span>Last update: 2023.11.04</span>
          </div>
          <Outlet /> 
        </motion.div>
    )
}