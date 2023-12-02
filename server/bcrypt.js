const bcrypt = require("bcrypt");
const saltRounds = 10;

// Hashing the password
const useBcrypt = async (password) => {
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

module.exports = {
    useBcrypt,
    compareHash
};