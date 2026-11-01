
const express = require("express");

const {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getStudents);
router.post("/", addStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
