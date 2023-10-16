import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import "./style/ProfileSettings.css";

export default function ProfileSettings({translation}) {
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
            key="profile_fsettings"
            className="profile-settings-container"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            style={{
                backgroundImage: `url(/images/backgrounds/profile/profile_settings_bg.png)`
            }}
        >
            <span>{translation("profile_sidebar_settings")}</span>
        </motion.div>
    );
}