const express = require('express');

const app = express();
const path = require('path');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));


const user = require("./usermodel");
const {message} = require("./messagemodel")


app.get('/', (req, res) => {
    res.send('hey');
})

app.post('/create', async (req, res) => {
    let {username, email, password} = req.body;
    let createdUser =  await user.create({ 
        username,
        email,
        password
    });
    res.send(createdUser);
})

// // app.post('/create', async (req, res) => {
// //     let {Id, sender, timeStamp, body} = req.body;
// //     let createdMsg =  await message.create({ 
// //         Id,
// //         sender, 
// //         timeStamp,
// //         body,
// //     });

// //     res.send(createdMsg);
// // })

// app.post('/update', async (req, res) => {
//     let {username, email, password} = req.body;
//     const updatedMsg = await user.findoneAndUpdate(
//         username,
//         {email, password},
//         {new: true},
//     )
    
//     res.send(updatedMsg);
// })

// // app.post('/update', async (req, res) => {
// //     let {Id, sender, timeStamp, body} = req.body;
// //     const updatedMsg = await message.findoneAndUpdate(
// //         Id,
// //         {sender, timeStamp, body},
// //         {new: true},
// //     )
    
// //     res.send(updatedMsg);
// // })

// app.post('/delete', async (req, res) => {
//     let {Id} = req.body;
//     const deletedMsg = await message.findoneAndDelete(Id);
//     res.send(deletedMsg);
// })

// // app.post('/delete', async (req, res) => {
// //     let {username} = req.body;
// //     const deletedUser = await user.findoneAndDelete(username);
// //     res.send(deletedUser);
// // })

// app.get('/read', async (req, res) => {
//     const users = await user.find();
//     const messages = await message.find();
//     res.send({ users, messages });
// })

app.listen(3000);