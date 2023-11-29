const checkUser = (username, request, query) => {
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

const findUserByName = (sql, username) => {
    const request = new sql.Request();
    query = `SELECT * FROM users`;

    return checkUser(username, request, query)
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

    const checkStats = () => {
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

    return checkStats()
        .then(response => {
            request.cancel();
            return response;
        })
        .catch(err => {
            console.error(err.message);
    });
}

const getUserCardsByName = (sql, username) => {
    const request = new sql.Request();
    query = `SELECT * FROM users`;

    return checkUser(username, request, query)
        .then(response => {
            request.cancel();
            return response["cards"];
        })
        .catch(err => {
            console.error(err.message);
    });
}

const getUserSaveById = (sql, id) => {
    const request = new sql.Request();
    request.input('uid', id);

    const checkSaves = () => {
        return new Promise((resolve, reject) => {
            request.query('SELECT * FROM adventure_data WHERE user_id = @uid', function (err, recordset) {
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

    return checkSaves()
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
    getUserMatchStats,
    getUserCardsByName,
    getUserSaveById
};