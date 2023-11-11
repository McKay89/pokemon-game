import React, { useState, useEffect } from 'react';
import Loading from './extras/Loading';
import '../styles/BackgroundCover.css';

export default function BackgroundCover({translation, activeComponent}) {
  const [loading, setLoading] = useState(true);
  const [videoURL, setVideoURL] = useState("/video/menu/menu_bg_mewtwo.mp4");

  useEffect(() => {
    setLoading(true);
    const video = document.createElement('video');

    if(activeComponent == "main") {
      video.src = '/video/menu/menu_bg_mewtwo.mp4';
      setVideoURL(video.src);
    } else if(activeComponent == "collection") {
      video.src = '/video/collection/sunrays.mp4';
      setVideoURL(video.src);
    } else if(activeComponent == "adventure") {
      video.src = '';
      setVideoURL(video.src);
    }

    if(activeComponent != "adventure") {
      video.onloadeddata = () => {
        video.classList.add("loaded");
        video.play();
        setLoading(false);
      };
  
      video.load();
    } else {
      setLoading(false);
    }

    return () => {
      video.pause();
    };
  }, [activeComponent]);

  return (
    <div className="background-cover">
      {loading ? (
        <div className="background-loading-container">
          <Loading text={translation("loading_background_text")} scale={2.5} />
        </div>
      ) : activeComponent != "adventure" ? (
        <video className="video-background" autoPlay muted loop>
          <source src={videoURL} type="video/mp4" />
        </video>
      ) : (
        <div className="video-background"></div>
      )}
    </div>
  );
}