const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

let transporter;

(async () => {
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("Ethereal test account created");
  console.log("Login:", testAccount.user);
  console.log("Password:", testAccount.pass);
})();


app.post("/generate-email", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192", 
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Groq response:", response.data);

    const emailText = response.data?.choices?.[0]?.message?.content;

    if (!emailText) {
      return res.status(500).json({ error: "No content returned from Groq." });
    }

    res.json({ email: emailText });
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate email" });
  }
});

app.post("/send-email", async (req, res) => {
  const { recipients, emailBody } = req.body;

  if (!recipients || !emailBody) {
    return res.status(400).json({ message: "Recipients and email body required" });
  }

  if (!transporter) {
    return res.status(500).json({ message: "Email transporter not ready yet" });
  }

  try {
    const info = await transporter.sendMail({
      from: "AI Sender <no-reply@example.com>",
      to: recipients.split(",").map((r) => r.trim()),
      subject: "AI Generated Email",
      text: emailBody,
    });

    console.log("Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.json({ message: "Email sent successfully!", previewUrl: nodemailer.getTestMessageUrl(info) });
  } catch (err) {
    console.error("Send email error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});