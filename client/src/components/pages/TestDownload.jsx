import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from "react-router-dom";
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { motion  } from 'framer-motion';
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

export default function TestDownload({translation, sidebarHovered, jwtToken}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [progress, setProgress] = React.useState(0);

    const pageTransition = {
        initial: {
            opacity: 0,
            x: -200
        },
        animate: {
            opacity: 1,
            x: 0,
            transition: { duration: 1 }
        },
        exit: {
            opacity: 0,
            x: 0,
            transition: { type: 'tween', ease: 'easeOut', duration: 1 }
        },
    };

    // Check user is logged in
    useEffect(() => {
        if(jwtToken == null) {
            navigate("/");
        }
    }, [])

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

    const handleGoHome = () => {
        navigate('/');
    };    

    return (
        <motion.div
            key={location.pathname}
            className={sidebarHovered ? 'download-container-hovered' : 'download-container'}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            { progress < 100 ?
                <Box style={{ width: '100%' }}>
                    <CircularProgressWithLabel value={progress} />
                </Box>
            :
                <div className="component-container">

                </div>
            }
            <button  onClick={handleGoHome}>HOME</button>
        </motion.div>
    );
}