import React, { useState, useEffect } from 'react';
import { useLocation} from "react-router-dom";
import { motion } from 'framer-motion';
import MatchStatistics from './profile_overview_components/MatchStatistics';
import "./style/ProfileOverview.css";

export default function ProfileOverview({translation, userid, token}) {
    const location = useLocation();

    const pageTransition = {
        initial: {
            opacity: 0,
            x: 0
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

    return (
        <motion.div
            key="profile_overview"
            className="profile-overview-container"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            style={{
                backgroundImage: `url(/images/backgrounds/profile/profile_overview_bg.png)`
            }}
        >
            <div className="profile-overview-container">
                <div className="profile-overview-left">
                    <span>Left</span>
                </div>
                <div className="profile-overview-right">
                    <MatchStatistics
                        translation={translation}
                        userid={userid}
                        token={token}
                    />
                </div>
            </div>
        </motion.div>
    );
}