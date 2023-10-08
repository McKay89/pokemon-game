const findUserByName = (request, username) => {
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
            return response;
        })
        .catch(err => {
            console.error(err.message);
    });
}
  
module.exports = {
    findUserByName
};