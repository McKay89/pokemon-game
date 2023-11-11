import React, { useState, useEffect } from "react";
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import "./MusicPlayer.css";

const useAudio = (url, initialVolume) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    setVolume(initialVolume)
    playing ? audio.play() : audio.pause();
  },[playing, initialVolume]);

  useEffect(() => {
    audio.volume = volume;
  }, [volume])
  

  useEffect(() => {
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      audio.play();
    });
    return () => {
      audio.removeEventListener('ended', () => {
        audio.currentTime = 0;
        audio.play();
      });
    };
  }, []);

  return [playing, toggle];
};

const Player = ({ url, translation, initialVolume, handlerMusicStatus }) => {
  const [playing, toggle] = useAudio(url, initialVolume);

  return (
    <div>
        <Tooltip
          title={<span style={{ color: "#fff", fontSize: "14px" }}>{playing ? translation("music_turn_off") : translation("music_turn_on")}</span>}
          placement='top'
          arrow
          TransitionComponent={Zoom}
          TransitionProps={{ timeout: 600 }}
        >
            <label className="volume">
                { playing ?
                    <input onClick={(e) => { toggle(e); handlerMusicStatus(); }} type="checkbox" />
                :
                    <input onClick={(e) => { toggle(e); handlerMusicStatus(); }} type="checkbox" defaultChecked />
                }
                <svg viewBox="0 0 108 96">
                    <path d="M7,28 L35,28 L35,28 L59,8 L59,88 L35,68 L7,68 C4.790861,68 3,66.209139 3,64 L3,32 C3,29.790861 4.790861,28 7,28 Z"></path>
                    <path d="M79,62 C83,57.3333333 85,52.6666667 85,48 C85,43.3333333 83,38.6666667 79,34 L49,3"></path>
                    <path d="M95,69 C101.666667,61.6666667 105,54.3333333 105,47 C105,39.6666667 101.666667,32.3333333 95,25 L75.5,6 L49,33"></path>
                </svg>
            </label>
        </Tooltip>
    </div>
  );
};

export default Player;