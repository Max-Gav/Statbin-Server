// scheduler.js
const { default: axios } = require("axios");
const schedule = require("node-schedule");
const refresh_token =
  "AQA79JG7YiPanDE9Prgfmx6eROcEXk8V65r1MpMu8lPmk09rdVzCbeicwqYoJQHpGgTiG9abbcaODZief_YcXL20mjJ_VPrtt7BPYgS15Q2GI1Yho7i4WcaUquu6a0JXq7g";

  const getRefreshTokenAndUpdateTime = async () => {
    try {
      const response = await axios.get(`${process.env.BASE_URL}/get-refresh-token-and-update-time/${userId}`);
      return response.data; 
    } catch (error) {
      throw new Error("Error getting refresh token and update time: " + error.message);
    }
  };

  const getAccessToken = async () => {
    try {
      const response = await axios({
        method: "post",
        url: `${process.env.BASE_URL}/auth/refresh-access-token`,
        headers:{
          "client-type": "server",
          "Cookie": `refresh-token=${refresh_token}`
        }
      });
      return response.data.access_token;
    } catch (error) {
      throw new Error("Error obtaining access token: " + error.message);
    }
  };

  //Fetch recently played songs using access token
  const fetchRecentlyPlayedData = async (accessToken) => {
    try {
      console.log(accessToken);
      const response = await axios({
        method: "get",
        url: `${process.env.BASE_URL}/spotify-api/fetch?url=https%3A%2F%2Fapi.spotify.com%2Fv1%2Fme%2Fplayer%2Frecently-played%3Flimit%3D50`,
        headers:{
          "client-type": "server",
          "Cookie": `access-token=${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error("Error fetching recently played data: " + error.message);
    }
  };

const fetchStreamingDataAndSave = async () => {
  try {
    const accessToken = await getAccessToken();
    
    const lastPlayed = await fetchRecentlyPlayedData(accessToken)

    console.log(lastPlayed);
    console.log(lastPlayed.items[0]);
    console.log("Data fetched and saved successfully!");
  } catch (error) {
    console.error("Failed fetching and saving data:", error);
  }
};

const scheduleDataUpdate = () => {
  // Schedule the fetchDataAndSave function to run every hour (at minute 0)
  // const job = schedule.scheduleJob("0 * * * *", fetchHistoryDataAndSave);
  fetchStreamingDataAndSave();
};

module.exports = scheduleDataUpdate;
