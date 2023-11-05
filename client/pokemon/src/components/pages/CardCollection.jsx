import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import jwt_decode from 'jwt-decode';
import Loading from "../extras/Loading";
import CardHolder from './collection_components/CardHolder';
import './style/CardCollection.css';

export default function CardCollection({translation, sidebarHovered, jwtToken}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [decodedToken, setDecodedToken] = useState({});
    const [userCards, setUserCards] = useState(null);
    const [pokemonCards, setPokemonCards] = useState([]);
    const [spellCards, setSpellCards] = useState([]);
    const [trapCards, setTrapCards] = useState([]);
    const [curseCards, setCurseCards] = useState([]);
    const [filteredCards, setFilteredCards] = useState(null);
    const [choosenCard, setChoosenCard] = useState(null);
    const [filterCards, setFilterCards] = useState("");
    const [activeCardSet, setActiveCardSet] = useState("card_type_pokemon");

    const pageTransition = {
        initial: {
            opacity: 0,
            x: 0,
            scaleX: 0.8,
            scaleY: 0.8,
        },
        animate: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5 },
            scaleX: 1,
            scaleY: 1,
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
                        const pokemonCards = [];
                        const spellCards = [];
                        const trapCards = [];
                        const curseCards = [];

                        data.forEach(x => {
                            if(x.card_type == "card_type_pokemon") {
                                pokemonCards.push(x);
                            }
                            if(x.card_type == "card_type_spell") {
                                spellCards.push(x);
                            }
                            if(x.card_type == "card_type_trap") {
                                trapCards.push(x);
                            }
                            if(x.card_type == "card_type_curse") {
                                curseCards.push(x);
                            }
                        })
                        setFilteredCards(pokemonCards);
                        setPokemonCards(pokemonCards);
                        setSpellCards(spellCards);
                        setTrapCards(trapCards);
                        setCurseCards(curseCards);
                    }
                } catch (err) {
                    console.log(err)
                }
            }
            fetchUserData();
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        if(filterCards == "") {
            setFilteredCards(userCards);
        } else {
            const filtered = [];
            userCards.forEach(card => {
                if(card.name && card.name.toLowerCase().includes(filterCards.toLowerCase())) {
                    filtered.push(card);
                }
            });
            setFilteredCards(filtered);
        }
    }, [filterCards])
    

    const handleChooseCard = (card) => {
        if(card.card_img) {
            setChoosenCard(card);
        } else {
            setChoosenCard(null);
        }
    }

    const handlerFilterCards = (e) => {
        setFilterCards(e.target.value)
    }

    const handleChooseCardSet = (value) => {
        setActiveCardSet(value);
    }

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
                    <div className="collection-left-container">
                        <div className="collection-cards-search-container">
                            <input
                                type="text"
                                className="card-search-input"
                                placeholder={translation("cards_search_placeholder")}
                                onChange={(e) => handlerFilterCards(e)}
                            />
                        </div>
                        <div className="collection-cards-box">
                            {filteredCards && filteredCards.map((card, index) => (
                                <div className="card-image-item" key={index}>
                                    <img
                                        src={card.card_img || '/images/cards/card_back.png'}
                                        className="img-fluid"
                                        width="80"
                                        height="110"
                                        onClick={() => handleChooseCard(card)}
                                    />
                                </div>
                             ))}
                        </div>
                        <div className="collection-cards-amounts-container">
                            <div
                                className={activeCardSet == "card_type_pokemon" ? "collection-cards-amount-type-active" : "collection-cards-amount-type"}
                                onClick={() => handleChooseCardSet("card_type_pokemon")}
                            >
                                <span>{pokemonCards.filter(x => x.name).length} / {pokemonCards.length}</span><br />
                                <span>{translation("card_type_pokemons")}</span>
                            </div>
                            <div
                                className={activeCardSet == "card_type_spell" ? "collection-cards-amount-type-active" : "collection-cards-amount-type"}
                                onClick={() => handleChooseCardSet("card_type_spell")}
                            >
                                <span>0 / 0</span><br />
                                <span>{translation("card_type_spells")}</span>
                            </div>
                            <div
                                className={activeCardSet == "card_type_trap" ? "collection-cards-amount-type-active" : "collection-cards-amount-type"}
                                onClick={() => handleChooseCardSet("card_type_trap")}
                            >
                                <span>0 / 0</span><br />
                                <span>{translation("card_type_traps")}</span>
                            </div>
                            <div
                                className={activeCardSet == "card_type_curse" ? "collection-cards-amount-type-active" : "collection-cards-amount-type"}
                                onClick={() => handleChooseCardSet("card_type_curse")}
                            >
                                <span>0 / 0</span><br />
                                <span>{translation("card_type_curses")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="collection-right-container">
                        <div className="collection-main-cardholder">
                            <CardHolder
                                choosenCard={choosenCard}
                                translation={translation}
                            />
                        </div>
                    </div>
                </>
            }
        </motion.div>
    );
}