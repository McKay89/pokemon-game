import React from 'react';
import "./Loading.css";

export default function Loading({text, scale}) {
    return(
        <div className="loading-container">
            <div
                className="loading-middle"
                style={{
                    transform: `translate(-50%, -50%) scale(${scale})`
                }}
            >
                    <div className="loading-bar loading-bar1"></div>
                    <div className="loading-bar loading-bar2"></div>
                    <div className="loading-bar loading-bar3"></div>
                    <div className="loading-bar loading-bar4"></div>
                    <div className="loading-bar loading-bar5"></div>
                    <div className="loading-bar loading-bar6"></div>
                    <div className="loading-bar loading-bar7"></div>
                    <div className="loading-bar loading-bar8"></div>
            </div>
            <span className="loading-text">{text}</span>
        </div>
    );
}