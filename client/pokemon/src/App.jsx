import { useState } from 'react'
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
  const [user, setUser] = useState("")
  const { t } = useTranslation();
  return ( 
    <Routes>
      <Route path='/' element={<Navbar translation={t} />}>
        <Route path='/' element={<Main translation={t} />} />
        <Route path='/info' element={<Info translation={t}/>} />
      </Route>
    </Routes>
  );
}

export default App
