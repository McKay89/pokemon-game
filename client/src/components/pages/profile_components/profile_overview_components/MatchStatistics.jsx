import React, { useState, useEffect } from 'react'
import Loading from "../../../extras/Loading";
import './MatchStatistics.css';

export default function MatchStatistics({translation, userid, token}) {
    const [userMatchStats, setUserMatchStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        // Fetching User Statistics //
        const fetchUserStats = async () => {
            try {
                const response = await fetch(`/api/user/matchstats/${userid}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if(response.status === 200) {
                    const data = await response.json();
                    setUserMatchStats(data);
                    console.log(data);
                }
            } catch (err) {
                console.log(err)
            }
        }
        fetchUserStats();
        setLoading(false);
    }, [])
    

    return(
        <div className="profile-match-statistics-container">
            {loading ?
                <Loading
                    text={translation("loading_match_statistics_text")}
                    scale={1.4}
                />
            :
                <span>Statistics</span>
            }
        </div>
    );
}