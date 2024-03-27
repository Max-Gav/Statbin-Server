//Configuring the .env file in order to use it's stored values
require("dotenv").config();

//Importing required libraries in order to run the server properly
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");

//Creating an express app
const app = express();

//Importing the routes
const userRoute = require("./routes/Users/usersRoutes");
const authRoute = require("./routes/Authentication/authRoutes");
const spotifyApiRoute = require("./routes/Spotify API/spotifyApiRoutes");

//Streamimg history update scheduler
const scheduleDataUpdate = require("./streamingHistoryUpdateScheduler");

const pool = new Pool({
  connectionString: process.env.SQL_CONNECTION_STRING,
});

//Middlewares
app.use(express.static("public"));
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:3001"],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  req.db = pool;
  next();
});

app.get("/", (req, res) => {
  res.json("hi");
});
app.use("/users", userRoute);
app.use("/auth", authRoute);
app.use("/spotify-api", spotifyApiRoute);

// scheduleDataUpdate();

//Getting the server's port and listening to it
const port = process.env.PORT || 3001;
app.listen(port, () => {});
