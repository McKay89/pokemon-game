import React, {useState, useEffect} from 'react';
import { Outlet, Link } from "react-router-dom";

export default function Main({translation}) {
    const [testData, setTestData] = useState({});

    useEffect(() => {
      const fetchTestData = async () => {
        try {
          const response = await fetch('/api/testdata');
          const data = await response.json();
          setTestData(data);
        } catch (error) {
          console.log(error);
        }
      }

      fetchTestData();
    }, [])
    

    return (
      <>
        <div>
            {testData.name}
        </div>
        <Outlet /> 
      </>
    )
}