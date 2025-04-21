const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (to, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Welcome to the Platform!",
    html: `<h3>Hello ${name},</h3><p>Thanks for registering!</p>`,
  });
};

module.exports = { sendWelcomeEmail };
