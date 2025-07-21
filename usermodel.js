const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/test`);

const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    email : String,
});

module.exports = mongoose.model("user", userSchema);


