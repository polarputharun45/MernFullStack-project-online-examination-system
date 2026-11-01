
const express = require("express");

const {
  saveBankQuestions,
  getBankQuestions,
  approveBankQuestion,
  updateBankQuestion,
  deleteBankQuestion,
} = require("../controllers/questionBankController");

const router = express.Router();

router.post("/", saveBankQuestions);

router.get("/", getBankQuestions);

router.patch("/:id/approve", approveBankQuestion);

router.put("/:id", updateBankQuestion);

router.delete("/:id", deleteBankQuestion);

module.exports = router;
