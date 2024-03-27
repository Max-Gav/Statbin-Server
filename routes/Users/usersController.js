//Imports
const axios = require("axios");

/* 
------------------------- 
-  Routes Declarations  - 
------------------------- 
*/

const createUser = async (req, res) => {
    if (req.query.accessToken) {
      let client;
      try {
        //Fetch user information from spotify
        const { data } = await axios({
          method: "get",
          url: `https://api.spotify.com/v1/me`,
          headers: {
            Authorization: "Bearer " + req.query.accessToken,
          },
        });
  
        // Get a connection from the pool
        client = await req.db.connect(); 
  
        //Query Setup 
        const insertUserQuery =
          "INSERT INTO statbin.users (spotify_id, spotify_email, username, last_streaming_update) VALUES ($1, $2, $3, $4)";
        const insertUserValues = [data.id, data.email, data.display_name, 0];
  
        //Query Execution
        const result = await client.query(insertUserQuery, insertUserValues);
        res.status(201).json(result);
      } catch(err){
          res.status(402).json({ err: "User can't be created: user already exists" });
      } finally {
        if (client) {
          client.release(); 
        }
      }
    } else {
      res.status(403).json({ err: "User can't be created: no access token" });
    }
  }

 const getUserInfo = async (req, res) => {
    req.query.userId = 10
    if (req.query.userId) {
      let client;
      try {
        //Fetch user information from spotify
        const { data } = await axios({
          method: "get",
          url: `https://api.spotify.com/v1/me`,
          headers: {
            Authorization: "Bearer " + req.query.accessToken,
          },
        });
  
        // Get a connection from the pool
        client = await req.db.connect(); 
  
        //Query Setup 
        const insertUserQuery =
          "SELECT  statbin.users (spotify_id, spotify_email, username) VALUES ($1, $2, $3)";
        const insertUserValues = [data.id, data.email, data.display_name];
  
        //Query Execution
        const result = await client.query(insertUserQuery, insertUserValues);
        res.status(201).json(result);
      } catch(err){
  
      } finally {
        if (client) {
          // Release the connection back
          client.release(); 
        }
      }
      res.status(402).json({ err: "User can't be created: user already exists" });
    } else {
      res.status(402).json({ err: "User can't be created: no access token" });
    }
  }

module.exports = {createUser, getUserInfo}