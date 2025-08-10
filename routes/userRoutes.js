const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authenticate = require("./auth");
const User = require("../models/usermodel");

router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  const foundUser = await User.findOne({ email });
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

router.get("/logout", authenticate, (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

router.get("/verify", authenticate, (req, res) => {
  res.json({ verified: true, user: req.user });
});

router.post("/createUser", async (req, res) => {
  let { username, email, password } = req.body;

  let userExists = await User.find({ email });
  if (userExists.length > 0) {
    return res.status(400).send("User already exists");
  }

  userExists = await User.find({ username });
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

      const createdUser = await User.create({
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

router.post("/updateUser", authenticate, async (req, res) => {
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

      const updatedUser = await User.findOneAndUpdate(
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

router.get("/searchUsernames", authenticate, async (req, res) => {
  const loggedInUserId = req.user._id;
  searchString = req.query.searchString || "";
  const users = await User
    .find({
      username: { $regex: searchString, $options: "i" },
      _id: { $ne: loggedInUserId },
    })
    .select("username");
  res.send(users);
});

// route.post("/delete", authenticate, async (req, res) => {
//   let { username } = req.body;
//   const deletedUser = await user.findoneAndDelete({ username });
//   res.send(deletedUser);
// });

module.exports=router