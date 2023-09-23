import React from 'react';
import { Outlet, Link } from "react-router-dom";

export default function Main({translation}) {
    return (
      <>
        <div>
          {translation("hello_world")}
        </div>
        <Outlet /> 
      </>
    )
}