const message = require("../models/messagemodel");

module.exports = function (app) {
  app.post("/createMessage", async (req, res) => {
    let { Id, sender, timeStamp, body } = req.body;
    let createdMsg = await message.create({
      Id,
      sender,
      timeStamp,
      body,
    });

    res.send(createdMsg);
  });

  app.get("/readMessage", async (req, res) => {
    const messages = await message.find();
    res.send({ users, messages });
  });

  app.post("/updateMessage", async (req, res) => {
    let { username, email, password } = req.body;
    const updatedMsg = await user.findoneAndUpdate(
      username,
      { email, password },
      { new: true }
    );

    res.send(updatedMsg);
  });

  app.post("/deleteMessage", async (req, res) => {
    let { Id } = req.body;
    const deletedMsg = await message.findoneAndDelete({ Id });
    res.send(deletedMsg);
  });
};
