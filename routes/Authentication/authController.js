/* 
----------------------------------------- 
-  External Libraries/Functions/Values  - 
----------------------------------------- 
*/
//Imports
const axios = require("axios");
const queryString = require("querystring");

//Time Constants in Miliseconds
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;

// Your Spotify Developer credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI_CLIENT = process.env.REDIRECT_URI_CLIENT;
const REDIRECT_URI_SERVER = process.env.REDIRECT_URI_SERVER;

const generateRandomString = (length) => {
  let text = "";
  const possible =
    " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const createUser = async (data) => {
  try {
    await axios.post(
      `${process.env.BASE_URL}/users/user-creation?accessToken=${data.access_token}`
    );
  } catch (err) {
    console.log(err);
  }
};

/* 
------------------------- 
-  Routes Declarations  - 
------------------------- 
*/
const isLoggedIn = (req, res) => {
  if (req.cookies["refresh-token"]) {
    res.json({ answer: true });
  } else {
    res.json({ answer: false });
  }
};

const loginToSpotify = (req, res) => {
  let state = generateRandomString(16);
  const scopes =
    "user-read-private user-read-email user-top-read user-read-recently-played";

  // Generate the Spotify authorization URL
  const queryParams = queryString.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI_SERVER,
    state: state,
  });

  const authorizeUrl = `https://accounts.spotify.com/authorize?${queryParams}`;

  // Return a link to redirect the user to Spotify's authorization page
  res.json({ authorizeUrl });
};

const connectCallback = async (req, res) => {
  let code = req.query.code || null;
  let state = req.query.state || null;

  // Redirecting to the client index page if authentication failed
  if (req.query.error) {
    console.log("Authentication failed");
    res.redirect(REDIRECT_URI_CLIENT + "?error=auth-failed");
  } else {
    // Authentication Options Object
    const authOptions = {
      method: "post",
      url: `https://accounts.spotify.com/api/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
      data: `code=${code}&redirect_uri=${REDIRECT_URI_SERVER}&grant_type=authorization_code`,
    };

    // Get the user access and refresh token
    try {
      const response = await axios(authOptions);

      if (response.status === 200) {
        const data = await response.data;

        // Statbin User Creation in SQL
        await createUser(data);

        // Save the new access token and refresh token in the cookies
        res.cookie("access-token", data.access_token, {
          httpOnly: true,
          maxAge: data.expires_in * SECOND,
        });

        res.cookie("refresh-token", data.refresh_token, {
          httpOnly: true,
          maxAge: DAY * 400,
        });

        res.redirect(REDIRECT_URI_CLIENT);
      } else {
        res.json(REDIRECT_URI_CLIENT);
      }
    } catch (error) {
      console.error("Error in authentication:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies["refresh-token"];
  const clientType = req.headers["client-type"];

  //Check if a refresh token is present is order to refresh the access token
  if (refreshToken) {
    //Return the access token expiry date if access token is present
    if (req.cookies["access-token"] && req.cookies["access-token-expiration"]) {
      const accessTokenExpiry = req.cookies["access-token-expiration"];
      res.status(201).json({ expires_in: accessTokenExpiry });
    }
    //Refresh the access token if no access token is present
    else {
      // Spotify Authentication Options Object
      const authOptions = {
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
        data: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      };

      // Getting a new access token using a refresh token from Spotify's API
      try {
        const response = await axios(authOptions);

        if (response.status === 200) {
          const data = response.data;

          if (clientType === "web") {
            // Store the access token in the cookies
            res.cookie("access-token", data.access_token, {
              httpOnly: true,
              maxAge: data.expires_in * SECOND,
              path: "/",
            });

            const oneHourFromNowUnix = Date.now() + 60 * 60 * 1000;

            // Store the access token expiration date in the cookies
            res.cookie("access-token-expiration", oneHourFromNowUnix, {
              httpOnly: true,
              maxAge: data.expires_in * SECOND,
              path: "/",
            });

            res.status(200).json({
              success: "Access token refreshed successfully",
              expires_in: oneHourFromNowUnix,
            });
          } else if (clientType === "server") {
            res.status(200).json({
              success: "Access token sent successfully",
              access_token: data.access_token,
            });
          }
        } else {
          res
            .status(response.status)
            .json({ error: "Failed to refresh access token!" });
        }
      } catch (error) {
        console.error("Error refreshing access token:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } else {
    res.status(401).json({ error: "No Refresh Token Found" });
  }
};

const disconnectFromSpotify = async (req, res) => {
  res.clearCookie("refresh-token", { path: "/" });
  res.clearCookie("access-token", { path: "/" });
  res.clearCookie("access-token-expiration", { path: "/" });
  res.status(200).json({ success: "Cookies cleared successfully" });
};

module.exports = {
  isLoggedIn,
  loginToSpotify,
  connectCallback,
  refreshAccessToken,
  disconnectFromSpotify,
};
