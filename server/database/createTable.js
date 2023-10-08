const create = (db) => {
    const createUsers = () => {
        sql_users = `CREATE TABLE users(
            id INTEGER PRIMARY KEY,
            username TEXT,
            email TEXT,
            password TEXT,
            date_of_birth TEXT,
            reg_date TEXT,
            gender TEXT,
            rule TEXT,
            avatar TEXT,
            level INTEGER,
            xp INTEGER,
            cards TEXT
        )`;
        db.run(sql_users);
    }
    // createUsers(); // Create users table
}

module.exports = {
    create
};