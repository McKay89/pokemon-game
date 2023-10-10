import { useState, useEffect } from 'react'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { motion, AnimatePresence  } from 'framer-motion';
import translationEN from "./locales/en/translation.json";
import translationHU from "./locales/hu/translation.json";

import Main from './components/Main';
import Profile from './components/pages/Profile';
import Navbar from './components/Navbar';
import TestDownload from './components/pages/TestDownload';
import BackgroundCover from './components/BackgroundCover';
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
  const userDataJSON = localStorage.getItem('userData');
  const [user, setUser] = useState("")
  const { t } = useTranslation();
  const [sidebarHovered, setSidebarHovered] = useState(true);
  const [userData, setUserData] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSidebarHover = (value) => {
    setSidebarHovered(value);
  }

  const fillUserData = (data) => {
    setLoggedIn(true);
    localStorage.setItem('userData', JSON.stringify(data));
  }

  const handleLogout = () => {
    setUserData({logged: false});
    setLoggedIn(false);
    localStorage.removeItem('userData');
    navigate("/");
  }

  useEffect(() => {
    if(userDataJSON) {
      setUserData(JSON.parse(userDataJSON));
    }
  }, [loggedIn])

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
          user={userData}
          login={fillUserData}
          handleLogout={handleLogout}
        />
      </div>
      <BackgroundCover />
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
              />}
            />
            {/* TestDownload Component */}
            <Route path='/testdownload' element={
                <TestDownload
                  translation={t}
                  sidebarHovered={sidebarHovered}
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
