import React from 'react';
import { Outlet, Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Main({translation}) {
    return (
      <>
        <div>
          <LanguageSwitcher translation={translation} />
        </div>
        <Outlet /> 
      </>
    )
}