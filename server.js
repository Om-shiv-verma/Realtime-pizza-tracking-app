require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const expresslayout = require("express-ejs-layouts");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoStore = require("connect-mongo");
const passport = require('passport')
//database connection
const url = "mongodb://0.0.0.0:27017/pizza";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

mongoose.connection
  .once("open", () => {
    console.log("Database connected.......");
  })
  .on("error", (err) => {
    console.log("connection failed....");
  });

 
// session store
let mongoStore = new MongoStore({
  mongoUrl: url,
  collection: 'sessions'
})

// Session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }//24 hours
  })
);

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

//assets
app.use(express.static("public"));
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Global middleware
app.use((req, res, next)=>{
  res.locals.session = req.session
  res.locals.user = req.user
  next()
})
//set Template engine
app.use(expresslayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

//routes
require("./routes/web")(app);

app.listen(PORT, () => {
  console.log(`Listening on port  ${PORT}`);
});
