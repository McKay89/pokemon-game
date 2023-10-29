import React, { useState, useEffect } from 'react';
import './CardHolder.css';

export default function CardHolder({choosenCard, translation}) {
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        setAnimationKey(prevKey => prevKey + 1);
    }, [choosenCard])

    return(
        <div
            key={animationKey}
            className="cardholder-container"
            style={choosenCard == null ? { backgroundImage: 'url(/images/cards/card_back.png)' } : {
                backgroundImage: `url(${choosenCard.card_img})`
            }}
        >
            { choosenCard != null ?
                <>
                    {/* HP */}
                    {choosenCard.base_stats.hp > 99 ?
                        <span className="cardholder-health_1">{choosenCard.base_stats.hp}</span>
                    :
                        <span className="cardholder-health_2">{choosenCard.base_stats.hp}</span>
                    }

                    {/* ATTACK */}
                    {choosenCard.base_stats.attack < 10 ?
                        <span className="cardholder-attack_1">{choosenCard.base_stats.attack}</span>
                    : choosenCard.base_stats.attack < 100 && choosenCard.base_stats.attack > 9 ?
                        <span className="cardholder-attack_2">{choosenCard.base_stats.attack}</span>
                    :
                        <span className="cardholder-attack_3">{choosenCard.base_stats.attack}</span>
                    }

                    {/* DEFENSE */}
                    {choosenCard.base_stats.defense < 10 ?
                        <span className="cardholder-defense_1">{choosenCard.base_stats.defense}</span>
                    : choosenCard.base_stats.defense < 100 && choosenCard.base_stats.defense > 9 ?
                        <span className="cardholder-defense_2">{choosenCard.base_stats.defense}</span>
                    :
                        <span className="cardholder-defense_3">{choosenCard.base_stats.defense}</span>
                    }

                    {/* SPEED */}
                    {choosenCard.base_stats.speed < 10 ?
                        <span className="cardholder-speed_1">{choosenCard.base_stats.speed}</span>
                    : choosenCard.base_stats.speed < 100 && choosenCard.base_stats.speed > 9 ?
                        <span className="cardholder-speed_2">{choosenCard.base_stats.speed}</span>
                    :
                        <span className="cardholder-speed_3">{choosenCard.base_stats.speed}</span>
                    }

                    {/* INTELLIGENCE */}
                    {choosenCard.base_stats.intelligence < 10 ?
                        <span className="cardholder-intelligence_1">{choosenCard.base_stats.intelligence}</span>
                    : choosenCard.base_stats.intelligence < 100 && choosenCard.base_stats.intelligence > 9 ?
                        <span className="cardholder-intelligence_2">{choosenCard.base_stats.intelligence}</span>
                    :
                        <span className="cardholder-intelligence_3">{choosenCard.base_stats.intelligence}</span>
                    }

                    {/* DESCRIPTION */}
                    <div className="cardholder-desc">
                        {translation(choosenCard.desc)}
                    </div>
                </>
            : undefined }
        </div>
    );
}