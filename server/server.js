/*
 ___   ___   ___  ___     _  ___   ___
/ __| / _ \/__   \\  \   // / _ \/__   \
\__ \|  __/   |  | \  \ // |  __/   |  |
\___/ \___|   |__|  \___/   \___|   |__|

                    Developed by McKay89
*/

// EXPRESS //
    const express = require('express');
    const app = express();
    const fs = require('fs');
    app.use(express.json());
    app.use(express.static(__dirname + '/public'));
    

// DOTENV //
    require('dotenv').config()

    const dbHost = process.env.HOSTNAME;
    const dbAdmin = process.env.ADMIN_USER;
    const dbPassword = process.env.ADMIN_PASSWORD;
    const dbDatabase = process.env.DATABASE;

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
        database: dbDatabase 
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



// Test GET //
app.get('/api/testdata', (req, res) => {
    const data = {
        name: "Vulpix",
        attack: 20,
        desc: {
            en: "Bulbasaur test description",
            hu: "Bulbasaur teszt leírás"
        }
    };
    res.json(data);
})

// Register //
app.post('/api/register', async (req, res) => {
    const data = req.body;
    const hashedPassword = await bCrypt(data.password);
    const queryResponse = await insertIntoTable.insertIntoUsers(dbRequest, data, hashedPassword);

    res.json(queryResponse);
})

// Log-In //
app.post('/api/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const getUser = await getFromTable.findUserByName(dbRequest, username);
    let user = {
        notify: "login_user_not_found"
    }

    if(getUser == 404) {
        res.json(user);
    } else {
        try {
            const userAuth = await compareHash(password, getUser["password"]);
            if(userAuth) {
                user = {
                    notify: "login_success",
                    logged: true,
                    username: username,
                    email: getUser["email"],
                    avatar: getUser["avatar"],
                    birthday: getUser["birthday"],
                    regDate: getUser["reg_date"],
                    role: getUser["role"],
                    level: getUser["level"],
                    xp: getUser["xp"],
                    cards: getUser["cards"]
                }
                res.json(user);
            } else {
                res.json(user);
            }
        } catch (err) {
            console.error(err.message);
        }
    }
})


// SETUP SERVER ON PORT //
app.listen(3001, () => console.log('Server started on port 3001'));