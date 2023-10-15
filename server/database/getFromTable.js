const findUserByName = (sql, username) => {
    const request = new sql.Request();
    query = `SELECT * FROM users`;

    const checkUser = (username) => {
        return new Promise((resolve, reject) => {
            request.query(query, function (err, recordset) {
              // Handle error
              if (err) {
                console.log(err);
                reject(err);
                return;
              } else {
                let foundedUser = undefined;
                const rows = recordset.recordset;

                rows.forEach(e => {
                    if (e["username"] === username) {
                        foundedUser = e;
                    }
                });

                if(foundedUser != undefined) {
                    resolve(foundedUser);
                } else {
                    resolve(404);
                }
              }
            });
        });
    };

    return checkUser(username)
        .then(response => {
            request.cancel();
            return response;
        })
        .catch(err => {
            console.error(err.message);
    });
}

const getUserMatchStats = (sql, id) => {
    const request = new sql.Request();
    request.input('uid', id);

    const checkStats = (id) => {
        return new Promise((resolve, reject) => {
            request.query('SELECT * FROM match_statistics WHERE user_id = @uid', function (err, recordset) {
              // Handle error
              if (err) {
                console.log(err);
                reject(err);
                return;
              } else {
                resolve(recordset.recordset);
              }
            });
        });
    };

    return checkStats(id)
        .then(response => {
            request.cancel();
            return response;
        })
        .catch(err => {
            console.error(err.message);
    });
}
  
module.exports = {
    findUserByName,
    getUserMatchStats
};