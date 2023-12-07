import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from 'framer-motion';
import { DndContext } from '@dnd-kit/core';
import { Draggable } from './components/Draggable';
import { DroppablePlayers } from './components/DroppablePlayers';
import { DroppableSpectators } from './components/DroppableSpectators';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import jwt_decode from 'jwt-decode';
import Loading from "../extras/loading/Loading";
import Notification from "../extras/notification/Notification";
import io from 'socket.io-client';
import VersusImage from '../../../public/images/multiplayer/versus.png';
import User1Image from '../../../public/images/users/user1.jpg';
import User2Image from '../../../public/images/users/user2.jpg';
import './MultiplayerRoom.css';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height: 230,
    background: 'linear-gradient(139deg, rgba(70,55,55,1) 0%, rgba(120,98,98,1) 25%, rgba(70,55,55,1) 50%, rgba(120,98,98,1) 75%, rgba(51,40,40,1) 100%);',
    border: '4px solid #fff',
    boxShadow: 24,
    color: '#ccc',
    p: 4,
};

export default function MultiplayerRoom({translation, sidebarHovered, jwtToken}) {
    const navigate = useNavigate();
    const location = useLocation();
    const messagesEndRef = useRef(null);
    let switchStatus = null;
    const gameModes = ["Arena", "Survival", "Time Attack", "Something"];
    const [decodedToken, setDecodedToken] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingRoom, setLoadingRoom] = useState(false);
    const [activePage, setActivePage] = useState("join");
    const [socket, setSocket] = useState(null);
    const [joinedRoom, setJoinedRoom] = useState(null);
    const [roomId, setRoomId] = useState("");
    const [chatMessage, setChatMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [roomIDClipboard, setRoomIDClipboard] = useState("");
    const [spectatorIDClipboard, setSpectatorIDClipboard] = useState("");
    const [error, setError] = useState('');
    const [isOver1, setIsOver1] = useState(false);
    const [isOver2, setIsOver2] = useState(false);
    const [ready, setReady] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [notifyProps, setNotifyProps] = useState(null);
    const [gameMode, setGameMode] = useState(0);

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

    useEffect(() => {
        if(jwtToken == null) {
            navigate("/");
        } else {
            setDecodedToken(jwt_decode(jwtToken))
            // const serverAddress = "http://localhost:3001";
            const newSocket = io(__SERVER_ADDRESS__, {
                transportOptions: {
                    polling: {
                        extraHeaders: {
                            Authorization: `Bearer ${jwtToken}`
                        }
                    }
                }
            });
        
            setSocket(newSocket);
        
            return () => {
                newSocket.disconnect();
            };
        }
    }, []);

    useEffect(() => {
        if(socket) {
            const updateCreateRoom = (roomData) => {
                setRoomIDClipboard(roomData.roomId);
                setSpectatorIDClipboard(roomData.spectatorId);
                setJoinedRoom(roomData);

                handleNotification("top", "ok", "notification_multiplayer_room_created", 5000, null);
            };

            const updateJoinRoom = (roomData, joinedUser) => {
                setJoinedRoom(roomData);

                if(joinedUser === decodedToken.username) {
                    handleNotification("top", "ok", "notification_multiplayer_room_joined", 5000, null);
                } else {
                    handleNotification("top", "info", "notification_multiplayer_user_joined", 5000, joinedUser);
                }
            };

            const deleteRoom = (roomId) => {
                setJoinedRoom(null);
                setChatMessages([]);
                setChatMessage("");

                // Delete Event Handlers
                socket.off(`updateRoom_${roomId}`, updateJoinRoom);
                socket.off(`joinRoom_${roomId}`, updateJoinRoom);
                socket.off(`createRoom_${roomId}`, updateCreateRoom);
                socket.off(`updateMessages${roomId}`, updateMessages);
            };

            const updateMessages = (message) => {
                setChatMessages(prevMessages => [...prevMessages, message]);
            }

            const updateRoom = (roomData) => {
                let playerIndex = roomData && roomData.players.findIndex(x => x.userName === decodedToken.username);
                let spectatorIndex = roomData && roomData.spectators.findIndex(x => x.userName === decodedToken.username);
                
                if(playerIndex === -1 && spectatorIndex === -1) {
                    setJoinedRoom(null);
                    setChatMessages([]);
                    setChatMessage("");
                    setReady(false);

                    // Delete Event Handlers
                    socket.off(`updateRoom_${roomData.roomJoinId}`, updateJoinRoom);
                    socket.off(`joinRoom_${roomData.roomJoinId}`, updateJoinRoom);
                    socket.off(`createRoom_${roomData.roomJoinId}`, updateCreateRoom);
                } else {
                    setJoinedRoom(roomData);
                    if(playerIndex === -1) {
                        setReady(joinedRoom.spectators[spectatorIndex].ready);
                    } else if(spectatorIndex === -1) {
                        setReady(joinedRoom.players[playerIndex].ready);
                    }
                }   
                switchStatus = null;        
            };

            const updateReadyStatus = () => {
                setReady(false);
            }

            const updateKicked = () => {
                handleNotification("top", "info", "notification_multiplayer_kicked", 5000, null);
            }
        
            const handleRoomError = (errorMessage) => {
                setError(errorMessage);
                handleNotification("top", "error", errorMessage, 5000, null);
            };
        
            socket.on('createRoom', updateCreateRoom);
            socket.on('joinRoom', updateJoinRoom);
            socket.on('roomDeleted', deleteRoom);
            socket.on('updateRoom', updateRoom);
            socket.on('updateMessages', updateMessages);
            socket.on('kickedFromRoom', updateKicked);
            socket.on('changeReadyStatus', updateReadyStatus);
            socket.on('roomError', handleRoomError);
            
        
            return () => {
                socket.off('createRoom', updateCreateRoom);
                socket.off('joinRoom', updateJoinRoom);
                socket.off('roomDeleted', deleteRoom);
                socket.off('updateRoom', updateRoom);
                socket.off('kickedFromRoom', updateKicked);
                socket.off('updateMessages', updateMessages);
                socket.off('changeReadyStatus', updateReadyStatus);
                socket.off('roomError', handleRoomError);
            };
        }
    }, [socket]);

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const createRoom = () => {
        setLoadingRoom(true);
        setTimeout(() => {
            socket.emit('createRoom', decodedToken.username);
            setLoadingRoom(false);
        }, 3000)
    };
    
    const handleJoinRoom = () => {
        setLoadingRoom(true);
        setTimeout(() => {
            setRoomId("");
            socket.emit('joinRoom', roomId, decodedToken.username);
            setLoadingRoom(false);
        }, 3000)
    }

    const handleSendMessage = (event) => {
        if(event.key === "Enter") {
            if(chatMessage !== "") {
                socket.emit('sendMessage', joinedRoom.roomId, decodedToken.username, chatMessage);
                setChatMessage("");
            }
        }
    }

    const handleSendMessageBtn = (event) => {
        if(chatMessage !== "") {
            socket.emit('sendMessage', joinedRoom.roomId, decodedToken.username, chatMessage);
            setChatMessage("");
        }
    }

    const handleRoomId = (event) => setRoomId(event.target.value);
    const handlePageChange = (page) => setActivePage(page);
    const handleLeaveConfirmation = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const handleOpenSettings = () => setOpenSettings(!openSettings);
    
    const handleLeaveRoom = () => {
        setOpenModal(false);
        socket.emit('leaveRoom', joinedRoom.roomId, decodedToken.username);
    };

    const handleKickPlayer = (status, username) => {
        socket.emit('kickUser', joinedRoom.roomId, username, status);
    }

    const handleReady = () => {
        setReady(!ready);
        socket.emit('setReady', joinedRoom.roomId, decodedToken.username, !ready);
    }

    const handleSettings = () => {
        // Settings
    }

    const handleChatMessage = (event) => {
        const message = event.target.value;
        setChatMessage(message);

        if(message === "") {
            socket.emit('typeMessage', joinedRoom.roomId, false);
        } else {
            socket.emit('typeMessage', joinedRoom.roomId, true);
        }
    }

    const handleNotification = (position, type, text, duration, extra) => {
        if(extra === null) extra = "";

        setNotifyProps({
            position: position,
            type: type,
            text: extra + translation(text),
            duration: duration
        })
        const notifyTimeout = setTimeout(() => {
            setNotifyProps(null)
        }, duration + 500)

        return () => clearTimeout(notifyTimeout);
    }

    const handleSwitchGameMode = (direction) => {
        switch (direction) {
            case "up":
                if(gameMode - 1 < 0) {
                    setGameMode(gameModes.length - 1);
                } else {
                    setGameMode((prevValue) => prevValue - 1);
                }
                break;
            case "down":
                if(gameModes[gameMode + 1]) {
                    setGameMode((prevValue) => prevValue + 1);
                } else {
                    setGameMode(0);
                }
                break;
            default:
                break;
        }
    }

    const handleDragEnd = ({over}) => {
        if(switchStatus !== null) {
            socket.emit('changeUserStatus', joinedRoom.roomId, switchStatus.socketId, switchStatus.status);
        }
        switchStatus = null;
        setIsOver1(false);
        setIsOver2(false);
    }
      
    const handleDragMove = (event, socketId) => {
        const rect = event.active.rect;
        const droppableElement1 = document.getElementById('d-1');
        const droppableElement2 = document.getElementById('d-2');
    
        if (rect && droppableElement1 && droppableElement2) {
            const draggableRect = {
                x: rect.current.translated.left,
                y: rect.current.translated.top,
                width: rect.current.translated.width,
                height: rect.current.translated.height,
            };
            const droppableRect1 = droppableElement1.getBoundingClientRect();
            const droppableRect2 = droppableElement2.getBoundingClientRect();
    
            if (
                draggableRect.x + draggableRect.width >= droppableRect1.left &&
                draggableRect.x <= droppableRect1.right &&
                draggableRect.y + draggableRect.height >= droppableRect1.top &&
                draggableRect.y <= droppableRect1.bottom
            ) {
                setIsOver1(true);
                switchStatus = {
                    socketId: socketId,
                    status: "player"
                };
            } else if(
                draggableRect.x + draggableRect.width >= droppableRect2.left &&
                draggableRect.x <= droppableRect2.right &&
                draggableRect.y + draggableRect.height >= droppableRect2.top &&
                draggableRect.y <= droppableRect2.bottom
            ) {
                setIsOver2(true);
                switchStatus = {
                    socketId: socketId,
                    status: "spectator"
                };
            } else {
                setIsOver1(false);
                setIsOver2(false);
                switchStatus = null;
            }
        }
    };


    return (
        <>
        { notifyProps !== null ?
            <Notification
                props={notifyProps}
            />
        : undefined }
        <motion.div
            key={location.pathname}
            className={sidebarHovered ? 'multiplayer-room-container-hovered' : 'multiplayer-room-container'}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            { loading ?
                <div className="profile-loading-screen">
                    <Loading
                        text={translation("loading_data_text")}
                        scale={2}
                    />
                </div>
            : activePage === "create" ?
                <>
                    { joinedRoom ?
                        <div className="waiting-room-title-container">
                            <div className="room-title-1"><span>{translation("multiplayer_room_open_text")}</span></div>
                            <div className="room-title-2"><span>{joinedRoom.roomName}</span></div>
                            <div className="room-title-3">
                                <span>{translation("multiplayer_join_link_text")}</span><br />
                                <Tooltip
                                    title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("multiplayer_copy_clipboard")}</span>}
                                    placement='top'
                                    arrow
                                    TransitionComponent={Zoom}
                                    TransitionProps={{ timeout: 600 }}
                                >
                                    <span className="roomid-to-clipboard" onClick={() => {navigator.clipboard.writeText(roomIDClipboard)}}>{joinedRoom.roomId}</span>
                                </Tooltip>
                            </div>
                            <div className="room-title-4">
                                <span>{translation("multiplayer_spectator_link_text")}</span><br />
                                <Tooltip
                                    title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("multiplayer_copy_clipboard")}</span>}
                                    placement='top'
                                    arrow
                                    TransitionComponent={Zoom}
                                    TransitionProps={{ timeout: 600 }}
                                >
                                    <span className="roomid-to-clipboard" onClick={() => {navigator.clipboard.writeText(spectatorIDClipboard)}}>{joinedRoom.spectatorId}</span>
                                </Tooltip>
                            </div>
                        </div>
                    :
                        <span className="room-list-title">{translation("multiplayer_create_room")}</span>
                    }
                    <div className="multiplayer-room-list-container">
                        { loading ?
                            <Loading
                                text={translation("downloading_data_text")}
                                scale={1.4}
                            />
                        : loadingRoom ?
                            <Loading
                                text={translation("loading_room_creation")}
                                scale={1.4}
                            />
                        : joinedRoom ?
                            <div className="waiting-room-container">
                                <div className="waiting-room-settings">
                                    <div className="waiting-room-settings-top">
                                        <span className="waiting-room-settings-title">Game Settings</span>
                                        <i class="fa-solid fa-sliders"></i>
                                    </div>
                                    <div className="waiting-room-settings-body">
                                        <div className="settings-body-gamemode-container">
                                            <span className="settings-body-gamemode-title">Game Mode</span>
                                            <div className="settings-body-gamemode">
                                                <span onClick={() => handleSwitchGameMode("up")}><i class="fa-solid fa-caret-up"></i></span>
                                                <span>{gameModes[gameMode]}</span>
                                                <span onClick={() => handleSwitchGameMode("down")}><i class="fa-solid fa-caret-down"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="waiting-room-chatbox">
                                    <div className="waiting-room-chat">
                                        {chatMessages.map((message, index) => (
                                            message.userName === decodedToken.username ?
                                                <div className="chatbox-message-1" key={index}>
                                                    <div className="message-body-1">
                                                        {message.message}
                                                    </div>
                                                    <Tooltip
                                                        title={<span style={{ color: "#fff", fontSize: "14px" }}>{message.userName}</span>}
                                                        placement='top'
                                                        arrow
                                                        TransitionComponent={Zoom}
                                                        TransitionProps={{ timeout: 600 }}
                                                    >
                                                        <div className="message-logo-1">
                                                            <span>{message.userName.slice(0, 1)}</span>
                                                        </div>
                                                    </Tooltip>
                                                    <span className="message-date-1">{message.date}</span>
                                                </div>
                                            :
                                                <div className="chatbox-message-2" key={index}>
                                                    <Tooltip
                                                        title={<span style={{ color: "#fff", fontSize: "14px" }}>{message.userName}</span>}
                                                        placement='top'
                                                        arrow
                                                        TransitionComponent={Zoom}
                                                        TransitionProps={{ timeout: 600 }}
                                                    >
                                                        <div className="message-logo-2">
                                                            <span>{message.userName.slice(0, 1)}</span>
                                                        </div>
                                                    </Tooltip>
                                                    <div className="message-body-2">
                                                        {message.message}
                                                    </div>
                                                    <span className="message-date-2">{message.date}</span>
                                                </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="waiting-room-message">
                                        <input
                                            className="waiting-room-chat-input"
                                            value={chatMessage}
                                            onChange={(e) => handleChatMessage(e)}
                                            onKeyDown={handleSendMessage}
                                            placeholder={translation("multiplayer_message_input_placeholder")}
                                        />
                                        <i onClick={handleSendMessageBtn} className="fa-solid fa-paper-plane"></i>
                                    </div>
                                </div>
                                <div className="waiting-room-userlist">
                                    <DndContext onDragEnd={handleDragEnd}>
                                        <div className="waiting-room-players">
                                            <div className="waiting-room-user-amount">
                                                <i class="fa-solid fa-headset room-amount-icon"></i>
                                                <span>{translation("multiplayer_waiting_players")} {joinedRoom.players.length} / 2</span>
                                            </div>
                                        </div>
                                        <DroppablePlayers id="droppable-1">
                                        <div className="droppable-container-1" id="d-1" style={{ background: isOver1 ? '#4794EC66' : 'none', animation: isOver1 ? "userPlaceAreaAnim 1s linear infinite" : undefined }}>
                                            { joinedRoom.players.length === 0 ?
                                                <>
                                                    <div className="player-list-player-1">
                                                        <span></span>
                                                    </div>
                                                    <div className="player-list-versus"></div>
                                                    <div className="player-list-player-2">
                                                        <span></span>
                                                    </div>
                                                </>
                                            : joinedRoom.players.length === 1 ?
                                                <>
                                                    <DndContext onDragMove={(e) => handleDragMove(e, joinedRoom.players[0].socketId)} onDragEnd={handleDragEnd}>
                                                        <Draggable id={`draggable-player-0`} className="player-list-player-1">
                                                            { joinedRoom.players[0].ready ?
                                                                <div className="versus-player-ready-1">
                                                                    <span>{translation("multiplayer_waiting_room_ready")}</span>
                                                                </div>
                                                            : undefined }
                                                            <div className="versus-player-name-1">
                                                                <span>{joinedRoom.players[0].userName}</span>
                                                            </div>
                                                            <div className="versus-player-logo-1" style={{backgroundImage: `url(${User1Image})`}}>
                                                                <i className={joinedRoom.players[0].typing ? "fa-solid fa-pencil fa-bounce fa-pencil-p" : undefined}></i> 
                                                            </div>
                                                        </Draggable>
                                                    </DndContext>
                                                    <div className="player-list-versus" style={{backgroundImage: `url(${VersusImage})`}}> </div>
                                                    <div className="player-list-player-2">

                                                    </div>
                                                </>
                                            : joinedRoom.players.length === 2 ?
                                                <>
                                                    <DndContext onDragMove={(e) => handleDragMove(e, joinedRoom.players[0].socketId)} onDragEnd={handleDragEnd}>
                                                        <Draggable id={`draggable-player-0`} className="player-list-player-1">
                                                            { joinedRoom.players[0].ready ?
                                                                <div className="versus-player-ready-1">
                                                                    <span>{translation("multiplayer_waiting_room_ready")}</span>
                                                                </div>
                                                            : undefined }
                                                            <div className="versus-player-name-1">
                                                                <span>{joinedRoom.players[0].userName}</span>
                                                            </div>
                                                            <div className="versus-player-logo-1" style={{backgroundImage: `url(${User1Image})`}}>
                                                                <i className={joinedRoom.players[0].typing ? "fa-solid fa-pencil fa-bounce fa-pencil-p" : undefined}></i> 
                                                            </div>
                                                        </Draggable>
                                                    </DndContext>
                                                    <div className="player-list-versus" style={{backgroundImage: `url(${VersusImage})`}}></div>
                                                    <DndContext onDragMove={(e) => handleDragMove(e, joinedRoom.players[1].socketId)} onDragEnd={handleDragEnd}>
                                                        <Draggable id={`draggable-player-1`} className="player-list-player-2">
                                                            { joinedRoom.players[1].ready ?
                                                                <div className="versus-player-ready-2">
                                                                    <span>{translation("multiplayer_waiting_room_ready")}</span>
                                                                </div>
                                                            : undefined }
                                                            <div className="versus-player-name-2">
                                                                <span>{joinedRoom.players[1].userName}</span>
                                                            </div>
                                                            <div className="versus-player-logo-2" style={{backgroundImage: `url(${User2Image})`}}>
                                                                <i className={joinedRoom.players[1].typing ? "fa-solid fa-pencil fa-bounce fa-pencil-p" : undefined}></i> 
                                                            </div>
                                                        </Draggable>
                                                    </DndContext>
                                                </>
                                            : undefined }
                                        </div>
                                        </DroppablePlayers>
                                        <div className="waiting-room-spectators">
                                            <div className="waiting-room-user-amount">
                                                <i class="fa-regular fa-eye room-amount-icon"></i>
                                                <span>{translation("multiplayer_waiting_spectators")} {joinedRoom.spectators.length} / 5</span>
                                            </div>
                                        </div>
                                        <DroppableSpectators id="droppable-2">
                                        <div className="droppable-container-2" id="d-2" style={{ background: isOver2 ? '#4794EC66' : 'none', animation: isOver2 ? "userPlaceAreaAnim 1s linear infinite" : undefined }}>
                                            {joinedRoom.spectators && joinedRoom.spectators.map((s, index) => (
                                                <React.Fragment key={index}>
                                                    <DndContext onDragMove={(e) => handleDragMove(e, s.socketId)} onDragEnd={handleDragEnd}>
                                                        <Draggable
                                                            id={`draggable-spectator-${index}`}
                                                            className="waiting-room-spectator"
                                                        >
                                                            <span>{s.userName}</span>
                                                            <i className={s.typing ? "fa-solid fa-pencil fa-bounce fa-pencil-s" : undefined}></i>
                                                        </Draggable>
                                                    </DndContext>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        </DroppableSpectators>
                                        <div className="waiting-room-leave" onClick={handleLeaveConfirmation}><span>{translation("multiplayer_waiting_room_leave")}</span></div>
                                        { joinedRoom.players.findIndex(x => x.userName === decodedToken.username) !== -1 ?
                                            <div className={!ready ? "waiting-room-ready" : "waiting-room-ready-ok"} onClick={handleReady}>
                                                <span>{translation("multiplayer_waiting_room_ready")}</span>
                                                { ready ? 
                                                    <div className="waiting-room-ready-bg" style={{
                                                        backgroundImage: `url(./images/multiplayer/ready.png)`
                                                    }}></div>
                                                : undefined }
                                            </div>
                                        :
                                            <div className="waiting-room-ready-disabled"><span>{translation("multiplayer_waiting_room_ready")}</span></div>
                                        }
                                    </DndContext>
                                </div>
                            </div>
                        :
                            <>
                                <div className="room-container-menu">
                                    <div className={activePage === "join" ? "room-menu-active" : ""} onClick={() => handlePageChange("join")}>{translation("multiplayer_join_to_room")}</div>
                                    <div className={activePage === "create" ? "room-menu-active" : ""} onClick={() => handlePageChange("create")}>{translation("multiplayer_create_a_room")}</div>
                                </div>
                                <div className="room-body-container">
                                    <span className="create-room-btn" onClick={createRoom}>{translation("multiplayer_create_the_room")}</span>
                                </div>
                            </>
                        }
                    </div>
                </>
            : activePage === "join" ?
                <>
                    { joinedRoom ?
                        <div className="waiting-room-title-container">
                            <div className="room-title-1"><span>{translation("multiplayer_room_open_text")}</span></div>
                            <div className="room-title-2"><span>{joinedRoom.roomName}</span></div>
                            <div className="room-title-3"></div>
                            <div className="room-title-4"></div>
                        </div>
                    :
                        <span className="room-list-title">{translation("multiplayer_join_room")}</span>
                    }
                    <div className="multiplayer-room-list-container">
                        { loading ?
                            <Loading
                                text={translation("downloading_data_text")}
                                scale={1.4}
                            />
                        : loadingRoom ?
                            <Loading
                                text={translation("loading_room_join")}
                                scale={1.4}
                            />
                        : joinedRoom ?
                            <div className="waiting-room-container">
                                <div className="waiting-room-settings">

                                </div>
                                <div className="waiting-room-chatbox">
                                    <div className="waiting-room-chat">
                                    {chatMessages.map((message, index) => (
                                            message.userName === decodedToken.username ?
                                                <div className="chatbox-message-1" key={index}>
                                                    <div className="message-body-1">
                                                        {message.message}
                                                    </div>
                                                    <Tooltip
                                                        title={<span style={{ color: "#fff", fontSize: "14px" }}>{message.userName}</span>}
                                                        placement='top'
                                                        arrow
                                                        TransitionComponent={Zoom}
                                                        TransitionProps={{ timeout: 600 }}
                                                    >
                                                        <div className="message-logo-1">
                                                            <span>{message.userName.slice(0, 1)}</span>
                                                        </div>
                                                    </Tooltip>
                                                    <span className="message-date-1">{message.date}</span>
                                                </div>
                                            :
                                                <div className="chatbox-message-2" key={index}>
                                                    <Tooltip
                                                        title={<span style={{ color: "#fff", fontSize: "14px" }}>{message.userName}</span>}
                                                        placement='top'
                                                        arrow
                                                        TransitionComponent={Zoom}
                                                        TransitionProps={{ timeout: 600 }}
                                                    >
                                                        <div className="message-logo-2">
                                                            <span>{message.userName.slice(0, 1)}</span>
                                                        </div>
                                                    </Tooltip>
                                                    <div className="message-body-2">
                                                        {message.message}
                                                    </div>
                                                    <span className="message-date-2">{message.date}</span>
                                                </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="waiting-room-message">
                                        <input
                                            className="waiting-room-chat-input"
                                            value={chatMessage}
                                            onChange={(e) => handleChatMessage(e)}
                                            onKeyDown={handleSendMessage}
                                            placeholder={translation("multiplayer_message_input_placeholder")}
                                        />
                                        <i onClick={handleSendMessageBtn} className="fa-solid fa-paper-plane"></i>
                                    </div>
                                </div>
                                <div className="waiting-room-userlist">
                                    <div className="waiting-room-players">
                                        <div className="waiting-room-user-amount">
                                            <i class="fa-solid fa-headset room-amount-icon"></i>
                                            <span>{translation("multiplayer_waiting_players")} {joinedRoom.players.length} / 2</span>
                                        </div>
                                    </div>
                                    <div className="droppable-container-3">
                                        { joinedRoom.players.length === 0 ?
                                            <>
                                                <div className="player-list-player-1">
                                                    <span></span>
                                                </div>
                                                <div className="player-list-versus"></div>
                                                <div className="player-list-player-2">
                                                    <span></span>
                                                </div>
                                            </>
                                        : joinedRoom.players.length === 1 ?
                                            <>
                                                <div className="player-list-player-1">
                                                    { joinedRoom.players[0].ready ?
                                                                <div className="versus-player-ready-1">
                                                                    <span>{translation("multiplayer_waiting_room_ready")}</span>
                                                                </div>
                                                            : undefined }
                                                    <div className="versus-player-name-1">
                                                        <span>{joinedRoom.players[0].userName}</span>
                                                    </div>
                                                    <div className="versus-player-logo-1" style={{backgroundImage: `url(${User1Image})`}}>
                                                        <i className={joinedRoom.players[0].typing ? "fa-solid fa-pencil fa-bounce fa-pencil-p" : undefined}></i> 
                                                    </div>
                                                </div>
                                                <div className="player-list-versus" style={{backgroundImage: `url(${VersusImage})`}}> </div>
                                                <div className="player-list-player-2">

                                                </div>
                                            </>
                                        : joinedRoom.players.length === 2 ?
                                            <>
                                                <div className="player-list-player-1">
                                                    { joinedRoom.players[0].ready ?
                                                        <div className="versus-player-ready-1">
                                                            <span>{translation("multiplayer_waiting_room_ready")}</span>
                                                        </div>
                                                    : undefined }
                                                    <div className="versus-player-name-1">
                                                        <span>{joinedRoom.players[0].userName}</span>
                                                    </div>
                                                    <div className="versus-player-logo-1" style={{backgroundImage: `url(${User1Image})`}}>
                                                        <i className={joinedRoom.players[0].typing ? "fa-solid fa-pencil fa-bounce fa-pencil-p" : undefined}></i> 
                                                    </div>
                                                </div>
                                                <div className="player-list-versus" style={{backgroundImage: `url(${VersusImage})`}}></div>
                                                <div className="player-list-player-2">
                                                    { joinedRoom.players[1].ready ?
                                                        <div className="versus-player-ready-2">
                                                            <span>{translation("multiplayer_waiting_room_ready")}</span>
                                                        </div>
                                                    : undefined }
                                                    <div className="versus-player-name-2">
                                                        <span>{joinedRoom.players[1].userName}</span>
                                                    </div>
                                                    <div className="versus-player-logo-2" style={{backgroundImage: `url(${User2Image})`}}>
                                                        <i className={joinedRoom.players[1].typing ? "fa-solid fa-pencil fa-bounce fa-pencil-p" : undefined}></i> 
                                                    </div>
                                                </div>
                                            </>
                                        : undefined }
                                    </div>
                                    <div className="waiting-room-spectators">
                                        <div className="waiting-room-user-amount">
                                            <i class="fa-regular fa-eye room-amount-icon"></i>
                                            <span>{translation("multiplayer_waiting_spectators")} {joinedRoom.spectators.length} / 5</span>
                                        </div>
                                    </div>
                                    {joinedRoom.spectators && joinedRoom.spectators.map((s, index) => (
                                        <React.Fragment key={index}>
                                            <div className="waiting-room-spectator">
                                                <span>{s.userName}</span>
                                                <i className={s.typing ? "fa-solid fa-pencil fa-bounce fa-pencil-s" : undefined}></i>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <div className="waiting-room-leave" onClick={handleLeaveConfirmation}><span>{translation("multiplayer_waiting_room_leave")}</span></div>
                                    { joinedRoom.players.findIndex(x => x.userName === decodedToken.username) !== -1 ?
                                        <div className={!ready ? "waiting-room-ready" : "waiting-room-ready-ok"} onClick={handleReady}>
                                            <span>{translation("multiplayer_waiting_room_ready")}</span>
                                            { ready ? 
                                                <div className="waiting-room-ready-bg" style={{
                                                    backgroundImage: `url(./images/multiplayer/ready.png)`
                                                }}></div>
                                            : undefined }
                                        </div>
                                    :
                                        <div className="waiting-room-ready-disabled"><span>{translation("multiplayer_waiting_room_ready")}</span></div>
                                    }
                                </div>
                            </div>
                        :
                            <>
                                <div className="room-container-menu">
                                    <div className={activePage === "join" ? "room-menu-active" : ""} onClick={() => handlePageChange("join")}>{translation("multiplayer_join_to_room")}</div>
                                    <div className={activePage === "create" ? "room-menu-active" : ""} onClick={() => handlePageChange("create")}>{translation("multiplayer_create_a_room")}</div>
                                </div>
                                <div className="room-body-container">
                                    <input
                                        className="join-room-input"
                                        value={roomId}
                                        onChange={(e) => handleRoomId(e)}
                                        maxLength="11"
                                        placeholder={translation("multiplayer_room_id")}
                                    />
                                    <button
                                        className={roomId && roomId.length === 11 ? "join-btn-active" : "join-btn-inactive"}
                                        onClick={roomId && roomId.length === 11 ? handleJoinRoom : undefined}
                                    >
                                        {translation("multiplayer_join_the_room")}
                                    </button>
                                </div>
                            </>
                        }
                    </div>
                </>
            : undefined       
            }
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={openModal}
                onClose={handleCloseModal}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                backdrop: {
                    timeout: 500,
                },
                }}
            >
                <Fade in={openModal}>
                    <Box sx={modalStyle}>
                        <Typography id="transition-modal-title" variant="h5" component="h1">
                            {translation("multiplayer_modal_leave_title")}
                        </Typography>
                        <hr />
                        <Typography id="transition-modal-description" sx={{ mt: 3 }}>
                            {translation("multiplayer_modal_leave_t1")}
                            <br />
                            {translation("multiplayer_modal_leave_t2")}
                        </Typography>
                        <span className="multiplayer-modal-confirm-leave-btn" onClick={handleLeaveRoom}>{translation("multiplayer_modal_leave_confirm")}</span>
                    </Box>
                </Fade>
            </Modal>
        </motion.div>
        </>
    );
}