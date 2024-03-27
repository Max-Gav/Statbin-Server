//Imports
const express = require("express");
const router = express.Router();
const spotifyApiController = require("./spotifyApiController")

router.get("/fetch", spotifyApiController.fetchDataFromUrl);

module.exports = router;
