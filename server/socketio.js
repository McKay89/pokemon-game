// ONLINE ROOMS //
    const onlineRooms = {};
    const activeUsers = {};

// FUNCTIONS //
    // Create Room ID
    const createRoomId = () => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const charactersLength = characters.length;
        let counter = 1;
        while (counter < 12) {
            if(counter % 4 === 0) {
                result += "-";
            } else {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            counter += 1;
        }

        if(Object.values(onlineRooms).indexOf(result) > -1) {
            createRoomId();
        } else {
            return result;
        }
    }

    // Find Room by ID
    const findRoom = (roomId) => {
        let foundedRoom = null;
        for(let room in onlineRooms) {
            if(onlineRooms[room].roomId === roomId) {
                foundedRoom = onlineRooms[room];
            }
        }

        return foundedRoom;
    }

// WEBSOCKET EVENT HANDLERS //
    const multiplayerSocket = (io) => {
        io.on('connection', (socket) => {
            console.log('User Connected:', socket.id);

            // Create a private room
            socket.on('createRoom', (creator) => {
                if(activeUsers[socket.id]) {
                    socket.emit('roomError', 'socket_error_already_in_room');
                } else {
                    const roomId = createRoomId();
                    const spectatorId = createRoomId();
                    const roomName = `${creator}'s Room`;

                    const roomData = {
                        roomName: roomName,
                        roomId: roomId,
                        roomJoinId: `${roomName}-${roomId}`,
                        spectatorId: spectatorId,
                        creatorId: socket.id,
                        creatorName: creator,
                        players: [ {
                            socketId: socket.id,
                            userName: creator,
                            typing: false,
                            ready: false
                        } ],
                        spectators: [ ],
                        messages: [],
                        matchStarted: false
                    }
                    onlineRooms[roomData.roomJoinId] = roomData;
                    socket.join(roomData.roomJoinId);

                    activeUsers[socket.id] = {
                        roomName: `${roomName}-${roomId}`,
                        socketId: socket.id
                    };

                    try {
                        io.to(roomData.roomJoinId).emit('createRoom', onlineRooms[roomData.roomJoinId]);
                    } catch (error) {
                        console.error('Error sending updateRoom event:', error);
                    }
                }
            });

            // Connect to a private room
            socket.on('joinRoom', (roomId, username) => {
                if(activeUsers[socket.id]) {
                    socket.emit('roomError', 'socket_error_already_in_room');
                } else {
                    let foundedRoom = null;
                    let status = null;
                    let max = null;

                    for(let room in onlineRooms) {
                        if(onlineRooms[room].roomId === roomId.toUpperCase()) {
                            foundedRoom = onlineRooms[room];
                            status = "players";
                            max = 2;
                        }
                        if(onlineRooms[room].spectatorId === roomId.toUpperCase()) {
                            foundedRoom = onlineRooms[room];
                            status = "spectators";
                            max = 5;
                        }
                    }

                    if (foundedRoom) {
                        if(onlineRooms[foundedRoom.roomJoinId][status].length < max) {
                            if(foundedRoom.matchStarted) {
                                socket.emit('roomError', 'socket_error_match_started');
                            } else {
                                onlineRooms[foundedRoom.roomJoinId][status].push({
                                    socketId: socket.id,
                                    userName: username,
                                    typing: false,
                                    ready: false
                                });
                                socket.join(foundedRoom.roomJoinId);
                
                                activeUsers[socket.id] = {
                                    roomName: foundedRoom.roomJoinId,
                                    socketId: socket.id
                                };
                
                                io.to(foundedRoom.roomJoinId).emit('joinRoom', onlineRooms[foundedRoom.roomJoinId], username);
                            }
                        } else {
                            socket.emit('roomError', 'socket_error_room_is_full');
                        }
                    } else {
                        socket.emit('roomError', 'socket_error_room_not_found');
                    }
                }
            });

            // Message Typing
            socket.on('typeMessage', (roomId, typeStatus) => {
                const foundedRoom = findRoom(roomId);

                if (foundedRoom) {
                    const playerIndex = onlineRooms[foundedRoom.roomJoinId].players.findIndex(x => x.socketId === socket.id);
                    const spectatorIndex = onlineRooms[foundedRoom.roomJoinId].spectators.findIndex(x => x.socketId === socket.id);
                
                    if(playerIndex !== -1) {
                        onlineRooms[foundedRoom.roomJoinId].players[playerIndex].typing = typeStatus;
                    } else if(spectatorIndex !== -1) {
                        onlineRooms[foundedRoom.roomJoinId].spectators[spectatorIndex].typing = typeStatus;
                    }

                    io.to(foundedRoom.roomJoinId).emit('updateRoom', onlineRooms[foundedRoom.roomJoinId]);
                } else {
                    socket.emit('roomError', 'socket_error_room_not_found');
                }
            })

            // Send message in private Room
            socket.on('sendMessage', (roomId, username, message) => {
                const foundedRoom = findRoom(roomId);

                if (foundedRoom) {
                    let status = null;

                    let date = new Date();
                    const elapsedSeconds = date.getSeconds();
                    const elapsedMinutes = date.getMinutes();
                    const elapsedHours = date.getHours();
                
                    const formattedHours = String(elapsedHours).padStart(2, '0');
                    const formattedMinutes = String(elapsedMinutes).padStart(2, '0');
                    const formattedSeconds = String(elapsedSeconds).padStart(2, '0');
                    const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

                    const playerIndex = onlineRooms[foundedRoom.roomJoinId].players.findIndex(x => x.socketId === socket.id);
                    const spectatorIndex = onlineRooms[foundedRoom.roomJoinId].spectators.findIndex(x => x.socketId === socket.id);
                    
                    if(playerIndex !== -1) {
                        status = "Player";
                        onlineRooms[foundedRoom.roomJoinId].players[playerIndex].typing = false;
                    } else if(spectatorIndex !== -1) {
                        status = "Spectator";
                        onlineRooms[foundedRoom.roomJoinId].spectators[spectatorIndex].typing = false;
                    }

                    onlineRooms[foundedRoom.roomJoinId].messages.push({
                        socketId: socket.id,
                        userName: username,
                        status: status,
                        date: formattedTime,
                        message: message
                    });
                    io.to(foundedRoom.roomJoinId).emit('updateMessages', {
                        socketId: socket.id,
                        userName: username,
                        status: status,
                        date: formattedTime,
                        message: message
                    });
                    io.to(foundedRoom.roomJoinId).emit('updateRoom', onlineRooms[foundedRoom.roomJoinId]);
                } else {
                    socket.emit('roomError', 'socket_error_room_not_found');
                }
            });

            // Change Creator Status in waiting room
            socket.on('changeUserStatus', (roomId, socketId, status) => {
                const foundedRoom = findRoom(roomId);

                if(foundedRoom) {
                    if(status === "player") {
                        let userIndex = onlineRooms[foundedRoom.roomJoinId].players.findIndex(x => x.socketId === socketId);

                        if(userIndex !== -1) {
                            // socket.emit('roomError', 'socket_error_already_player');
                        } else {
                            if(onlineRooms[foundedRoom.roomJoinId].players.length < 2) {
                                const spectatorIndex = onlineRooms[foundedRoom.roomJoinId].spectators.findIndex(x => x.socketId === socketId);

                                onlineRooms[foundedRoom.roomJoinId].spectators[spectatorIndex].ready = false;
                                onlineRooms[foundedRoom.roomJoinId].players.push(onlineRooms[foundedRoom.roomJoinId].spectators[spectatorIndex]);
                                onlineRooms[foundedRoom.roomJoinId].spectators.splice(spectatorIndex, 1);

                                io.to(socketId).emit('changeReadyStatus');
                                io.to(foundedRoom.roomJoinId).emit('updateRoom', onlineRooms[foundedRoom.roomJoinId]);
                            } else {
                                socket.emit('roomError', 'socket_error_players_full');
                            }
                        }
                    } else if(status === "spectator") {
                        let userIndex = onlineRooms[foundedRoom.roomJoinId].spectators.findIndex(x => x.socketId === socketId);

                        if(userIndex !== -1) {
                            // socket.emit('roomError', 'Already a Spectator !');
                        } else {
                            if(onlineRooms[foundedRoom.roomJoinId].spectators.length < 5) {
                                const playerIndex = onlineRooms[foundedRoom.roomJoinId].players.findIndex(x => x.socketId === socketId);

                                onlineRooms[foundedRoom.roomJoinId].players[playerIndex].ready = false;
                                onlineRooms[foundedRoom.roomJoinId].spectators.push(onlineRooms[foundedRoom.roomJoinId].players[playerIndex]);
                                onlineRooms[foundedRoom.roomJoinId].players.splice(playerIndex, 1);
                                
                                io.to(socketId).emit('changeReadyStatus');
                                io.to(foundedRoom.roomJoinId).emit('updateRoom', onlineRooms[foundedRoom.roomJoinId]);
                            } else {
                                socket.emit('roomError', 'socket_error_spectators_full');
                            }
                        }
                    } else {
                        socket.emit('roomError', 'socket_error_general');
                    }
                } else {
                    socket.emit('roomError', 'socket_error_room_not_found');
                }
            })

            // Kick user from room
            socket.on('kickUser', (roomId, userName, status) => {
                const foundedRoom = findRoom(roomId);

                if(foundedRoom) {
                    const userIndex = onlineRooms[foundedRoom.roomJoinId][status].findIndex(x => x.userName === userName);
                    onlineRooms[foundedRoom.roomJoinId][status].splice(userIndex, 1);

                    try {
                        const clientSocket = io.sockets.sockets[onlineRooms[foundedRoom.roomJoinId][status][userIndex].socketId];
                        if (clientSocket) {
                        clientSocket.leave(foundedRoom.roomJoinId);
                        }
                        delete activeUsers[onlineRooms[foundedRoom.roomJoinId][status][userIndex].socketId];
                    } catch(err) {
                        console.log(err);
                    }
                    
                    io.to(foundedRoom.roomJoinId).emit('updateRoom', onlineRooms[foundedRoom.roomJoinId]);
                } else {
                    socket.emit('roomError', 'socket_error_room_not_found');
                }
            })

            // Leave a private room
            socket.on('leaveRoom', (roomId, userName) => {
                const foundedRoom = findRoom(roomId);

                if(foundedRoom) {
                    let player = onlineRooms[foundedRoom.roomJoinId].players.find(x => x.userName === userName);
                    let spectator = onlineRooms[foundedRoom.roomJoinId].spectators.find(x => x.userName === userName);

                    if(player && player.userName === onlineRooms[foundedRoom.roomJoinId].creatorName || 
                    spectator && spectator.userName === onlineRooms[foundedRoom.roomJoinId].creatorName
                    ) {
                        io.to(foundedRoom.roomJoinId).emit('roomDeleted', foundedRoom.roomJoinId);
                        socket.removeAllListeners(`updateRoom_${foundedRoom.roomJoinId}`);
                        socket.removeAllListeners(`roomDeleted_${foundedRoom.roomJoinId}`);

                        onlineRooms[foundedRoom.roomJoinId].players.forEach(x => {
                            try {
                                const clientSocket = io.sockets.sockets[x.socketId];
                                if (clientSocket) {
                                clientSocket.leave(foundedRoom.roomJoinId);
                                }
                                delete activeUsers[x.socketId];
                            } catch(err) {
                                console.log(err);
                            }
                        })

                        onlineRooms[foundedRoom.roomJoinId].spectators.forEach(x => {
                            try {
                                const clientSocket = io.sockets.sockets[x.socketId];
                                if (clientSocket) {
                                clientSocket.leave(foundedRoom.roomJoinId);
                                }
                                delete activeUsers[x.socketId];
                            } catch(err) {
                                console.log(err);
                            }
                        })

                        delete onlineRooms[foundedRoom.roomJoinId];
                    } else {
                        if(player) {
                            const playerIndex = onlineRooms[foundedRoom.roomJoinId].players.findIndex(x => x.userName === userName);
                            
                            try {
                                const clientSocket = io.sockets.sockets[onlineRooms[foundedRoom.roomJoinId].players[playerIndex].socketId];
                                if (clientSocket) {
                                clientSocket.leave(foundedRoom.roomJoinId);
                                }
                                delete activeUsers[onlineRooms[foundedRoom.roomJoinId].players[playerIndex].socketId];
                                onlineRooms[foundedRoom.roomJoinId].players.splice(playerIndex, 1);
                            } catch(err) {
                                console.log(err);
                            }
                        } else if(spectator) {
                            const spectatorIndex = onlineRooms[foundedRoom.roomJoinId].spectators.findIndex(x => x.userName === userName);
                            
                            try {
                                const clientSocket = io.sockets.sockets[onlineRooms[foundedRoom.roomJoinId].spectators[spectatorIndex].socketId];
                                if (clientSocket) {
                                clientSocket.leave(foundedRoom.roomJoinId);
                                }
                                delete activeUsers[onlineRooms[foundedRoom.roomJoinId].spectators[spectatorIndex].socketId];
                                onlineRooms[foundedRoom.roomJoinId].spectators.splice(spectatorIndex, 1);
                            } catch(err) {
                                console.log(err);
                            }
                        }

                        io.to(foundedRoom.roomJoinId).emit('updateRoom', onlineRooms[foundedRoom.roomJoinId]);
                    }
                } else {
                    socket.emit('roomError', 'socket_error_room_not_found');
                }
            });

            // Player Ready Status
            socket.on('setReady', (roomId, userName, status) => {
                const foundedRoom = findRoom(roomId);

                if(foundedRoom) {
                    const playerIndex = foundedRoom.players.findIndex(x => x.userName === userName);
                    if(playerIndex !== -1) {
                        foundedRoom.players[playerIndex].ready = status;
                        io.to(foundedRoom.roomJoinId).emit('updateRoom', onlineRooms[foundedRoom.roomJoinId]);
                    } else {
                        socket.emit('roomError', 'socket_error_general');
                    }
                } else {
                    socket.emit('roomError', 'socket_error_room_not_found');
                }
            })

            // User disconnect
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);

                if (activeUsers[socket.id]) {
                    const { roomName, socketId } = activeUsers[socket.id];

                    if(onlineRooms[roomName].creatorId === socket.id) {
                        io.to(roomName).emit('roomDeleted', roomName);

                        onlineRooms[roomName].players.forEach(x => {
                            try {
                                const clientSocket = io.sockets.sockets[x.socketId];
                                if (clientSocket) {
                                clientSocket.leave(roomName);
                                }
                                delete activeUsers[x.socketId];
                            } catch(err) {
                                console.log(err);
                            }
                        })

                        onlineRooms[roomName].spectators.forEach(x => {
                            try {
                                const clientSocket = io.sockets.sockets[x.socketId];
                                if (clientSocket) {
                                clientSocket.leave(roomName);
                                }
                                delete activeUsers[x.socketId];
                            } catch(err) {
                                console.log(err);
                            }
                        })

                        delete onlineRooms[roomName];
                    } else {
                        const playerIndex = onlineRooms[roomName].players.findIndex(x => x.socketId === socketId);
                        const spectatorIndex = onlineRooms[roomName].spectators.findIndex(x => x.socketId === socketId);

                        if(playerIndex !== -1 && spectatorIndex === -1) {
                            try {
                                const clientSocket = io.sockets.sockets[onlineRooms[roomName].players[playerIndex].socketId];
                                if (clientSocket) {
                                clientSocket.leave(roomName);
                                }
                                onlineRooms[roomName].players.splice(playerIndex, 1);
                            } catch(err) {
                                console.log(err);
                            }
                        } else if(spectatorIndex !== -1 && playerIndex === -1) {
                            try {
                                const clientSocket = io.sockets.sockets[onlineRooms[roomName].spectators[spectatorIndex].socketId];
                                if (clientSocket) {
                                clientSocket.leave(roomName);
                                }
                                onlineRooms[roomName].spectators.splice(spectatorIndex, 1);
                            } catch(err) {
                                console.log(err);
                            }
                        }
                        
                        delete activeUsers[socket.id];
                        io.to(roomName).emit('updateRoom', onlineRooms[roomName]);
                    }
                }
            });
        });
    }


module.exports = {
    multiplayerSocket
};