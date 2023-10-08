import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './style/TestDownload.css';

function CircularProgressWithLabel(props) {
    return (
        <div className="progressbar-container">
            <CircularProgress variant="determinate" {...props} />
            <div className="progressbar-label">
                <Typography variant="caption" component="div" color="text.first">
                    {`${Math.round(props.value)}%`}
                </Typography>
            </div>
        </div>
    );
  }

  CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
};

export default function TestDownload({translation, sidebarHovered}) {
    const [progress, setProgress] = React.useState(0);

    // Load audio files
    useEffect(() => {
        const audioFiles = ["/audio/music/music1.mp3", "/audio/music/music2.mp3", "/audio/music/music3.mp3", "/audio/music/music4.mp3", "/audio/music/music5.mp3", "/audio/music/music6.mp3"];
        const totalAudioFiles = audioFiles.length;
        let loadedAudioFiles = 0;

        const audioLoadHandler = () => {
            loadedAudioFiles++;
            const newProgress = (loadedAudioFiles / totalAudioFiles) * 100;
            setProgress(newProgress);

            if (loadedAudioFiles === totalAudioFiles) {
                clearInterval(timer);
            }
        };

        audioFiles.forEach((audioFile) => {
            const audio = new Audio(audioFile);
            audio.addEventListener('canplaythrough', audioLoadHandler);
        });

        return () => {
            audioFiles.forEach((audioFile) => {
                const audio = new Audio(audioFile);
                audio.removeEventListener('canplaythrough', audioLoadHandler);
            });
        };
    }, []);

    return (
        <div className={sidebarHovered ? 'download-container-hovered' : 'download-container'}>
            { progress < 100 ?
                <Box style={{ width: '100%' }}>
                    <CircularProgressWithLabel value={progress} />
                </Box>
            :
                <div className="component-container">

                </div>
            }
        </div>
    );
}