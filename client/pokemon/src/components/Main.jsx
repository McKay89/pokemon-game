import i18next from 'i18next';
import React, {useState, useEffect} from 'react';
import { Outlet, Link } from "react-router-dom";

export default function Main({translation}) {
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
        <div>
            <span>Name: {testData.name}</span><br />
            <span>Description: {testData.desc && testData.desc[gameLanguage]}</span>
        </div>
        <Outlet /> 
      </>
    )
}