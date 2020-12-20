const express = require("express");
const bodyParser = require("body-parser");


// create express app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// parse application/json
app.use(bodyParser.json());


// define a simple route
app.get("/", (req, res) => {
  return res.json({
    message: "Welcome to kolo's Backend 😁",
    connected: true
  });
});

const mongoose = require("mongoose");
const dbConfig = require("../database/database.config.js");

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

// listen for requests

//api routes
require("../app/routes/user.routes.js")(app);

app.listen(process.env.PORT||3000);
