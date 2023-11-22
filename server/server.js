/*
 ___   ___   ___  ___     _  ___   ___
/ __| / _ \/__   \\  \   // / _ \/__   \
\__ \|  __/   |  | \  \ // |  __/   |  |
\___/ \___|   |__|  \___/   \___|   |__|

                    Developed by McKay89
*/

// SERVER //
    const express = require('express');
    const http = require('http');
    const socketIo = require('socket.io');
    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server, {
        cors: {
            origin: "*",
        },
    });
    app.use(express.json());
    app.use(express.static(__dirname + '/public'));
    var fs = require("fs");

// DOTENV //
    require('dotenv').config()

    const dbHost = process.env.HOSTNAME;
    const dbAdmin = process.env.ADMIN_USER;
    const dbPassword = process.env.ADMIN_PASSWORD;
    const dbDatabase = process.env.DATABASE;

// JWT //
    const crypto = require('crypto');
    const jwt = require('jsonwebtoken');
    var { expressjwt: newjwt } = require("express-jwt");
    const jwtSecret = crypto.randomBytes(32).toString('hex');

// CORS POLICY //
    const cors = require('cors');
    app.use(cors({origin:'http://localhost:5173'}));  

// CONNECT TO DATABASE //
    var sql = require("mssql");
    var dbRequest;

    // Database config data
    var config = {
        user: dbAdmin,
        password: dbPassword,
        server: dbHost, 
        database: dbDatabase,
        options: {
            encrypt: false, // Ne használj SSL titkosítást
            trustServerCertificate: true // Elfogadni az önt aláírt tanúsítványt
        }
    };

    // Connect to database
    sql.connect(config, function (err) {
        if (err) console.log(err);
        dbRequest = new sql.Request();
    });

    // Query files
    const createTable = require('./database/createTable.js');
    const updateTable = require('./database/updateTable.js');
    const deleteTable = require('./database/deleteTable.js');
    const getFromTable = require('./database/getFromTable.js');
    const insertIntoTable = require('./database/insertIntoTable.js');
    const deleteFromTable = require('./database/deleteFromTable.js');

