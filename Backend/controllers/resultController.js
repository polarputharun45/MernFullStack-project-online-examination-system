
const Result = require("../models/Result");

const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({
      student: req.user.userId,
    })
      .populate("exam", "title subject")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Get My Results Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch your results.",
    });
  }
};

const getResults = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const results = await Result.find()
      .populate("student", "name email")
      .populate("exam", "title subject")
      .sort({ createdAt: -1 });

    const passed = results.filter(
      (result) => result.status === "Passed"
    ).length;

    res.status(200).json({
      success: true,
      statistics: {
        totalAttempts: results.length,
        passed,
        failed: results.length - passed,
      },
      results,
    });
  } catch (error) {
    console.error("Get Results Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch results.",
    });
  }
};

const deleteResult = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Result deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Result Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete result.",
    });
  }
};

module.exports = {
  getMyResults,
  getResults,
  deleteResult,
};
