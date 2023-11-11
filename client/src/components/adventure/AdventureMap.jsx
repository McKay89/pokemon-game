import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import Loading from "../extras/Loading";
import jwt_decode from 'jwt-decode';
import DungeonMap from '../../assets_tmp/adventure/maps/dungeon_001.png';
import DungeonForeground from '../../assets_tmp/adventure/maps/dungeon_001_foreground.png';
import PlayerDownImage from '../../assets_tmp/adventure/player_moves/move_down.png';
import PlayerUpImage from '../../assets_tmp/adventure/player_moves/move_up.png';
import PlayerLeftImage from '../../assets_tmp/adventure/player_moves/move_left.png';
import PlayerRightImage from '../../assets_tmp/adventure/player_moves/move_right.png';
import RectangularCollision from './collisions/RectangularCollision';
import { Dungeon001 } from './collisions';
import { Boundary, Sprite } from './classes';
import GameData from './data/GameData';
import './style/AdventureMap.css';

export default function AdventureMap({translation, sidebarHovered, jwtToken, activeComponent}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [decodedToken, setDecodedToken] = useState({});
    const gameData = GameData();
    const Collisions = {
        dungeon001: Dungeon001()
    }

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

    // Create Canvas & Player
    useEffect(() => {
        const canvas = document.querySelector("canvas");
        const c = canvas.getContext("2d");
        canvas.width = gameData.canvas.width;
        canvas.height = gameData.canvas.height;

        // Collect Map by rows
        const CollisionsMap = [];
        for(let i = 0; i < Collisions.dungeon001.length; i+= 70) {
            CollisionsMap.push(Collisions.dungeon001.slice(i, 70 + i));
        }

        const boundaries = [];
        // Create boundaries
        CollisionsMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if(symbol === 369) {
                    boundaries.push(new Boundary({
                        position: {
                            x: j * Boundary.width + gameData.maps.dungeon_001.offset.x,
                            y: i * Boundary.height + gameData.maps.dungeon_001.offset.y
                        }
                    }))
                }
            })
        })

        // Map: Dungeon - 001 (Image)
        const image = new Image();
        image.src = DungeonMap;

        // Map: Dungeon - 001 (Foreground Objects) (Image)
        const foregroundImage = new Image();
        foregroundImage.src = DungeonForeground;

        // Player Move Down (Image)
        const playerDownImage = new Image();
        playerDownImage.src = PlayerDownImage;

        // Player Move Up (Image)
        const playerUpImage = new Image();
        playerUpImage.src = PlayerUpImage;

        // Player Move Left (Image)
        const playerLeftImage = new Image();
        playerLeftImage.src = PlayerLeftImage;

        // Player Move Right (Image)
        const playerRightImage = new Image();
        playerRightImage.src = PlayerRightImage;

        // Create Player Sprite
        const player = new Sprite({
            position: {
                x: canvas.width / 2 - 288 / 4 / 2,
                y: canvas.height / 2 - 69 / 2
            },
            image: playerDownImage,
            frames: {
                max: 6
            },
            sprites: {
                up: playerUpImage,
                left: playerLeftImage,
                right: playerRightImage,
                down: playerDownImage
            },
            player: {
                height: 1.3,
                width: 5
            }
        })

        // Create Background Sprite
        const background = new Sprite({
            position: {
                x: gameData.maps.dungeon_001.offset.x,
                y: gameData.maps.dungeon_001.offset.y
            },
            image: image
        });

        // Create Foreground Sprite
        const foreground = new Sprite({
            position: {
                x: gameData.maps.dungeon_001.offset.x,
                y: gameData.maps.dungeon_001.offset.y
            },
            image: foregroundImage
        });

        // Keys pressed
        const keys = {
            w: {
                pressed: false
            },
            a: {
                pressed: false
            },
            s: {
                pressed: false
            },
            d: {
                pressed: false
            }
        }

        // Collect Sprites which can moving
        const movables = [background, ...boundaries, foreground];

        // Start Frame Animation
        const startAnimate = () => {
            window.requestAnimationFrame(startAnimate);

            // Draw Sprites
            background.draw(c);
            boundaries.forEach(boundary => {
                boundary.draw(c);
            })
            player.draw(c);
            foreground.draw(c);

            // Moves //
            let moving = true;
            player.moving = false;
            
            if(keys.w.pressed && lastKey === "up") {
                player.moving = true;
                player.image = player.sprites.up;

                for(let i = 0; i < boundaries.length; i++) {
                    const boundary = boundaries[i];
                    // Collision //
                    if(
                        RectangularCollision({
                            rectangle1: player,
                            rectangle2: {...boundary, position: {
                                x: boundary.position.x,
                                y: boundary.position.y + 3
                            }}
                        })
                    ) {
                        moving = false;
                        break;
                    }
                }
                
                if(moving)
                movables.forEach(movable => {
                    movable.position.y += 3;
                })
            }
            if(keys.s.pressed && lastKey === "down") {
                player.moving = true;
                player.image = player.sprites.down;

                for(let i = 0; i < boundaries.length; i++) {
                    const boundary = boundaries[i];
                    // Collision //
                    if(
                        RectangularCollision({
                            rectangle1: player,
                            rectangle2: {...boundary, position: {
                                x: boundary.position.x,
                                y: boundary.position.y - 3
                            }}
                        })
                    ) {
                        moving = false;
                        break;
                    }
                }
                
                if(moving)
                movables.forEach(movable => {
                    movable.position.y -= 3;
                })
            }
            if(keys.a.pressed && lastKey === "left") {
                player.moving = true;
                player.image = player.sprites.left;

                for(let i = 0; i < boundaries.length; i++) {
                    const boundary = boundaries[i];
                    // Collision //
                    if(
                        RectangularCollision({
                            rectangle1: player,
                            rectangle2: {...boundary, position: {
                                x: boundary.position.x + 3,
                                y: boundary.position.y
                            }}
                        })
                    ) {
                        moving = false;
                        break;
                    }
                }
                
                if(moving)
                movables.forEach(movable => {
                    movable.position.x += 3;
                })
            }
            if(keys.d.pressed && lastKey === "right") {
                player.moving = true;
                player.image = player.sprites.right;

                for(let i = 0; i < boundaries.length; i++) {
                    const boundary = boundaries[i];
                    // Collision //
                    if(
                        RectangularCollision({
                            rectangle1: player,
                            rectangle2: {...boundary, position: {
                                x: boundary.position.x - 3,
                                y: boundary.position.y
                            }}
                        })
                    ) {
                        moving = false;
                        break;
                    }
                }
                
                if(moving)
                movables.forEach(movable => {
                    movable.position.x -= 3;
                })
            }
        }
        startAnimate();

        // Handle Key Down Events
        let lastKey = '';
        const handleKeyDown = (event) => {
            switch (event.key) {
                case "w":
                    keys.w.pressed = true;
                    lastKey = "up";
                    break;
                case "a":
                    keys.a.pressed = true;
                    lastKey = "left";
                    break;
                case "s":
                    keys.s.pressed = true;
                    lastKey = "down";
                    break;
                case "d":
                    keys.d.pressed = true;
                    lastKey = "right";
                    break;
                default:
                    break;
            }
        }

        // Handle Key Up Events
        const handleKeyUp = (event) => {
            switch (event.key) {
                case "w":
                    keys.w.pressed = false;
                    break;
                case "a":
                    keys.a.pressed = false;
                    break;
                case "s":
                    keys.s.pressed = false;
                    break;
                case "d":
                    keys.d.pressed = false;
                    break;
                default:
                    break;
            }
        }
    
        // Add Keyboard Event Listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    
        // Remove Keyboard Event Listeners
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        }
    }, [])
    

    // Check user is logged in & get user data
    useEffect(() => {
        if(jwtToken == null) {
            navigate("/");
        } else {
            setLoading(true);
            const decToken = jwt_decode(jwtToken);
            setDecodedToken(decToken);

            // Fetch necessary user data
            // ...

            setLoading(false);
        }
    }, [])

    return(
        <motion.div
            key={location.pathname}
            className={sidebarHovered ? 'adventure-container-hovered' : 'adventure-container'}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            { loading ?
                <div className="profile-loading-screen">
                    <Loading
                        text={"Loading game data..."}
                        scale={2}
                    />
                </div>
            :
                <canvas className="adventure-game-canvas"></canvas>
            }
        </motion.div>
    );
}