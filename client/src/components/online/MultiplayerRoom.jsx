import React, { useState, useEffect, useRef } from 'react';
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
    const [loadingRoom, setLoadingRoom] = useState(false);
    const [activePage, setActivePage] = useState("join");
    const [socket, setSocket] = useState(null);
    const [joinedRoom, setJoinedRoom] = useState(null);
    const [roomId, setRoomId] = useState("");
    const [chatMessage, setChatMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [roomIDClipboard, setRoomIDClipboard] = useState("");
    const [spectatorIDClipboard, setSpectatorIDClipboard] = useState("");
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
                setRoomIDClipboard(roomData.roomId);
                setSpectatorIDClipboard(roomData.spectatorId);
                setJoinedRoom(roomData);
            };

            const updateJoinRoom = (roomData) => {
                setJoinedRoom(roomData);
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

                    // Delete Event Handlers
                    socket.off(`updateRoom_${roomData.roomJoinId}`, updateJoinRoom);
                    socket.off(`joinRoom_${roomData.roomJoinId}`, updateJoinRoom);
                    socket.off(`createRoom_${roomData.roomJoinId}`, updateCreateRoom);
                } else {
                    setJoinedRoom(roomData);
                }                
            };
        
            const handleRoomError = (errorMessage) => {
                setError(errorMessage);
            };
        
            socket.on('createRoom', updateCreateRoom);
            socket.on('joinRoom', updateJoinRoom);
            socket.on('roomDeleted', deleteRoom);
            socket.on('updateRoom', updateRoom);
            socket.on('updateMessages', updateMessages);
            socket.on('roomError', handleRoomError);
        
            return () => {
                socket.off('createRoom', updateCreateRoom);
                socket.off('joinRoom', updateJoinRoom);
                socket.off('roomDeleted', deleteRoom);
                socket.off('updateRoom', updateRoom);
                socket.off('updateMessages', updateMessages);
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

    const handleChangeCreatorStatus = (status) => {
        socket.emit('changeCreatorStatus', joinedRoom.roomId, joinedRoom.creatorName, status);
    }
    
    const handleLeaveRoom = () => {
        socket.emit('leaveRoom', joinedRoom.roomId, decodedToken.username);
    };

    const handleKickPlayer = (status, username) => {
        socket.emit('kickUser', joinedRoom.roomId, username, status);
    }

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
                    { joinedRoom ?
                        <div className="waiting-room-title-container">
                            <div className="room-title-1"><span>Open</span></div>
                            <div className="room-title-2"><span>{joinedRoom.roomName}</span></div>
                            <div className="room-title-3">
                                <span>JOIN LINK</span><br />
                                <Tooltip
                                    title={<span style={{ color: "#fff", fontSize: "14px" }}>Click for a copy</span>}
                                    placement='top'
                                    arrow
                                    TransitionComponent={Zoom}
                                    TransitionProps={{ timeout: 600 }}
                                >
                                    <span className="roomid-to-clipboard" onClick={() => {navigator.clipboard.writeText(roomIDClipboard)}}>{joinedRoom.roomId}</span>
                                </Tooltip>
                            </div>
                            <div className="room-title-4">
                                <span>SPECTATOR LINK</span><br />
                                <Tooltip
                                    title={<span style={{ color: "#fff", fontSize: "14px" }}>Click for a copy</span>}
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
                        <span className="room-list-title">Create a private room</span>
                    }
                    <div className="multiplayer-room-list-container">
                        { loading ?
                            <Loading
                                text={translation("downloading_data_text")}
                                scale={1.4}
                            />
                        : loadingRoom ?
                            <Loading
                                text={"Creating Online Room ..."}
                                scale={1.4}
                            />
                        : joinedRoom ?
                            <div className="waiting-room-container">
                                <div className="waiting-room-chatbox">
                                    <div className="waiting-room-chat">
                                        {chatMessages.map((message, index) => (
                                            <div className="chatbox-message" key={index}>
                                                <div className="message-head">
                                                    <div>
                                                        {message.userName}
                                                    </div>
                                                    <div>
                                                        {message.date}
                                                    </div>
                                                </div>
                                                <div className="message-body">
                                                    {message.message}
                                                </div>
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
                                            placeholder="Your message here"
                                        />
                                        <i onClick={handleSendMessageBtn} className="fa-solid fa-paper-plane"></i>
                                    </div>
                                </div>
                                <div className="waiting-room-userlist">
                                    <div className="waiting-room-players">
                                        <div className="waiting-room-user-amount">
                                            <span>Players</span>
                                            <span>{joinedRoom.players.length} / 2</span>
                                        </div>
                                        <Tooltip
                                            title={<span style={{ color: "#fff", fontSize: "14px" }}>Join as Player</span>}
                                            placement='right'
                                            arrow
                                            TransitionComponent={Zoom}
                                            TransitionProps={{ timeout: 600 }}
                                        >
                                            <span onClick={() => handleChangeCreatorStatus("player")}>JOIN</span>
                                        </Tooltip>
                                    </div>
                                    {joinedRoom.players.map((p, index) => (
                                        <React.Fragment key={index}>
                                            <div className="waiting-room-player">
                                                <span>{p.userName}</span>
                                                { p.userName === decodedToken.username ?
                                                    undefined
                                                :
                                                    <Tooltip
                                                        title={<span style={{ color: "#fff", fontSize: "14px" }}>Remove player from the Room</span>}
                                                        placement='right'
                                                        arrow
                                                        TransitionComponent={Zoom}
                                                        TransitionProps={{ timeout: 600 }}
                                                    >
                                                        <span onClick={() => handleKickPlayer("players", p.userName)}><i class="fa-solid fa-square-xmark"></i></span>
                                                    </Tooltip>
                                                }
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <div className="waiting-room-spectators">
                                        <div className="waiting-room-user-amount">
                                            <span>Spectators</span>
                                            <span>{joinedRoom.spectators.length} / 5</span>
                                        </div>
                                        <Tooltip
                                            title={<span style={{ color: "#fff", fontSize: "14px" }}>Join as Spectator</span>}
                                            placement='right'
                                            arrow
                                            TransitionComponent={Zoom}
                                            TransitionProps={{ timeout: 600 }}
                                        >
                                            <span onClick={() => handleChangeCreatorStatus("spectator")}>JOIN</span>
                                        </Tooltip>
                                    </div>
                                    {joinedRoom.spectators && joinedRoom.spectators.map((s, index) => (
                                        <React.Fragment key={index}>
                                            <div className="waiting-room-spectator">
                                                <span>{s.userName}</span>
                                                { s.userName === decodedToken.username ?
                                                    undefined
                                                :
                                                    <Tooltip
                                                        title={<span style={{ color: "#fff", fontSize: "14px" }}>Remove player from the Room</span>}
                                                        placement='right'
                                                        arrow
                                                        TransitionComponent={Zoom}
                                                        TransitionProps={{ timeout: 600 }}
                                                    >
                                                        <span onClick={() => handleKickPlayer("spectators", s.userName)}><i class="fa-solid fa-square-xmark"></i></span>
                                                    </Tooltip>
                                                }
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <div className="waiting-room-leave" onClick={handleLeaveRoom}><span>Leave Room</span></div>
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
                    { joinedRoom ?
                        <div className="waiting-room-title-container">
                            <div className="room-title-1"><span>Open</span></div>
                            <div className="room-title-2"><span>{joinedRoom.roomName}</span></div>
                            <div className="room-title-3"></div>
                            <div className="room-title-4"></div>
                        </div>
                    :
                        <span className="room-list-title">Join to a private room</span>
                    }
                    <div className="multiplayer-room-list-container">
                        { loading ?
                            <Loading
                                text={translation("downloading_data_text")}
                                scale={1.4}
                            />
                        : loadingRoom ?
                            <Loading
                                text={"Connecting to Room ..."}
                                scale={1.4}
                            />
                        : joinedRoom ?
                            <div className="waiting-room-container">
                                <div className="waiting-room-chatbox">
                                    <div className="waiting-room-chat">
                                        {chatMessages.map((message, index) => (
                                            <div className="chatbox-message" key={index}>
                                            <div className="message-head">
                                                <div>
                                                    {message.userName}
                                                </div>
                                                <div>
                                                    {message.date}
                                                </div>
                                            </div>
                                            <div className="message-body">
                                                {message.message}
                                            </div>
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
                                            placeholder="Your message here"
                                        />
                                        <i onClick={handleSendMessageBtn} className="fa-solid fa-paper-plane"></i>
                                    </div>
                                </div>
                                <div className="waiting-room-userlist">
                                    <div className="waiting-room-players">
                                        <div className="waiting-room-user-amount">
                                            <span>Players</span>
                                            <span>{joinedRoom.players.length} / 2</span>
                                        </div>
                                    </div>
                                    {joinedRoom.players.map((p, index) => (
                                        <React.Fragment key={index}>
                                            <div className="waiting-room-player">
                                                <span>{p.userName}</span>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <div className="waiting-room-spectators">
                                        <div className="waiting-room-user-amount">
                                            <span>Spectators</span>
                                            <span>{joinedRoom.spectators.length} / 5</span>
                                        </div>
                                    </div>
                                    {joinedRoom.spectators && joinedRoom.spectators.map((s, index) => (
                                        <React.Fragment key={index}>
                                            <div className="waiting-room-spectator">
                                                <span>{s.userName}</span>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <div className="waiting-room-leave" onClick={handleLeaveRoom}><span>Leave Room</span></div>
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
                                        placeholder="ROOM-ID"
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