import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({translation}) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <>
        <span>{translation("please_select_language")}</span>
        <select value={i18n.language} onChange={handleLanguageChange}>
        <option value="en">{translation("language_english")}</option>
        <option value="hu">{translation("language_hungarian")}</option>
        </select>
    </>
  );
};

export default LanguageSwitcher;