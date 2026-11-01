
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getMyResults,
  getResults,
  deleteResult,
} = require("../controllers/resultController");

const router = express.Router();

router.get("/mine", protect, getMyResults);
router.get("/", protect, getResults);
router.delete("/:id", protect, deleteResult);

module.exports = router;
