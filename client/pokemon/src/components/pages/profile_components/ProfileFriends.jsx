import React, { useState, useEffect } from 'react';
import { useLocation} from "react-router-dom";
import { motion } from 'framer-motion';
import "./style/ProfileFriends.css";

export default function ProfileFriends({translation}) {
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
            key={location.pathname}
            className="profile-friends-container"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <span>{translation("profile_sidebar_friends")}</span>
        </motion.div>
    );
}