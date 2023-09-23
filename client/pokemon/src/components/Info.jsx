import React from 'react';
import { Outlet, Link } from "react-router-dom";

export default function Main() {
    return (
      <>
        <div>
            Info !
        </div>
        <Outlet /> 
      </>
    )
}