// Imports
const express = require("express");
const router = express.Router();
const userController = require("./usersController")


router.post("/user-creation", userController.createUser);

router.get("/user-info", userController.getUserInfo);


module.exports = router;
