//Configuring the .env file in order to use it's stored values
require("dotenv").config();

//Importing required libraries in order to run the server properly
const express = require("express");
const path = require("path");
const cors = require('cors');
const cookieParser = require('cookie-parser');

//Creating an express app
const app = express();

//Importing the routes
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');

//Running a file that connects to mongodb atlas
require("./db/mongoConnect");

//Middlewares
app.use(cors({
    origin: 'http://localhost:5173', 
    optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
}));
app.use(express.json());
app.use(cookieParser());

    
//Connecting the routes with our app
app.get("/",(req,res)=>{res.json("hi")})
app.use("/users",userRoute);
app.use("/auth",authRoute);

//Getting the server's port and listening to it
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
});