import { useState, useEffect } from 'react'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { AnimatePresence  } from 'framer-motion';
import translationEN from "./locales/en/translation.json";
import translationHU from "./locales/hu/translation.json";

import Main from './components/Main';
import Profile from './components/pages/Profile';
import Navbar from './components/Navbar';
import TestDownload from './components/pages/TestDownload';
import BackgroundCover from './components/BackgroundCover';
import CardCollection from './components/pages/CardCollection';
import './App.css'

const resources = {
  en: {
    translation: translationEN,
  },
  hu: {
    translation: translationHU,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sidebarHovered, setSidebarHovered] = useState(true);
  const [jwtToken, setJwtToken] = useState(null);
  const [activeComponent, setActiveComponent] = useState("main");

  useEffect(() => {
    const storedData = localStorage.getItem('JWT');
    if (storedData) {
      // Check JWT Token
      const JWTValidation = async () => {
        try {
          
          const response = await fetch(`/api/jwt/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({token: storedData})
          })

          if(response.status === 403) {
            const data = await response.json();
            localStorage.removeItem("JWT");
            console.log(data.message);
          } else if(response.status === 200) {
            const data = await response.json();
            setJwtToken(data.data);
          }
        } catch (err) {
          console.log(err);
        }
      }
      JWTValidation();
    }
  }, [])

  const handleSidebarHover = (value) => {
    setSidebarHovered(value);
  }

  const fillUserData = (data) => {
    setJwtToken(data.token);
    localStorage.setItem('JWT', data.token);
  }

  const handleLogout = () => {
    setJwtToken(null);
    localStorage.removeItem("JWT");
    navigate("/");
  }

  const handleActiveComponent = (value) => {
    setActiveComponent(value);
  }

  const handleContextMenu = (e) => {
    e.preventDefault();
  };
  
  return ( 
    <div className="app-container" onContextMenu={handleContextMenu}>
      <div className="app-navbar">
        {/* Sidebar Component */}
        <Navbar
          translation={t}
          handleSidebarHover={handleSidebarHover}
          login={fillUserData}
          handleLogout={handleLogout}
          jwtToken={jwtToken}
          activeComponent={handleActiveComponent}
        />
      </div>
      {/* Background Component */}
      <BackgroundCover
        translation={t}
        activeComponent={activeComponent}
      />
      <div className="app-components">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Main Component */}
            <Route path='/' element= {
                <Main
                  translation={t}
                  sidebarHovered={sidebarHovered}
                />
              }
            />
            {/* Profile Component */}
            <Route path='/profile/:username?' element={
              <Profile
                translation={t}
                sidebarHovered={sidebarHovered}
                jwtToken={jwtToken}
              />}
            />
            {/* TestDownload Component */}
            <Route path='/testdownload' element={
                <TestDownload
                  translation={t}
                  sidebarHovered={sidebarHovered}
                  jwtToken={jwtToken}
                />
              }
            />
            {/* Card Collection Component */}
            <Route path='/collection' element={
                <CardCollection
                  translation={t}
                  sidebarHovered={sidebarHovered}
                  jwtToken={jwtToken}
                />
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App
