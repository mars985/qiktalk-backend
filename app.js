const express = require('express');

const app = express();
const path = require('path');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

const userAPI = require('./api/userAPI');
const messageAPI = require('./api/messageAPI');

app.get('/', (req, res) => {
    res.send('hey');
})

userAPI(app);
messageAPI(app);

app.listen(3000);