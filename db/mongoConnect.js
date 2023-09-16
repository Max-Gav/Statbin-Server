const mongoose = require('mongoose');
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGO_DB);

    console.log("Connected to Spotistats Server");
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}