const user = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("./auth");

module.exports = function (app) {
  app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    const foundUser = await user.findOne({ email });
    if (!foundUser) {
      return res.status(404).send("User not found");
    }

    bcrypt.compare(password, foundUser.password, (err, result) => {
      // TODO: change error messages
      if (err) {
        return res.status(500).send("Error comparing passwords");
      }
      if (!result) {
        return res.status(401).send("Invalid password");
      }

      let token = jwt.sign({ email }, "secretkey");
      res.cookie("token", token);
      res.send("Login successful");
    });
  });

  app.get("/logout", authenticate, (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
  });

  app.get("/verify", authenticate, (req, res) => {
    console.log(req.user);
    res.json({ verified: true, user: req.user });
  });

  app.post("/createUser", async (req, res) => {
    let { username, email, password } = req.body;

    let userExists = await user.find({ email });
    if (userExists.length > 0) {
      return res.status(400).send("User already exists");
    }

    userExists = await user.find({ username });
    if (userExists.length > 0) {
      return res.status(400).send("Username taken");
    }

    bcrypt.genSalt(10, async (err, salt) => {
      if (err) {
        return res.status(500).send("Error generating salt");
      }
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return res.status(500).send("Error hashing password");
        }
        password = hash;

        const createdUser = await user.create({
          username,
          email,
          password,
        });

        let token = jwt.sign({ email }, "secretkey");
        res.cookie("token", token);

        res.status(201).send("User created");
      });
    });
  });

  app.post("/updateUser", authenticate, async (req, res) => {
    let { username, email, password } = req.body;

    bcrypt.genSalt(10, async (err, salt) => {
      if (err) {
        return res.status(500).send("Error generating salt");
      }

      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return res.status(500).send("Error hashing password");
        }
        password = hash;

        const updatedUser = await user.findOneAndUpdate(
          {
            username,
            email,
          },
          { password }
        );
        if (!updatedUser) {
          return res.status(404).send("User not found");
        }
        return res
          .status(200)
          .send("User updated successfully" + updatedUser.username);
      });
    });
  });

  app.get("/searchUsernames", authenticate, async (req, res) => {
    const loggedInUserId = req.user._id;
    searchString = req.searchString;
    const users = await user
      .find({
        username: { $regex: searchString, $options: "i" },
        _id: { $ne: loggedInUserId },
      })
      .select("username");
    res.send(users);
  });

  // app.post("/delete", authenticate, async (req, res) => {
  //   let { username } = req.body;
  //   const deletedUser = await user.findoneAndDelete({ username });
  //   res.send(deletedUser);
  // });
};
