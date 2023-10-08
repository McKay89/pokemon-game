const insertIntoUsers = (request, data, hashedPassword) => {
    // Check if username or email are taken
    query = `SELECT * FROM users`;
    const checkUsernameEmail = () => {
      return new Promise((resolve, reject) => {
          request.query(query, function (err, recordset) {
              // Handle error
              if (err) {
                  console.log(err);
                  reject(err);
                  return;
              }
  
              const rows = recordset.recordset;
              let isUsernameTaken = false;
              let isEmailTaken = false;
  
              rows.forEach(e => {
                  if (e["username"] === data.username) {
                      isUsernameTaken = true;
                  }
                  if (e["email"] === data.email) {
                      isEmailTaken = true;
                  }
              });
  
              if (isUsernameTaken) {
                  resolve("register_username_taken");
              } else if (isEmailTaken) {
                  resolve("register_email_taken");
              } else {
                console.log(data.username);
                  // Handle SQL Query
                  var today = new Date();
                  var dd = String(today.getDate()).padStart(2, '0');
                  var mm = String(today.getMonth() + 1).padStart(2, '0');
                  var yyyy = today.getFullYear();
                  today = yyyy + '-' + mm + '-' + dd;
  
                  var insert = `INSERT INTO users (username, email, password, date_of_birth, reg_date, gender, role, avatar, level, xp, cards)
                                    VALUES (@username, @email, @password, @date_of_birth, @reg_date, @gender, @role, @avatar, @level, @xp, @cards)`;
                  
                  // Parameters
                  request.input('username', data.username)
                  request.input('email', data.email)
                  request.input('password', hashedPassword)
                  request.input('date_of_birth', data.birthday)
                  request.input('reg_date', today)
                  request.input('gender', data.gender)
                  request.input('role', 'User')
                  request.input('avatar', '/images/users/default_' + data.gender + '.png')
                  request.input('level', 1)
                  request.input('xp', 0)
                  request.input('cards', '{}')
  
                  request.query(insert, function (err, result) {
                      if (err) {
                          console.error(err);
                          reject(err);
                      } else {
                          resolve("register_success");
                      }
                  });
              }
            });
      });
    };

    return checkUsernameEmail()
      .then(response => {
        return String(response);
      })
      .catch(err => {
        console.error(err.message);
      });
}

module.exports = {
  insertIntoUsers
};