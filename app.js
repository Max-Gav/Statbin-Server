//Configuring the .env file in order to use it's stored values
require("dotenv").config();

//Importing required libraries in order to run the server properly
const express = require("express");
const cors = require('cors');

//Creating an express app
const app = express();

//Importing the routes
const userRoute = require('./routes/users');

//Running a file that connects to mongodb atlas
require("./db/mongoConnect");

//Middlewares
app.use(cors());
app.use(express.json());

//Connecting the routes with our app
app.get("/",(req,res)=>{res.json("hi")})
app.use("/users",userRoute);

//Getting the server's port and listening to it
const port = process.env.PORT || 3001;
app.listen(port);

