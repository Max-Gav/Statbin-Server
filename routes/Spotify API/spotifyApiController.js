const { default: axios } = require("axios");

/* 
------------------------- 
-  Routes Declarations  - 
------------------------- 
*/
const fetchDataFromUrl = async (req,res) => {
  const accessToken = req.cookies["access-token"];

  // Check if the access token is present
  if (accessToken) {
    try {
      const urlParam = req.query.url;

      // Decode the URL parameter to retrieve the original URL
      const spotifyApiUrl = decodeURIComponent(urlParam);

      //Add the access token as a header in the request
      const fetchOptions = {
        method: "get",
        url:spotifyApiUrl,
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      };

      // Getting the data from Spotify's API
      const response = await axios(fetchOptions);

      if (response.status == 200) {
        res.status(200).json(response.data);
      } else {
        console.error(
          "Failed to fetch from Spotify:",
          response.statusText
        );
        res.status(response.status).json({
          error: "Failed to fetch from Spotify",
        });
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(403).json({ error: "No Access Token Found" });
  }
}


module.exports = {fetchDataFromUrl}