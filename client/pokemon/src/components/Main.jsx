import i18next from 'i18next';
import React, { useState, useEffect } from 'react';
import { Outlet, Link } from "react-router-dom";
import "../styles/Main.css";

export default function Main({translation, sidebarHovered}) {
    const [testData, setTestData] = useState({});
    const [gameLanguage, setGameLanguage] = useState(i18next.language);

    useEffect(() => {
      const fetchTestData = async () => {
        try {
          const response = await fetch('/api/testdata');
          const data = await response.json();
          setTestData(data);
          setGameLanguage(i18next.language);
        } catch (error) {
          console.log(error);
        }
      }

      fetchTestData();
    }, [i18next.language])    

    return (
      <>
        <div className={sidebarHovered ? 'home-container-hovered' : 'home-container'}>
          <img className="home-logo-img" src="/images/logo/home_logo_3.png" />
          <div className="mckay89">
            <span>Pokemon - The Card Game</span><br />
            <span>Developed by McKay89</span><br />
            <span>Version: 0.1 (development phase)</span><br />
            <span>Last update: 2023.10.07</span>
          </div>
        </div>
        <Outlet /> 
      </>
    )
}