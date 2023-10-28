//Imports
const express = require('express');
const router = express.Router();
const queryString = require('querystring');
const spotifyApi = require('../spotifyApi'); 

// Your Spotify Developer credentials
const CLIENT_ID = '3c0724f5f6ac45af8494b54abb1de859';
const CLIENT_SECRET = 'ce448b94a8a4486c90d405f4ba99037d';
const REDIRECT_URI_CLIENT = 'http://localhost:5173/'; 
const REDIRECT_URI_CLIENT_CALLBACK = 'http://localhost:5173/callback'; 
const REDIRECT_URI_SERVER = 'http://localhost:3001/auth/connect-callback'; 


//A function that generates a random string for the state
const generateRandomString = function(length){
  let text ='';
  const possible = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';

  for(let i=0; i<length; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


//Route to redirect the user to the Spotify 'agree and connect' section
router.get('/login', (req, res) => {
  let state = generateRandomString(16);
  const scopes = 'user-read-private user-read-email user-top-read user-read-recently-played'; 

  // Generate the Spotify authorization URL
  const queryParams = queryString.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI_SERVER,
    state: state
  });

  const authorizeUrl = `https://accounts.spotify.com/authorize?${queryParams}`;

  // Return a link in order to redirect the user to Spotify's authorization page
  res.json({authorizeUrl});
});


// Route to handle Spotify callback and exchange code for access token
router.get('/connect-callback', async (req, res) => {
    let code = req.query.code || null;
    let state =  req.query.state || null;

    //Redirecting to client index page if authentication faild
    if(state === null) {
      res.redirect(REDIRECT_URI_CLIENT +"?error=auth-failed");
    } else {
      
      //Authentication Options Object
      const authOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
          },
          body: `code=${code}&redirect_uri=${REDIRECT_URI_SERVER}&grant_type=authorization_code`,
          json:true
        };

        
        //Get the user access and refresh token
        fetch('https://accounts.spotify.com/api/token', authOptions)
        .then((response) => {
          if(response.status === 200) {
             response.json().then((data) => {
              console.log(data);
              const queryParams = queryString.stringify({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
              });
              res.redirect(REDIRECT_URI_CLIENT_CALLBACK +`?${queryParams}`)

             });
          } else {
                 res.json(REDIRECT_URI_CLIENT);
          };
        });
    };
  });

  //Route that gets a request token and using it the route 
  router.get('/refresh-access-token', async (req, res) => {
    //Taking the refresh token from query parameters
    let refresh_token = req.query.refresh_token;

    //Authentication Options Object
    const authOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        },
        body: `grant_type=refresh_token&refresh_token=${refresh_token}`,
        json:true
      };


    //Getting a new access token using a refresh token from Spotify's API
    fetch('https://accounts.spotify.com/api/token', authOptions)
    .then((response) => {
      if(response.status === 200) {
         response.json().then((data) => {
              res.json({data});
         });
      } else {
             res.json({"error":"Failed to refresh access token!"})
      };
    });
  })




module.exports = router;


//   // Route to fetch and display the user's top tracks
// router.get('/top-tracks', (req, res) => {
//   const limit = 10; // Adjust the limit as needed

//   // Fetch the user's top tracks using the Spotify API module
//   spotifyApi.getTopTracks(limit)
//     .then(data => {
//       const topTracks = data.body.items;
//       // Use topTracks data as needed (e.g., render a page or send as JSON)
//       res.json({ topTracks });
//     })
//     .catch(error => {
//       console.error('Error fetching top tracks:', error);
//       res.status(500).json({ error: 'Error fetching top tracks' });
//     });
// });
