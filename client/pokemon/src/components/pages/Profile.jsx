import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import ProfileOverview from "./profile_components/ProfileOverview";
import ProfileMessages from "./profile_components/ProfileMessages";
import ProfileFriends from "./profile_components/ProfileFriends";
import ProfileSettings from "./profile_components/ProfileSettings";
import './style/Profile.css';

export default function Profile({translation, sidebarHovered}) {
    let { username } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [xpBar, setXpBar] = useState(0);
    const [userData, setUserData] = useState({});
    const userDataJSON = localStorage.getItem('userData');
    const [profileComponent, setProfileComponent] = useState("overview");

    const pageTransition = {
        initial: {
            opacity: 0,
            x: -200
        },
        animate: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5 }
        },
        exit: {
            opacity: 0,
            x: 0,
            transition: { type: 'tween', ease: 'easeOut', duration: 0.5 }
        },
    };

    // Check user is logged in & get user data
    useEffect(() => {
        const uDataJSON = JSON.parse(userDataJSON);
        if(!userDataJSON) {
            navigate("/");
        } else {
            if(uDataJSON.username == username) {
                const fetchUserData = async () => {
                    try {
                        const getUserData = await fetch(`/api/user/get/${uDataJSON.username}`);
                        const data = await getUserData.json();
                        setUserData(data);
                    } catch (err) {
                        console.log(err)
                    }
                }
                fetchUserData();
            } else {
                if(username == null || username == undefined || username === "") {
                    navigate("/");
                } else {
                    // Fetch other user data
                }
            }
        }
    }, [])

    const handleGoHome = () => {
        navigate('/');
    };

    useEffect(() => {
        // Calculate actual XP Bar length
        let xpPercent = 1000 / 100;
        let actualPercent = userData.xp / xpPercent;
        setXpBar(actualPercent * 1.2);
    }, [userData])

    const handleProfileComponent = (value) => {
        setProfileComponent(value);
    }

    return(
        <motion.div
            key={location.pathname}
            className={sidebarHovered ? 'profile-container-hovered' : 'profile-container'}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <div className="profile-box-container">
                <div className="profile-light"></div>
                <div className="profile-top-part">
                    <div
                        className="profile-avatar"
                        style={{
                            backgroundImage: `url(${userData.avatar})`
                        }}
                    >
                    </div>
                    <div className="profile-basic-data">
                        <div className="xp-bar-container">
                            <div className="xp-bar">  
                                <span style={{width: `${xpBar}px`}} className="xp-bar-active"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="profile-bottom-part">
                    <div className="profile-sidebar">
                        <hr />
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("profile_sidebar_overview")}</span>}
                            placement='right'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                        <div className={profileComponent == "overview" ? "profile-sidebar-menu-active" : "profile-sidebar-menu"} onClick={() => handleProfileComponent("overview")}>
                            <i className="fa-solid fa-address-card overview-icon"></i>
                        </div>
                        </Tooltip>
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("profile_sidebar_messages")}</span>}
                            placement='right'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                        <div className={profileComponent == "messages" ? "profile-sidebar-menu-active" : "profile-sidebar-menu"} onClick={() => handleProfileComponent("messages")}>
                            <i className="fa-solid fa-envelope messages-icon"></i>
                        </div>
                        </Tooltip>
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("profile_sidebar_friends")}</span>}
                            placement='right'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                        <div className={profileComponent == "friends" ? "profile-sidebar-menu-active" : "profile-sidebar-menu"} onClick={() => handleProfileComponent("friends")}>
                            <i className="fa-solid fa-user-group friends-icon"></i>
                        </div>
                        </Tooltip>
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("profile_sidebar_settings")}</span>}
                            placement='right'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                        <div className={profileComponent == "settings" ? "profile-sidebar-menu-active profile-sidebar-bottom-menu" : "profile-sidebar-menu profile-sidebar-bottom-menu"} onClick={() => handleProfileComponent("settings")}>
                            <i className="fa-solid fa-gear settings-icon"></i>
                        </div>
                        </Tooltip>
                    </div>
                    <div className="profile-content">
                        <AnimatePresence mode="wait">
                            { profileComponent == "overview" ?
                                <ProfileOverview translation={translation} />
                            : profileComponent == "messages" ?
                                <ProfileMessages translation={translation} />
                            : profileComponent == "friends" ?
                                <ProfileFriends translation={translation} />
                            : profileComponent == "settings" ?
                                <ProfileSettings translation={translation} />
                            : undefined
                            }
                        </AnimatePresence>
                    </div>
                </div>

            </div>
                <button onClick={handleGoHome}>HOME</button>
        </motion.div>
    );
}