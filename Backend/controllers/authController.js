
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// ================= GMAIL TRANSPORTER =================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ================= REGISTER =================

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required.",
      });
    }

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ================= LOGIN =================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
  let user;

  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    const message =
      "If an account exists with this email, a password reset link has been sent.";

    if (!user) {
      return res.status(200).json({
        success: true,
        message,
      });
    }

    // Generate secure reset token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiryDate = new Date(Date.now() + 15 * 60 * 1000);

    // Update only reset-related fields.
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expiryDate,
        },
      },
      { runValidators: false }
    );

    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      throw new Error("CLIENT_URL is missing from environment variables.");
    }

    const resetUrl =
      `${clientUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

    // Send password reset email.
    try {
      const mailInfo = await transporter.sendMail({
        from: `"ExamPro" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "ExamPro - Password Reset",

        text: `Hello ${user.name},

We received a request to reset your ExamPro password.

Open this link to create a new password:
${resetUrl}

This link expires in 15 minutes.

If you did not request this, please ignore this email.`,

        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>ExamPro Password Reset</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password.</p>

            <a href="${resetUrl}"
              style="display:inline-block;
              padding:12px 20px;
              background:#2563eb;
              color:white;
              text-decoration:none;
              border-radius:5px;">
              Reset Password
            </a>

            <p>This link expires in 15 minutes.</p>
            <p>If you did not request this, ignore this email.</p>
          </div>
        `,
      });

      console.log("PASSWORD RESET EMAIL ACCEPTED BY SMTP");
      console.log("Message ID:", mailInfo.messageId);
      console.log("Accepted recipients:", mailInfo.accepted);
      console.log("Rejected recipients:", mailInfo.rejected);

    } catch (mailError) {
      console.error("GMAIL SEND ERROR:", mailError);

      // Remove reset token if email sending fails.
      await User.updateOne(
        { _id: user._id },
        {
          $unset: {
            resetPasswordToken: "",
            resetPasswordExpires: "",
          },
        },
        { runValidators: false }
      );

      return res.status(500).json({
        success: false,
        message: "Unable to send password reset email.",
      });
    }

    return res.status(200).json({
      success: true,
      message,
    });

  } catch (error) {
    console.error("FORGOT PASSWORD CONTROLLER ERROR");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Clear token if a later operation failed.
    if (user) {
      try {
        await User.updateOne(
          { _id: user._id },
          {
            $unset: {
              resetPasswordToken: "",
              resetPasswordExpires: "",
            },
          },
          { runValidators: false }
        );
      } catch (cleanupError) {
        console.error("Token cleanup error:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request.",
    });
  }
};

// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update only password and reset-token fields.
    const result = await User.updateOne(
      {
        _id: user._id,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: "",
        },
      },
      { runValidators: false }
    );

    if (result.modifiedCount !== 1) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in.",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resetting password.",
    });
  }
};

// ================= EXPORT =================

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
