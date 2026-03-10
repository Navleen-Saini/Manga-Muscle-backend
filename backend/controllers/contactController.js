const User = require("../models/ContactModels");

exports.getAllContacts = async (req, res, next) => {
  try {

    const users = await User.find().lean();

    res.render("contacts", {
      users,
      title: "Registered Users"
    });

  } catch (err) {
    next(err);
  }
};

exports.getContact = async (req, res, next) => {

  try {

    const user = await User.findById(req.params.id).lean();

    if (!user) return next();

    res.render("contact", {
      user,
      title: user.name
    });

  } catch (err) {
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {

  try {

    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) return next();

    res.json(deleted);

  } catch (err) {
    next(err);
  }
};
