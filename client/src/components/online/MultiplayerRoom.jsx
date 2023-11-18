import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import jwt_decode from 'jwt-decode';
import Loading from "../extras/Loading";
import io from 'socket.io-client';
import './MultiplayerRoom.css';


export default function MultiplayerRoom({translation, sidebarHovered, jwtToken}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [decodedToken, setDecodedToken] = useState({});
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState("join");
    const [socket, setSocket] = useState(null);
    const [joinedRoom, setJoinedRoom] = useState(null);
    const [roomId, setRoomId] = useState("");
    const [chatMessage, setChatMessage] = useState("");
    const [error, setError] = useState('');

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
            const serverAddress = "http://localhost:3001";
            const newSocket = io(serverAddress, {
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
                console.log(roomData);
                setJoinedRoom(roomData);
            };

            const updateJoinRoom = (roomData) => {
                setJoinedRoom(roomData);
            };

            const updateRoom = (roomData) => {
                console.log(roomData);
                setJoinedRoom(roomData);
            };
        
            const handleRoomError = (errorMessage) => {
                setError(errorMessage);
            };
        
            socket.on('createRoom', updateCreateRoom);
            socket.on('joinRoom', updateJoinRoom);
            socket.on('sendMessage', updateRoom);
            socket.on('roomError', handleRoomError);
        
            return () => {
                socket.off('roomError', updateCreateRoom);
                socket.off('roomError', updateJoinRoom);
                socket.off('roomError', updateRoom);
                socket.off('roomError', handleRoomError);
            };
        }
    }, [socket]);

    const createRoom = () => {
        socket.emit('createRoom', decodedToken.username);
    };
    
    const handleJoinRoom = () => {
        socket.emit('joinRoom', roomId, decodedToken.username);
    }

    const handleSendMessage = (event) => {
        if(event.key === "Enter") {
            socket.emit('sendMessage', joinedRoom.roomId, decodedToken.username, chatMessage);
            setChatMessage("");
        }
    }
    
    const leaveRoom = (roomName) => {
        socket.emit('leaveRoom', roomName);
    };

    const handlePageChange = (page) => {
        setActivePage(page);
    }

    const handleRoomId = (event) => {
        setRoomId(event.target.value);
    }

    const handleChatMessage = (event) => {
        setChatMessage(event.target.value);
    }

    return (
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
                    <span className="room-list-title">
                        { joinedRoom ?
                            <span>{joinedRoom.roomName}</span>
                        :
                            <span>Create a private room</span>
                        }
                    </span>
                    <div className="multiplayer-room-list-container">
                        { loading ?
                            <Loading
                                text={translation("downloading_data_text")}
                                scale={1.4}
                            />
                        : joinedRoom ?
                            <div className="waiting-room-container">
                                <div className="waiting-room-chatbox">
                                    <div className="waiting-room-chat">
                                        {joinedRoom.messages.map((m, index) => (
                                            <React.Fragment key={index}>
                                                <span>{m.message}</span>
                                                <br /><hr />
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="waiting-room-message">
                                        <input
                                            className="waiting-room-chat-input"
                                            value={chatMessage}
                                            onChange={(e) => handleChatMessage(e)}
                                            onKeyDown={handleSendMessage}
                                        />
                                    </div>
                                </div>
                                <div className="waiting-room-userlist">
                                    <span>Users</span><hr />
                                    {joinedRoom.players.map((p, index) => (
                                        <React.Fragment key={index}>
                                            <span>{p.userName}</span>
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        :
                            <>
                                <div className="room-container-menu">
                                    <div className={activePage === "join" ? "room-menu-active" : ""} onClick={() => handlePageChange("join")}>Join to Room</div>
                                    <div className={activePage === "create" ? "room-menu-active" : ""} onClick={() => handlePageChange("create")}>Create a Room</div>
                                </div>
                                <div className="room-body-container">
                                    <span className="create-room-btn" onClick={createRoom}>Create a Room</span>
                                </div>
                            </>
                        }
                    </div>
                </>
            : activePage === "join" ?
                <>
                    <span className="room-list-title">
                        { joinedRoom ?
                            <span>{joinedRoom.roomName}</span>
                        :
                            <span>Join to a private Room</span>
                        }
                    </span>
                    <div className="multiplayer-room-list-container">
                        { loading ?
                            <Loading
                                text={translation("downloading_data_text")}
                                scale={1.4}
                            />
                        : joinedRoom ?
                            <div className="waiting-room-container">
                                <div className="waiting-room-chatbox">
                                    <div className="waiting-room-chat">
                                        {joinedRoom.messages.map((m, index) => (
                                            <React.Fragment key={index}>
                                                <span>{m.message}</span>
                                                <br /><hr />
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="waiting-room-message">
                                        <input
                                            className="waiting-room-chat-input"
                                            value={chatMessage}
                                            onChange={(e) => handleChatMessage(e)}
                                            onKeyDown={handleSendMessage}
                                        />
                                    </div>
                                </div>
                                <div className="waiting-room-userlist">
                                    <span>Users</span><hr />
                                    {joinedRoom.players.map((p, index) => (
                                        <React.Fragment key={index}>
                                            <span>{p.userName}</span>
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        :
                            <>
                                <div className="room-container-menu">
                                    <div className={activePage === "join" ? "room-menu-active" : ""} onClick={() => handlePageChange("join")}>Join to Room</div>
                                    <div className={activePage === "create" ? "room-menu-active" : ""} onClick={() => handlePageChange("create")}>Create a Room</div>
                                </div>
                                <div className="room-body-container">
                                    <input
                                        className="join-room-input"
                                        value={roomId}
                                        onChange={(e) => handleRoomId(e)}
                                        maxLength="11"
                                    />
                                    <button
                                        className={roomId && roomId.length === 11 ? "join-btn-active" : "join-btn-inactive"}
                                        onClick={roomId && roomId.length === 11 ? handleJoinRoom : undefined}
                                    >
                                        JOIN
                                    </button>
                                </div>
                            </>
                        }
                    </div>
                </>
            : undefined       
            }
        </motion.div>
    );
}