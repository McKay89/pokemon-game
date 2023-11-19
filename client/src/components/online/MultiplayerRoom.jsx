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

            const deleteRoom = (roomId) => {
                setJoinedRoom(null);

                // Delete Event Handlers
                socket.off(`updateRoom_${roomId}`, updateJoinRoom);
                socket.off(`joinRoom_${roomId}`, updateJoinRoom);
                socket.off(`createRoom_${roomId}`, updateCreateRoom);
            };

            const updateRoom = (roomData) => {
                let playerIndex = roomData && roomData.players.findIndex(x => x.userName === decodedToken.username);
                let spectatorIndex = roomData && roomData.spectators.findIndex(x => x.userName === decodedToken.username);
                
                if(playerIndex === -1 && spectatorIndex === -1) {
                    setJoinedRoom(null);

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
            socket.on('roomError', handleRoomError);
        
            return () => {
                socket.off('createRoom', updateCreateRoom);
                socket.off('joinRoom', updateJoinRoom);
                socket.off('roomDeleted', deleteRoom);
                socket.off('updateRoom', updateRoom);
                socket.off('roomError', handleRoomError);
            };
        }
    }, [socket]);

    const createRoom = () => {
        socket.emit('createRoom', decodedToken.username);
    };
    
    const handleJoinRoom = () => {
        setRoomId("");
        socket.emit('joinRoom', roomId, decodedToken.username);
    }

    const handleSendMessage = (event) => {
        if(event.key === "Enter") {
            socket.emit('sendMessage', joinedRoom.roomId, decodedToken.username, chatMessage);
            setChatMessage("");
        }
    }

    const handleChangeCreatorStatus = (status) => {
        socket.emit('changeCreatorStatus', joinedRoom.roomId, joinedRoom.creatorName, status);
    }
    
    const handleLeaveRoom = () => {
        socket.emit('leaveRoom', joinedRoom.roomId, decodedToken.username);

        // Delete Event Handlers
        socket.off('updateRoom', updateRoom);
        socket.off('roomDeleted', deleteRoom);
        socket.off('joinRoom', updateJoinRoom);
        socket.off('createRoom', updateCreateRoom);

        // Create Event Handlers
        socket.on('createRoom', updateCreateRoom);
        socket.on('joinRoom', updateJoinRoom);
        socket.on('roomDeleted', deleteRoom);
        socket.on('updateRoom', updateRoom);
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
                            <div className="room-title-3"><span>JOIN LINK</span><br /><span>{joinedRoom.roomId}</span></div>
                            <div className="room-title-4"><span>SPECTATOR LINK</span><br /><span>{joinedRoom.spectatorId}</span></div>
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
                                            placeholder="Your message here"
                                        />
                                    </div>
                                </div>
                                <div className="waiting-room-userlist">
                                    <div className="waiting-room-players">
                                        <span>Players&nbsp;&nbsp; {joinedRoom.players.length} / 2</span>
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
                                        <span>Players&nbsp;&nbsp; {joinedRoom.spectators.length} / 5</span>
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
                                            <div className="waiting-room-player">
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
                            <div className="room-title-3"><span></span></div>
                            <div className="room-title-4"><span></span></div>
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
                                            placeholder="Your message here"
                                        />
                                    </div>
                                </div>
                                <div className="waiting-room-userlist">
                                    <div className="waiting-room-players">
                                        <span>Players&nbsp;&nbsp; {joinedRoom.players.length} / 2</span>
                                    </div>
                                    {joinedRoom.players.map((p, index) => (
                                        <React.Fragment key={index}>
                                            <div className="waiting-room-player">
                                                <span>{p.userName}</span>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <div className="waiting-room-spectators">
                                        <span>Spectators&nbsp;&nbsp; {joinedRoom.spectators.length} / 5</span>
                                    </div>
                                    {joinedRoom.spectators && joinedRoom.spectators.map((s, index) => (
                                        <React.Fragment key={index}>
                                            <div className="waiting-room-player">
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