// BCRYPT //
    const bcrypt = require("bcrypt");
    const saltRounds = 10;

    // Hashming the password
    const bCrypt = async (password) => {
        try {
            const salt = await bcrypt.genSalt(saltRounds);        
            const hash = await bcrypt.hash(String(password), salt);
            return hash;
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

    // Compare the hashed password
    const compareHash = async (inputPassword, storedHash) => {
        try {
            const result = await new Promise((resolve, reject) => {
                bcrypt.compare(String(inputPassword), String(storedHash), (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return result;
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

// ONLINE ROOMS //
    const onlineRooms = {};
    const activeUsers = {};

// FUNCTIONS //
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
    io.on('connection', (socket) => {
        console.log('User Connected:', socket.id);
    
        // Create a private room
        socket.on('createRoom', (creator) => {
            if(activeUsers[socket.id]) {
                socket.emit('roomError', 'You are already in a room !');
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
                        typing: false
                    } ],
                    spectators: [ ],
                    messages: []
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
                socket.emit('roomError', 'You are already in a room !');
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
    
                if (foundedRoom && onlineRooms[foundedRoom.roomJoinId][status].length < max) {
                    onlineRooms[foundedRoom.roomJoinId][status].push({
                        socketId: socket.id,
                        userName: username,
                        typing: false
                    });
                    socket.join(foundedRoom.roomJoinId);
    
                    activeUsers[socket.id] = {
                        roomName: foundedRoom.roomJoinId,
                        socketId: socket.id
                    };
    
                    io.to(foundedRoom.roomJoinId).emit('joinRoom', onlineRooms[foundedRoom.roomJoinId]);
                } else {
                    socket.emit('roomError', 'The room is full or not exists.');
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
                socket.emit('roomError', 'Room not found !');
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
                socket.emit('roomError', 'Room not found !');
            }
        });

        // Change Creator Status in waiting room
        socket.on('changeUserStatus', (roomId, socketId, status) => {
            const foundedRoom = findRoom(roomId);

            if(foundedRoom) {
                if(status === "player") {
                    let userIndex = onlineRooms[foundedRoom.roomJoinId].players.findIndex(x => x.socketId === socketId);

                    if(userIndex !== -1) {
                        socket.emit('roomError', 'Already a Player !');
                    } else {
                        if(onlineRooms[foundedRoom.roomJoinId].players.length < 2) {
                            let spectatorIndex = onlineRooms[foundedRoom.roomJoinId].spectators.findIndex(x => x.socketId === socketId);

                            onlineRooms[foundedRoom.roomJoinId].players.push(onlineRooms[foundedRoom.roomJoinId].spectators[spectatorIndex]);
                            onlineRooms[foundedRoom.roomJoinId].spectators.splice(spectatorIndex, 1);

                            io.to(foundedRoom.roomJoinId).emit('updateRoom', onlineRooms[foundedRoom.roomJoinId]);
                        } else {
                            socket.emit('roomError', 'The player list is full !');
                        }
                    }
                } else if(status === "spectator") {
                    let userIndex = onlineRooms[foundedRoom.roomJoinId].spectators.findIndex(x => x.socketId === socketId);

                    if(userIndex !== -1) {
                        socket.emit('roomError', 'Already a Spectator !');
                    } else {
                        let playerIndex = onlineRooms[foundedRoom.roomJoinId].players.findIndex(x => x.socketId === socketId);

                        if(onlineRooms[foundedRoom.roomJoinId].spectators.length < 5) {
                            onlineRooms[foundedRoom.roomJoinId].spectators.push(onlineRooms[foundedRoom.roomJoinId].players[playerIndex]);
                            onlineRooms[foundedRoom.roomJoinId].players.splice(playerIndex, 1);
    
                            io.to(foundedRoom.roomJoinId).emit('updateRoom', onlineRooms[foundedRoom.roomJoinId]);
                        } else {
                            socket.emit('roomError', 'Spectator list is full !');
                        }
                    }
                } else {
                    socket.emit('roomError', 'Status not found !');
                }
            } else {
                socket.emit('roomError', 'Room not found !');
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
                socket.emit('roomError', 'Room not found !');
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
                socket.emit('roomError', 'Room not found !');
            }
        });
    
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

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


// JWT Validation //
app.post('/api/jwt/verify', async (req, res) => {
    const token = req.body.token;
    if (!token) {
        return res.status(401).json({ message: 'JWT Token is missing' });
    }
    
    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'JWT Token is invalid !' });
        }
        
        return res.status(200).json({data: token, message: 'JWT Token is valid !'});
    });
})

// Register //
app.post('/api/register', async (req, res) => {
    const hashedPassword = await bCrypt(req.body.password);
    const queryResponse = await insertIntoTable.insertIntoUsers(sql, req.body, hashedPassword);

    res.json(queryResponse);
})

// Log-In //
app.post('/api/login', async (req, res) => {
    const getUser = await getFromTable.findUserByName(sql, req.body.username);
    let user = {
        notify: "login_user_not_found"
    }

    if(getUser == 404) {
        res.json(user);
    } else {
        try {
            const userAuth = await compareHash(req.body.password, getUser["password"]);
            if(userAuth) {
                const payload = {
                    logged: true,
                    avatar: getUser["avatar"],
                    username: req.body.username,
                    role: getUser["role"],
                    userId: getUser["id"],
                    level: getUser["level"],
                    coin: getUser["coin"]
                };
                const token = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
                res.json({ token, notify: "login_success",});
            } else {
                res.status(401).json({ notify: 'login_user_not_found' });
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).json('Server error');
        }
    }
})

// User Match Stats //
app.get('/api/user/matchstats/:userId', async (req, res) => {
    const stats = await getFromTable.getUserMatchStats(sql, parseInt(req.params.userId));
    res.json(stats);
})

// Get User Data //
app.get('/api/user/get/:username', async (req, res) => {
    const getUser = await getFromTable.findUserByName(sql, req.params.username);
    const userData = {
        username: req.params.username,
        email: getUser["email"],
        avatar: getUser["avatar"],
        birthday: getUser["birthday"],
        regDate: getUser["reg_date"],
        role: getUser["role"],
        level: getUser["level"],
        xp: getUser["xp"],
        next_level_xp: getUser["next_level_xp"],
        cards: getUser["cards"],
        coin: getUser["coin"]
    }

    res.json(userData);
})

// Get User Cards //
app.get('/api/user/cards/:username', async (req, res) => {
    const userCards = await getFromTable.getUserCardsByName(sql, req.params.username);
    fs.readFile('./card_data/pokemon/pokemons.json', 'utf8', (err, data) => {
        if (err) {
            console.error('An error occured while reading JSON: ', err);
            return res.status(500).send('An error occured while reading JSON.');
        }
        const jsonData = JSON.parse(data);
        const allCards = [];

        // Filling Cards Object
        jsonData.forEach(card => {
            if(Object.values(JSON.parse(userCards)).includes(card["id"])) {
                allCards.push(card)
            } else {
                allCards.push({
                    id: card["id"],
                    card_type: card["card_type"]
                })
            }
        });

        res.json(allCards);
    });
})

// Set User Save State //
app.post('/api/user/save/:userid', async (req, res) => {
    const userSave = await getFromTable.getUserSaveById(sql, req.params.userid);

    if(userSave.length == 0) {
        if(await insertIntoTable.setUserSave(sql, req.params.userid, JSON.stringify(req.body))) {
            res.status(200).json({ message: "savegame_success" });
        }
    } else {
        if(await updateTable.updateUserSave(sql, req.params.userid, JSON.stringify(req.body))) {
            res.status(200).json({ message: "savegame_success" });
        }
    }
})

// Get User Save State //
app.get('/api/user/save/:userid', async (req, res) => {
    const userSave = await getFromTable.getUserSaveById(sql, req.params.userid);
    
    if(userSave.length == 0) {
        res.status(404).json({ message: "Not Found" });
    } else {
        res.status(200).json(JSON.parse(userSave[0].data));
    }
})



// ENDPOINTS IGNORES JWT //
app.use(
    newjwt({ secret: jwtSecret, algorithms: ['HS256'] }).unless({
    path: ['/api/login', '/api/register', '/api/jwt/verify'],
    })
);

// SETUP SERVER ON PORT //
server.listen(3001, () => console.log('Server started on port 3001'));