const updateUserSave = (sql, id, data) => {
    const request = new sql.Request();

    const checkSave = () => {
        return new Promise((resolve, reject) => {
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0');
          var yyyy = today.getFullYear();
          today = yyyy + '-' + mm + '-' + dd;
    
          var update = `UPDATE adventure_data SET last_save = @date, data = @data WHERE user_id = @uid`;
    
          request.input('uid', id)
          request.input('date', today)
          request.input('data', data)
    
          request.query(update, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(true);
            }
          });
        });
    };

    return checkSave()
        .then(response => {
            request.cancel();
            return response;
        })
        .catch(err => {
            console.error(err.message);
    });
}

module.exports = {
    updateUserSave,
};