import React, { useState, useEffect } from 'react';
import '../styles/BackgroundCover.css';

function BackgroundCover() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = './video/menu/menu_bg_mewtwo.mp4';

    video.onloadeddata = () => {
      setLoading(false);
      video.play();
    };

    video.load();

    return () => {
      video.pause();
    };
  }, []);

  return <div className="background-cover">
    {loading ? (
      <div>Töltés...</div>
      ) : null}
      <video className="video-background" autoPlay muted loop>
        <source src="./video/menu/menu_bg_mewtwo.mp4" type="video/mp4" />
      </video>
      <div className="content">
        {/* Ide helyezd a komponens tartalmát */}
      </div>
  </div>;
}

export default BackgroundCover;