
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET all students
const getStudents = async (req, res) => {
  try {
    const users = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get Students Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students.",
    });
  }
};

// ADD student
const addStudent = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    if (role && role !== "student") {
      return res.status(400).json({
        success: false,
        message: "Only student accounts can be created here.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "A password with at least 6 characters is required.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Add Student Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create student.",
    });
  }
};

// UPDATE student
const updateStudent = async (req, res) => {
  try {
    const { name, email } = req.body;

    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const duplicate = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: student._id },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    student.name = name.trim();
    student.email = normalizedEmail;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      user: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("Update Student Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update student.",
    });
  }
};

// DELETE student
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Student Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete student.",
    });
  }
};

module.exports = {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
};
