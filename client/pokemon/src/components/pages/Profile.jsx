import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams  } from "react-router-dom";
import { motion, AnimatePresence  } from 'framer-motion';
import './style/Profile.css';

export default function Profile({translation, sidebarHovered}) {
    let { username } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [xpBar, setXpBar] = useState(0);
    const [userData, setUserData] = useState({});
    const userDataJSON = localStorage.getItem('userData');

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
                    
                    <div className="xp-bar-container">
                        <div className="xp-bar">  
                            <span style={{width: `${xpBar}px`}} className="xp-bar-active"></span>
                        </div>
                    </div>
                </div>
                <div className="profile-bottom-part">
                    <div className="profile-sidebar">

                    </div>
                    <div className="profile-content">
                        <span>{userData.username}</span>
                    </div>
                </div>

            </div>
                <button onClick={handleGoHome}>HOME</button>
        </motion.div>
    );
}