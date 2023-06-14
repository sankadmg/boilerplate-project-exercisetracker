const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);
// const db = client.db("urlShortner");
// const urls = db.collection("urls");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
