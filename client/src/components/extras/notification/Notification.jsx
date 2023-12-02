import React, { useState, useEffect } from 'react';
import "./Notification.css";

export default function Notification({props}) {
    const [fadeOut, setFadeOut] = useState(false);
    const [notifyProgressBar, setNotifyProgressbar] = useState(100);
    let progressInterval;

    const color = 
        props.type === "ok" ? "#41bc3f" : 
        props.type === "info" ? "#5d7de5" :
        props.type === "warning" ? "#ccd218" :
        props.type === "error" ? "#c42323" : "#fff";

    const notifyStyle1 = 
        props.position == "top" ? {top: '100px'} :
        props.position == "bottom" ? {bottom: '100px'} :
        props.position == "middle" ? {top: '50%', transform: 'translateY(-50%)'} : undefined;

    const notifyStyle2 = {
        borderLeft: `6px solid ${color}`
    };

    useEffect(() => {
        const progressTick = props.duration / 10;
        const progressValue = 100 / progressTick;

        const timeout1 = setTimeout(() => {
            setFadeOut(true);
        }, props.duration);

        progressInterval = setInterval(() => {
            setNotifyProgressbar((prevValue) => prevValue - progressValue);
        }, 10)
      
        return () => clearTimeout(timeout1);
    }, [])

    useEffect(() => {
        if(notifyProgressBar <= 0) {
            clearInterval(progressInterval);
        }
    }, [notifyProgressBar])
    
    
    return(
        <div className="notification-container"  style={notifyStyle1}>
            <div className={ fadeOut ? "notification-container-out" : "notification-container-in" } style={notifyStyle2}>
                <div className="notification-icon" style={{color: color}}>
                    { props.type === "ok" ?
                        <i className="fa-solid fa-circle-check notify-icon"></i>
                    : props.type === "info" ?
                        <i className="fa-solid fa-circle-info notify-icon"></i>
                    : props.type === "warning" ?
                        <i className="fa-solid fa-triangle-exclamation notify-icon"></i>
                    : props.type === "error" ?
                        <i className="fa-solid fa-circle-exclamation notify-icon"></i>
                    : undefined }
                </div>
                <div className="notification-data">
                    <span className="notification-title">{props.type.toUpperCase()}</span>
                    <span className="notification-text">{props.text}</span>
                    <div className="notification-duration-bar">
                        <div style={{
                            width: `${notifyProgressBar}%`,
                            backgroundColor: `${color}`
                        }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}