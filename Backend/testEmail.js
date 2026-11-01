
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function verifyEmail() {
  try {
    await transporter.verify();

    console.log("SUCCESS: Email server authentication verified!");
    console.log("Sender:", process.env.EMAIL_USER);
  } catch (error) {
    console.error("EMAIL VERIFICATION FAILED!");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
  }
}

verifyEmail();
