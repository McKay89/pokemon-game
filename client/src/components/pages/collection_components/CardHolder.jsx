import React, { useState, useEffect } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
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
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "18px" }}>{translation("pokemon_stat_health_tt")}</span>}
                            placement='left'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                            <div className="cardholder-health-tooltip"></div>
                        </Tooltip>
                        
                    {/* ATTACK */}
                        {choosenCard.base_stats.attack < 10 ?
                            <span className="cardholder-attack_1 base-stat">{choosenCard.base_stats.attack}</span>
                        : choosenCard.base_stats.attack < 100 && choosenCard.base_stats.attack > 9 ?
                            <span className="cardholder-attack_2 base-stat">{choosenCard.base_stats.attack}</span>
                        :
                            <span className="cardholder-attack_3 base-stat">{choosenCard.base_stats.attack}</span>
                        }
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "18px" }}>{translation("pokemon_stat_attack_tt")}</span>}
                            placement='top'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                            <div className="cardholder-attack-tooltip"></div>
                        </Tooltip>

                    {/* SPECIAL ATTACK */}
                        {choosenCard.base_stats.special_attack < 10 ?
                            <span className="cardholder-special-attack_1 base-stat">{choosenCard.base_stats.special_attack}</span>
                        : choosenCard.base_stats.special_attack < 100 && choosenCard.base_stats.special_attack > 9 ?
                            <span className="cardholder-special-attack_2 base-stat">{choosenCard.base_stats.special_attack}</span>
                        :
                            <span className="cardholder-special-attack_3 base-stat">{choosenCard.base_stats.special_attack}</span>
                        }
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "18px" }}>{translation("pokemon_stat_special_attack_tt")}</span>}
                            placement='top'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                            <div className="cardholder-special-attack-tooltip"></div>
                        </Tooltip>

                    {/* DEFENSE */}
                        {choosenCard.base_stats.defense < 10 ?
                            <span className="cardholder-defense_1 base-stat">{choosenCard.base_stats.defense}</span>
                        : choosenCard.base_stats.defense < 100 && choosenCard.base_stats.defense > 9 ?
                            <span className="cardholder-defense_2 base-stat">{choosenCard.base_stats.defense}</span>
                        :
                            <span className="cardholder-defense_3 base-stat">{choosenCard.base_stats.defense}</span>
                        }
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "18px" }}>{translation("pokemon_stat_defense_tt")}</span>}
                            placement='top'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                            <div className="cardholder-defense-tooltip"></div>
                        </Tooltip>

                    {/* SPECIAL DEFENSE */}
                        {choosenCard.base_stats.special_defense < 10 ?
                            <span className="cardholder-special-defense_1 base-stat">{choosenCard.base_stats.special_defense}</span>
                        : choosenCard.base_stats.special_defense < 100 && choosenCard.base_stats.special_defense > 9 ?
                            <span className="cardholder-special-defense_2 base-stat">{choosenCard.base_stats.special_defense}</span>
                        :
                            <span className="cardholder-special-defense_3 base-stat">{choosenCard.base_stats.special_defense}</span>
                        }
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "18px" }}>{translation("pokemon_stat_special_defense_tt")}</span>}
                            placement='top'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                            <div className="cardholder-special-defense-tooltip"></div>
                        </Tooltip>

                    {/* SPEED */}
                        {choosenCard.base_stats.speed < 10 ?
                            <span className="cardholder-speed_1 base-stat">{choosenCard.base_stats.speed}</span>
                        : choosenCard.base_stats.speed < 100 && choosenCard.base_stats.speed > 9 ?
                            <span className="cardholder-speed_2 base-stat">{choosenCard.base_stats.speed}</span>
                        :
                            <span className="cardholder-speed_3 base-stat">{choosenCard.base_stats.speed}</span>
                        }
                        <Tooltip
                            title={<span style={{ color: "#fff", fontSize: "18px" }}>{translation("pokemon_stat_speed_tt")}</span>}
                            placement='top'
                            arrow
                            TransitionComponent={Zoom}
                            TransitionProps={{ timeout: 600 }}
                        >
                            <div className="cardholder-speed-tooltip"></div>
                        </Tooltip>

                    {/* DESCRIPTION */}
                        <div className="cardholder-desc">
                            {translation("pokemons:" + choosenCard.desc)}
                        </div>
                </>
            : undefined }
        </div>
    );
}