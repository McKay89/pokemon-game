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
                    {/* CARD TYPE */}
                    <span className="cardholder-card-type">{translation(choosenCard.card_type)}</span>

                    {/* HP */}
                    {choosenCard.base_stats.hp > 99 ?
                        <span className="cardholder-health_1 base-stat">{choosenCard.base_stats.hp}</span>
                    :
                        <span className="cardholder-health_2 base-stat">{choosenCard.base_stats.hp}</span>
                    }

                    {/* ATTACK */}
                    {choosenCard.base_stats.attack < 10 ?
                        <span className="cardholder-attack_1 base-stat">{choosenCard.base_stats.attack}</span>
                    : choosenCard.base_stats.attack < 100 && choosenCard.base_stats.attack > 9 ?
                        <span className="cardholder-attack_2 base-stat">{choosenCard.base_stats.attack}</span>
                    :
                        <span className="cardholder-attack_3 base-stat">{choosenCard.base_stats.attack}</span>
                    }

                    {/* SPECIAL ATTACK */}
                    {choosenCard.base_stats.special_attack < 10 ?
                        <span className="cardholder-special-attack_1 base-stat">{choosenCard.base_stats.special_attack}</span>
                    : choosenCard.base_stats.special_attack < 100 && choosenCard.base_stats.special_attack > 9 ?
                        <span className="cardholder-special-attack_2 base-stat">{choosenCard.base_stats.special_attack}</span>
                    :
                        <span className="cardholder-special-attack_3 base-stat">{choosenCard.base_stats.special_attack}</span>
                    }

                    {/* DEFENSE */}
                    {choosenCard.base_stats.defense < 10 ?
                        <span className="cardholder-defense_1 base-stat">{choosenCard.base_stats.defense}</span>
                    : choosenCard.base_stats.defense < 100 && choosenCard.base_stats.defense > 9 ?
                        <span className="cardholder-defense_2 base-stat">{choosenCard.base_stats.defense}</span>
                    :
                        <span className="cardholder-defense_3 base-stat">{choosenCard.base_stats.defense}</span>
                    }

                    {/* SPECIAL DEFENSE */}
                    {choosenCard.base_stats.special_defense < 10 ?
                        <span className="cardholder-special-defense_1 base-stat">{choosenCard.base_stats.special_defense}</span>
                    : choosenCard.base_stats.special_defense < 100 && choosenCard.base_stats.special_defense > 9 ?
                        <span className="cardholder-special-defense_2 base-stat">{choosenCard.base_stats.special_defense}</span>
                    :
                        <span className="cardholder-special-defense_3 base-stat">{choosenCard.base_stats.special_defense}</span>
                    }

                    {/* SPEED */}
                    {choosenCard.base_stats.speed < 10 ?
                        <span className="cardholder-speed_1 base-stat">{choosenCard.base_stats.speed}</span>
                    : choosenCard.base_stats.speed < 100 && choosenCard.base_stats.speed > 9 ?
                        <span className="cardholder-speed_2 base-stat">{choosenCard.base_stats.speed}</span>
                    :
                        <span className="cardholder-speed_3 base-stat">{choosenCard.base_stats.speed}</span>
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