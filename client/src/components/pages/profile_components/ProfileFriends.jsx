import React, { useState, useEffect } from 'react';
import { useLocation} from "react-router-dom";
import { motion } from 'framer-motion';
import "./style/ProfileFriends.css";
import FriendsList from "./profile_friends_component/FriendsList";

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
            key="profile_friends"
            className="profile-friends-container"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            style={{
                backgroundImage: `url(/images/backgrounds/profile/profile_friends_bg.png)`
            }}
        >
            <div className="profile-friends-friendslist-container">
                <div className="profile-friends-friendslist">
                    <FriendsList/>
                </div>
                <div className="profile-friends-friendslist-menu">
                    <div className="profile-friends-friendslist-menu-friends">
                        <span>{translation("profile_friends_friendslist_text")}</span>
                    </div>
                    <div className="profile-friends-friendslist-menu-friends-requests">
                        <span>{translation("profile_friends_friendslist_requests_text")}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}