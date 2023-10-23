import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import jwt_decode from 'jwt-decode';
import Loading from "../extras/Loading";
import './style/CardCollection.css';

export default function CardCollection({translation, sidebarHovered, jwtToken}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [decodedToken, setDecodedToken] = useState({});
    const [userCards, setUserCards] = useState(null);

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
        if(jwtToken == null) {
            navigate("/");
        } else {
            setLoading(true);
            const decToken = jwt_decode(jwtToken);
            setDecodedToken(decToken);

            // Fetching User Data (Cards) //
            const fetchUserData = async () => {
                try {
                    const response = await fetch(`/api/user/cards/${decToken.username}`, {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`
                        }
                    });

                    if(response.status === 200) {
                        const data = await response.json();
                        setUserCards(data);
                        console.log(data);
                    }
                } catch (err) {
                    console.log(err)
                }
            }
            fetchUserData();
            setLoading(false);
        }
    }, [])

    const handleGoHome = () => {
        navigate('/');
    };

    return(
        <motion.div
            key={location.pathname}
            className={sidebarHovered ? 'collection-container-hovered' : 'collection-container'}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            { loading ?
                <div className="profile-loading-screen">
                    <Loading
                        text={translation("loading_user_cards_text")}
                        scale={2}
                    />
                </div>
            :
                <>
                    <span>Content</span>
                </>
            }
        </motion.div>
    );
}