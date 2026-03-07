const User = require("../models/ContactModels");
const bcrypt = require("bcrypt");

const saltRounds = parseInt(process.env.SALT_ROUNDS);

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, planId, currency, planPrice } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      planId,
      currency,
      planPrice
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    req.session.userId = user._id;

    res.json({ message: "Login successful" });

  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {

  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });

};