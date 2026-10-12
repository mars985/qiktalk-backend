const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/auth.middleware");
const messageController = require("../controllers/message.controller");
const { validate } = require("../middlewares/validate.middleware");
const messageValidator = require("../validators/message.validator");

/*
TODO:

router.put(
    "/editMessage"
);

router.delete(
    "/deleteMessage"
);

*/

module.exports = router;