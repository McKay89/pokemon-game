// DOTENV //
    require('dotenv').config()

// DB DATA
    /* LOCAL SQL SERVER */
        const dbHost = process.env.HOSTNAME;
        const dbAdmin = process.env.ADMIN_USER;
        const dbPassword = process.env.ADMIN_PASSWORD;
        const dbDatabase = process.env.DATABASE;

    /* Deployed SQL Server */
        // const dbHost = process.env.HOSTNAME2;
        // const dbAdmin = process.env.ADMIN_USER2;
        // const dbPassword = process.env.ADMIN_PASSWORD2;
        // const dbDatabase = process.env.DATABASE2;

// CONNECT TO DATABASE
    var sql = require("mssql");

    // Database config data
    var config = {
        user: dbAdmin,
        password: dbPassword,
        server: dbHost, 
        database: dbDatabase,
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    };

    // Connect to database
    const sqlConnect = () => {
        sql.connect(config, function (err) {
            if (err) console.log(err);
        });
        return sql;
    }

module.exports = {
    sqlConnect
}