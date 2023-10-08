const drop = (db, table) => {
    db.run("DROP TABLE "+ table +"");
}

module.exports = {
    drop
};