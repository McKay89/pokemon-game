const removeById = (db, table, id) => {
    sql = `DELETE FROM ${table} WHERE id = ${id}`;
    db.run(sql);
}

module.exports = {
    removeById
};