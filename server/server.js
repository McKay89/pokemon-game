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

// JWT //
    const crypto = require('crypto');
    const jwt = require('jsonwebtoken');
    var { expressjwt: newjwt } = require("express-jwt");
    const jwtSecret = crypto.randomBytes(32).toString('hex');

// CORS POLICY //
    const cors = require('cors');
    app.use(cors({origin:'http://localhost:5173'}));

// MULTIPLAYER SOCKET-IO
    const multiplayerSocket = require('./socketio.js');
    multiplayerSocket.multiplayerSocket(io);

// BCRYPT //
    const bcrypt = require('./bcrypt.js');

// CONNECT TO DATABASE //
    const db = require('./db.js');
    const sql = db.sqlConnect();

    // DB Repositories
    const createTable = require('./database/createTable.js');
    const updateTable = require('./database/updateTable.js');
    const deleteTable = require('./database/deleteTable.js');
    const getFromTable = require('./database/getFromTable.js');
    const insertIntoTable = require('./database/insertIntoTable.js');
    const deleteFromTable = require('./database/deleteFromTable.js');


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


// Test endpoint //
app.get('/api/test', async (req, res) => {
    res.json({message: "Endpoint is working !"});
})

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
    const hashedPassword = await bcrypt.useBcrypt(req.body.password);
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
            const userAuth = await bcrypt.compareHash(req.body.password, getUser["password"]);
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



// JWT IGNORE THIS ENDPOINTS //
app.use(
    newjwt({ secret: jwtSecret, algorithms: ['HS256'] }).unless({
        path: [
            '/api/login',
            '/api/register',
            '/api/jwt/verify',
            '/api/test'
        ],
    })
);

// SETUP SERVER ON PORT //
server.listen(3001, () => console.log('Server started on port 3001'));