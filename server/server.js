require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const path = require("path");
const { Resend } = require("resend");   // ✅ added

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* ============ SERVE FRONTEND ============ */
app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

/* ============ GROQ AI SETUP ============ */
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/* ============ RESEND SETUP ============ */
const resend = new Resend(process.env.RESEND_API_KEY);

/* ============ AI CHATBOT API ============ */
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.json({ reply: "Please ask something 🙂" });
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `You are AI Udai... (unchanged)`
                },
                {
                    role: "user",
                    content: userMessage,
                },
            ],
        });

        res.json({
            reply: completion.choices[0].message.content,
        });

    } catch (error) {
        console.error("GROQ ERROR:", error.message);
        res.status(500).json({ reply: "⚠️ AI service unavailable" });
    }
});


/* ============ CONTACT FORM API (UPDATED) ============ */
app.post("/send", async (req, res) => {
    const { name, email, message } = req.body;

    try {

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: process.env.RECEIVER_EMAIL,
            subject: `New message from ${name}`,
            text: `
Name: ${name}
Email: ${email}

Message:
${message}
            `,
        });

        res.json({ message: "Message sent successfully!" });

    } catch (error) {
        console.error("MAIL ERROR:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});


/* ============ START SERVER ============ */
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
