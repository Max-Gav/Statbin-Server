// Imports
const express = require("express");
const router = express.Router();
const authController = require("./authController")


// Route to give a simple boolean answer if the user is logged in
router.get("/is-logged-in", authController.isLoggedIn);

// Route to redirect the user to the Spotify 'agree and connect' section
router.get("/login", authController.loginToSpotify);

// Route to handle Spotify callback and exchange code for access token
router.get("/connect-callback", authController.connectCallback);

// Route that fetches a new access token for the user and stores it in the cookies
router.post("/refresh-access-token", authController.refreshAccessToken);

// Route to delete user's tokens from the cookies
router.post("/disconnect-from-spotify", authController.disconnectFromSpotify);

module.exports = router;
