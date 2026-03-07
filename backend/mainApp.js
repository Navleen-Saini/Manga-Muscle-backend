require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const session = require("express-session");
const MongoStore = require("connect-mongo");

const connectDB = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(express.static(path.join(__dirname, "Front-End")));

app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),

  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 3
  }
}));

app.use("/api", authRoutes);
app.use("/api", contactRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});