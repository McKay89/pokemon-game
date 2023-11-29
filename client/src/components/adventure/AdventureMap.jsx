import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import Loading from "../extras/Loading";
import jwt_decode from 'jwt-decode';

// Import Game Components
import Hud from './components/HUD/Hud';

// Import Classes
import { Dungeon001 } from './collisions';
import { Boundary, Sprite } from './classes';

// Import Images
import GameData from './data/GameData';
import DungeonMap from '../../assets_tmp/adventure/maps/dungeon_001.png';
import DungeonForeground from '../../assets_tmp/adventure/maps/dungeon_001_foreground.png';
import PlayerDownImage from '../../assets_tmp/adventure/player_moves/move_down.png';
import PlayerUpImage from '../../assets_tmp/adventure/player_moves/move_up.png';
import PlayerLeftImage from '../../assets_tmp/adventure/player_moves/move_left.png';
import PlayerRightImage from '../../assets_tmp/adventure/player_moves/move_right.png';
import RectangularCollision from './collisions/RectangularCollision';
import Gif from '../../assets_tmp/adventure/gif/campfire.png';
import './style/AdventureMap.css';

export default function AdventureMap({translation, sidebarHovered, jwtToken, activeComponent}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [decodedToken, setDecodedToken] = useState({});
    const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 });
    const gameData = GameData();
    const [userSave, setUserSave] = useState(null);
    const [gameNotification, setGameNotification] = useState("");
    const Collisions = {
        dungeon001: Dungeon001()
    }
    let lastKey = '';
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
    let images = {
        background: {
            image: new Image(),
            path: DungeonMap,
            sprite: null
        },
        foreground: {
            image: new Image(),
            path: DungeonForeground,
            sprite: null
        },
        player: {
            moveDown: {
                image: new Image(),
                path: PlayerDownImage
            },
            moveLeft: {
                image: new Image(),
                path: PlayerLeftImage
            },
            moveRight: {
                image: new Image(),
                path: PlayerRightImage
            },
            moveUp: {
                image: new Image(),
                path: PlayerUpImage
            },
            sprite: null
        },
        testAnim: {
            image: new Image(),
            path: Gif,
            sprite: null
        }
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

    // Collect Map by rows
    const createCollisionMap = () => {
        const CollisionsMap = [];

        for(let i = 0; i < Collisions.dungeon001.length; i+= 70) {
            CollisionsMap.push(Collisions.dungeon001.slice(i, 70 + i));
        }

        return CollisionsMap;
    }

    // Create Boundaries
    const createBoundaries = (CollisionsMap) => {
        const boundaries = [];

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

        return boundaries;
    }

    // Create Images
    const createImages = () => {
        // Background
            images.background.image.src = images.background.path;
        // Foreground
            images.foreground.image.src = images.foreground.path;
        // Player
            images.player.moveDown.image.src = images.player.moveDown.path;
            images.player.moveLeft.image.src = images.player.moveLeft.path;
            images.player.moveRight.image.src = images.player.moveRight.path;
            images.player.moveUp.image.src = images.player.moveUp.path;
        // Test Animation
            images.testAnim.image.src = images.testAnim.path;
    }

    const createSprite = (position, image, frames = { max: 1 }, sprites = {}, object = { height: 1, width: 1 }, type = "object", animation = { speed: 1 }) => {
        return new Sprite({
            position: position,
            image: image,
            frames: frames,
            sprites: sprites,
            object: object,
            type: type,
            animation: animation
        })
    }

    const preparePlayerSprite = (canvas) => {
        images.player.sprite = createSprite(
            { 
                x: canvas.width / 2 - 288 / 4 / 2,
                y: canvas.height / 2 - 69 / 2
            },
            images.player.moveDown.image,
            { max: 6 },
            { 
                up: images.player.moveUp.image,
                left: images.player.moveLeft.image,
                right: images.player.moveRight.image,
                down: images.player.moveDown.image
            },
            { 
                height: 1.3,
                width: 5
            },
            "player",
            { speed: 8 }
        );
    }

    const prepareBackgroundSprite = () => {
        images.background.sprite = createSprite(
            { 
                x: gameData.maps.dungeon_001.offset.x,
                y: gameData.maps.dungeon_001.offset.y
            },
            images.background.image,
            undefined, undefined, undefined, undefined, undefined
        );
        setBgPosition({ x: gameData.maps.dungeon_001.offset.x, y: gameData.maps.dungeon_001.offset.y });
    }

    const prepareForegroundSprite = () => {
        images.foreground.sprite = createSprite(
            { 
                x: gameData.maps.dungeon_001.offset.x,
                y: gameData.maps.dungeon_001.offset.y
            },
            images.foreground.image,
            undefined, undefined, undefined, undefined, undefined
        );
    }

    const prepareTestAnimSprite = () => {
        images.testAnim.sprite = createSprite(
            { 
                x: 708,
                y: 660
            },
            images.testAnim.image,
            { max: 4 },
            undefined,
            { 
                height: 2,
                width: 2
            },
            "object",
            { speed: 10 }
        );
    }

    // Handle Key Down Events
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

    // Handle Character Move Logic
    const handleCharacterMove = (boundaries, movableObjects, moving, direction, coordX, coordY) => {
        setBgPosition({ x: images.background.sprite.position.x, y: images.background.sprite.position.y })
        images.player.sprite.moving = true;
        images.player.sprite.image = direction;

        for(let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            // Handle Collision //
            if(
                RectangularCollision({
                    rectangle1: images.player.sprite,
                    rectangle2: {...boundary, position: {
                        x: boundary.position.x + coordX,
                        y: boundary.position.y + coordY
                    }}
                })
            ) {
                moving = false;
                break;
            }
        }
        
        if(moving)
        movableObjects.forEach(movable => {
            if(coordX == 0) movable.position.y += coordY;
            else movable.position.x += coordX;
        })
    }

    const handleSaveGame = async (timeData) => {
        const saveData = {
            timeData: timeData,
            backgroundPosition: {
                x: bgPosition.x,
                y: bgPosition.y
            }
        }

        try {
            const response = await fetch(`/api/user/save/${decodedToken.userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`
                },
                body: JSON.stringify(saveData)
            })

            if(response.status === 200) {
                setGameNotification(translation("adventure:savegame_success"));
                setTimeout(() => {
                    setGameNotification("");
                }, 5000)
            } else {
                setGameNotification(translation("adventure:savegame_error"));
                setTimeout(() => {
                    setGameNotification("");
                }, 5000)
            }
        } catch (err) {
            console.log(err);
        }
    }

    const loadObjectPositions = (movableObjects) => {
        const saveCoordX = userSave.backgroundPosition.x;
        const saveCoordY = userSave.backgroundPosition.y;
        const bgCoordX = images.background.sprite.position.x;
        const bgCoordY = images.background.sprite.position.y;

        if(saveCoordX > bgCoordX) {
            movableObjects.forEach(movable => {
                movable.position.x -= saveCoordX - bgCoordX;
            })
        } else {
            movableObjects.forEach(movable => {
                movable.position.x -= bgCoordX - saveCoordX;
            })
        }
        if(saveCoordY > bgCoordY) {
            movableObjects.forEach(movable => {
                movable.position.y -= saveCoordY - bgCoordY;
            })
        } else {
            movableObjects.forEach(movable => {
                movable.position.y -= bgCoordY - saveCoordY;
            })
        }
    }

    // Get User Save
    useEffect(() => {
        if(jwtToken == null) {
            navigate("/");
        } else {
            setLoading(true);
            const decToken = jwt_decode(jwtToken);
            setDecodedToken(decToken);

            // Get User Save State
            const getUserSave = async () => {
                try {
                    const response = await fetch(`/api/user/save/${decToken.userId}`, {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`
                        }
                    });

                    if(response.status === 200) {
                        const data = await response.json();
                        setUserSave(data);
                    }
                } catch (err) {
                    console.log(err)
                }
            }
            getUserSave();
            setLoading(false);
        }
    }, [])

    // Create Canvas & Player
    useEffect(() => {
        // Canvas Settings
        const canvas = document.querySelector("canvas");
        const c = canvas.getContext("2d");
        canvas.width = gameData.canvas.width;
        canvas.height = gameData.canvas.height;
        
        // Create Collisions & Boundaries
        const CollisionsMap = createCollisionMap();
        const boundaries = createBoundaries(CollisionsMap);

        // Create Images
        createImages();

        // Create Player Sprite
        preparePlayerSprite(canvas);

        // Create Background Sprite
        prepareBackgroundSprite();

        // Create Foreground Sprite
        prepareForegroundSprite();

        // Create Test GIF Sprite
        prepareTestAnimSprite();

        // Collect Sprites which can moving
        const movableObjects = [
            images.background.sprite,
            images.foreground.sprite,
            images.testAnim.sprite,
            ...boundaries
        ]

        // Set the Positions get by Save State
        if(userSave != null) {
            loadObjectPositions(movableObjects);
        }

        // Start Frame Animation
        const startAnimate = () => {
            window.requestAnimationFrame(startAnimate);

            // Draw Background & Boundaries
            images.background.sprite.draw(c);
            boundaries.forEach(boundary => {
                boundary.draw(c);
            })

            // Draw Objects
            images.testAnim.sprite.draw(c);

            // Draw Player & Foreground Object
            images.player.sprite.draw(c);
            images.foreground.sprite.draw(c);
            

            // Moves //
            let moving = true;
            images.player.sprite.moving = false;
            
            // Move UP
            if(keys.w.pressed && lastKey === "up") {
                handleCharacterMove(boundaries, movableObjects, moving, images.player.sprite.sprites.up, 0, 3);
            }
            // Move DOWN
            if(keys.s.pressed && lastKey === "down") {
                handleCharacterMove(boundaries, movableObjects, moving, images.player.sprite.sprites.down, 0, -3);
            }
            // Move LEFT
            if(keys.a.pressed && lastKey === "left") {
                handleCharacterMove(boundaries, movableObjects, moving, images.player.sprite.sprites.left, 3, 0);
            }
            // Move RIGHT
            if(keys.d.pressed && lastKey === "right") {
                handleCharacterMove(boundaries, movableObjects, moving, images.player.sprite.sprites.right, -3, 0);
            }
        }
        startAnimate();
    
        // Add Keyboard Event Listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    
        // Remove Keyboard Event Listeners
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        }
    }, [userSave])

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
                <>
                    <div className="adventure-canvas-HUD">
                        <Hud
                            translation={translation}
                            handleSaveGame={handleSaveGame}
                            userSave={userSave}
                            gameNotification={gameNotification}
                        />
                    </div>
                    <div className="adventure-canvas-shadow"></div>
                    <canvas className="adventure-game-canvas"></canvas>
                </>
            }
        </motion.div>
    );
}