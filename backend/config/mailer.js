const nodemailer = require("nodemailer");

let mailer = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function deliverOtp(email, otp) {
  if (!mailer) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[LOCAL DEVELOPMENT] OTP for ${email}: ${otp}`);
      return;
    }

    throw new Error("SMTP is not configured in production.");
  }

  await mailer.sendMail({
    from: {
      name: "Connectly",
      address: process.env.SMTP_USER,
    },
    to: email,
    subject: "Your Connectly verification code",
    text: `Your Connectly OTP is ${otp}. It expires in 10 minutes.`,
  });
}

module.exports = { deliverOtp };