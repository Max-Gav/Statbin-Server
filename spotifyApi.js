// spotifyApi.js
const SpotifyWebApi = require('spotify-web-api-node');

// Initialize the Spotify API client
const spotifyApi = new SpotifyWebApi();

// Function to set the access token for the client
const setAccessToken = (accessToken) => {
  spotifyApi.setAccessToken(accessToken);
};

// Function to fetch the user's top tracks
const getTopTracks = (limit) => {
  return spotifyApi.getMyTopTracks({ limit });
};

module.exports = { setAccessToken, getTopTracks };
