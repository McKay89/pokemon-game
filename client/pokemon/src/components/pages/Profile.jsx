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
        let xpPercent = userData.next_level_xp / 100;
        let actualPercent = userData.xp / xpPercent;
        setXpBar(actualPercent * 2.52);
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
            <div className="profile-light"></div>
            <div className="profile-top-part">
                <Tooltip
                    title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("back-to-the-main-menu")}</span>}
                    placement='right'
                    arrow
                    TransitionComponent={Zoom}
                    TransitionProps={{ timeout: 600 }}
                >
                    <div className="profile-close" onClick={handleGoHome}><i class="fa-solid fa-rectangle-xmark"></i></div>
                </Tooltip>
                <div className="profile-top-avatar" style={{backgroundImage: `url(${userData.avatar})`}}></div>
                <div className="profile-top-data">
                    <span>{userData.username}</span>
                    <span>{userData.role}</span>
                    <div className="profile-basic-data">
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "14px" }}>{userData.next_level_xp - userData.xp} {translation("profile_xpbar_text")}</span>}
                            placement='bottom'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                            <div className="xp-bar-container">
                                <div className="xp-bar">
                                    <span>{userData.xp} / {userData.next_level_xp}</span>
                                    <span style={{width: `${xpBar}px`}} className="xp-bar-active"></span>
                                </div>
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <div className="profile-top-datas">
                    <div className="profile-top-data-item">
                        <div className="data-item-icon">
                            <span>Lv</span>
                        </div>
                        <div className="data-item-amount">
                            <span>{userData.level}</span>
                        </div>
                    </div>
                    <div className="profile-top-data-item">
                        <div className="data-item-icon">
                            <i className="fa-solid fa-coins"></i>
                        </div>
                        <div className="data-item-amount">
                            <span>{userData.coin}</span>
                        </div>
                    </div>
                    <div className="profile-top-data-item">
                        <div className="data-item-icon">
                            <i class="fa-solid fa-user-group"></i>
                        </div>
                        <div className="data-item-amount">
                            <span>3</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="profile-navbar-part">
                <div className="profile-navbar-left">
                    <Tooltip
                        title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("profile_stat_arena_desc")}</span>}
                        placement='top'
                        arrow
                        TransitionComponent={Zoom}
                        TransitionProps={{ timeout: 600 }}
                    >
                        <div className="profile-navbar-stats">
                            <span>33</span>
                            <span>{translation("profile_stat_arena")}</span>
                        </div>
                    </Tooltip>
                    <Tooltip
                        title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("profile_stat_online_desc")}</span>}
                        placement='top'
                        arrow
                        TransitionComponent={Zoom}
                        TransitionProps={{ timeout: 600 }}
                    >
                        <div className="profile-navbar-stats">
                            <span>12</span>
                            <span>{translation("profile_stat_multiplayer")}</span>
                        </div>
                    </Tooltip>
                    <Tooltip
                        title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("profile_stat_cards_desc")}</span>}
                        placement='top'
                        arrow
                        TransitionComponent={Zoom}
                        TransitionProps={{ timeout: 600 }}
                    >
                        <div className="profile-navbar-stats">
                            <span>84</span>
                            <span>{translation("profile_stat_cards")}</span>
                        </div>
                    </Tooltip>
                </div>
                <div className="profile-navbar-right">
                    <div className="profile-navbar-item" onClick={() => handleProfileComponent("overview")}>
                        <div className="profile-navbar-item-icon">
                            <i class="fa-solid fa-address-card"></i>
                        </div>
                        <div className="profile-navar-item-label">
                            <span>{translation("profile_sidebar_overview")}</span>
                        </div>
                    </div>
                    <div className="profile-navbar-item" onClick={() => handleProfileComponent("friends")}>
                        <div className="profile-navbar-item-icon">
                            <i class="fa-solid fa-user-group"></i>
                        </div>
                        <div className="profile-navar-item-label">
                            <span>{translation("profile_sidebar_friends")}</span>
                        </div>
                    </div>
                    <div className="profile-navbar-item" onClick={() => handleProfileComponent("messages")}>
                        <div className="profile-navbar-item-icon">
                            <i class="fa-solid fa-envelope"></i>
                        </div>
                        <div className="profile-navar-item-label">
                            <span>{translation("profile_sidebar_messages")}</span>
                        </div>
                    </div>
                    <div className="profile-navbar-item" onClick={() => handleProfileComponent("settings")}>
                        <div className="profile-navbar-item-icon">
                            <i class="fa-solid fa-gear"></i>
                        </div>
                        <div className="profile-navar-item-label">
                            <span>{translation("profile_sidebar_settings")}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="profile-content-part">
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
        </motion.div>
    );
}