const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contactController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/contacts", isAuthenticated, contactController.getAllContacts);
router.get("/contacts/:id", contactController.getContact);
router.delete("/contacts/:id", contactController.deleteContact);

module.exports = router;
