const user = require("../models/usermodel");

module.exports = function (app) {
  app.post("/createUser", async (req, res) => {
    let { username, email, password } = req.body;
    let createdUser = await user.create({
      username,
      email,
      password,
    });
    res.send(createdUser);
  });

  app.post("/update", async (req, res) => {
    let { Id, sender, timeStamp, body } = req.body;
    const updatedMsg = await message.findoneAndUpdate(
      Id,
      { sender, timeStamp, body },
      { new: true }
    );

    res.send(updatedMsg);
  });

  app.get("/read", async (req, res) => {
    const users = await user.find();
    res.send({ users, messages });
  });

  app.post("/delete", async (req, res) => {
    let { username } = req.body;
    const deletedUser = await user.findoneAndDelete({ username });
    res.send(deletedUser);
  });
};
