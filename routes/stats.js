const express = require('express');
const router = express.Router();
const queryString = require('querystring');
const spotifyApi = require('../spotifyApi'); 

// Your Spotify Developer credentials
const CLIENT_ID = '31f171635d3846a795cbd01e899854eb';
const CLIENT_SECRET = 'e11de89baab841edbe182022daa78310';
const REDIRECT_URI = 'http://localhost:3001/stats/auth-callback'; 


let stateKey = 'spotify_auth_state';

const generateRandomString = function(length){
  let text ='';
  const possible = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';

  for(let i=0; i<length; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


router.get('/login', (req, res) => {
  let state = generateRandomString(16);
  res.cookie(stateKey, state);
  const scopes = 'user-read-private user-read-email'; 

  // Generate the Spotify authorization URL
  const queryParams = queryString.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI,
    state: state
  });

  const authorizeUrl = `https://accounts.spotify.com/authorize?${queryParams}`;

  // Redirect the user to Spotify's authorization page
  res.redirect(authorizeUrl);
});

// Route to handle Spotify callback and exchange code for access token
router.get('/auth-callback', async (req, res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if(state === null || state !== storedState) {
      res.redirect('/#' + 
      queryString.stringify({
        error: 'state_mismatch'
      }));
    } else {
        res.clearCookie(stateKey);

        const authOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
          },
          body: `code=${code}&redirect_uri=${REDIRECT_URI}&grant_type=authorization_code`,
          json:true
        };

        fetch('https://accounts.spotify.com/api/token', authOptions)
        .then((response) => {
          if(response.status === 200) {
             response.json().then((data) => {
                  console.log('Access Token:', data.access_token);
                  console.log('Refresh Token:', data.refresh_token);
                   res.json({success: true});
             });
          } else {
                 res.json({error : 'invalid token'})
          };
        });
    };
  });



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
