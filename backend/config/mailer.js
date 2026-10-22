
async function deliverOtp(email, otp) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Connectly <onboarding@resend.dev>",
      to: [email],
      subject: "Your Connectly verification code",
      text: `Your Connectly OTP is ${otp}. It expires in 10 minutes.`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Resend email failed:", response.status, error);
    throw new Error("Could not send verification email.");
  }

  const result = await response.json();
  console.log("OTP email accepted by Resend:", result.id);
}

module.exports = { deliverOtp };
