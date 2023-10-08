import { useState, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom';
import axios from "axios";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en/translation.json";
import translationHU from "./locales/hu/translation.json";

import Main from './components/Main';
import Info from './components/Info';
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
        <Routes>
          <Route path='/' element= {
            <Main
              translation={t}
              sidebarHovered={sidebarHovered}
            />}
          />
          <Route path='/info' element={
            <Info
              translation={t}
            />}
          />
          <Route path='/testdownload' element={
            <TestDownload
              translation={t}
              sidebarHovered={sidebarHovered}
            />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App
