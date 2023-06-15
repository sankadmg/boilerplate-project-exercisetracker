const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
// const client = new MongoClient(process.env.MONGO_URI);
// const db = client.db("urlShortner");
// const urls = db.collection("urls");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// new Date().toDateString();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

const ExerciseSchema = new Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});

const Exercise = mongoose.model("Exercise", ExerciseSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  const { description, duration, date } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      res.send("Could not found user");
    } else {
      const exerciseObj = new Exercise({
        user_id: user._id,
        description,
        duration,
        date: date ? new Date(date) : new Date(),
      });
      const exercise = await exerciseObj.save();
      res.json({
        user: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString(),
        _id: user._id,
      });
    }
  } catch (error) {
    res.send("There was an error saving the exersice");
    console.log(error);
  }
});

app.get("/api/users", async function (req, res) {
  const users = await User.find({}).select("_id username");
  if (!users) {
    res.send("No users");
  } else {
    res.json(users);
  }
});

app.post("/api/users", async function (req, res) {
  console.log(req.body);
  const userObj = new User({
    username: req.body.username,
  });
  try {
    const user = await userObj.save();
    console.log(user);
    res.json(user);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/users/:_id/logs", async function (req, res) {
  const { from, to, limit } = req.query;
  const id = req.params._id;
  const user = await User.findById(id);
  if (!user) {
    res.send("Could not find user");
  }
  let dataObj = {};
  if (from) {
    dataObj[`$gte`] = new Date(from);
  }
  if (to) {
    dataObj[`$lte`] = new Date();
  }
  let filter = {
    user_id: id,
  };
  if (from || to) {
    filter.date = dataObj;
  }
  const exercise = await Exercise.find(filter).limit(+limit ?? 500);
  const log = exercise.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString(),
  }));
  res.json({
    username: user.username,
    count: exercise.length,
    _id: user._id,
    log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
