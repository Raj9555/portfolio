require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const path = require("path");

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




/* ============ AI CHATBOT API ============ */
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.json({ reply: "Please ask something 🙂" });
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            max_tokens: 150,
            messages: [
                {
                    role: "system",
                    content: `
You are AI Udai, the official portfolio assistant of Udai Raj Pandey.

STRICT RULES:
- Only answer questions about Udai Raj Pandey
- Allowed topics: skills, projects, education, experience, contact through website
- Do NOT answer general questions
- Do NOT give coding help
- Do NOT give random knowledge
- Do NOT make up information

If question is unrelated, reply:
"I can only answer questions related to Udai's portfolio, skills, or projects."

Known Information:

Skills:
Machine Learning, Artificial Intelligence, Python, NLP, Computer Vision,
JavaScript, basic full-stack development, data analysis.

Projects:
1. Groundwater Condition Dashboard using ML
2. Mental Health Detection System using NLP
3. Live Digital Traffic Management System using ML

Tone:
Professional, short, recruiter-friendly.
`
                },
                {
                    role: "user",
                    content: userMessage,
                },
            ],
        });

        const reply = completion.choices[0].message.content;

        if (!reply) {
            return res.json({
                reply: "Please ask about my skills, projects, or experience."
            });
        }

        res.json({
            reply: reply,
        });

    } catch (error) {
        console.error("GROQ ERROR:", error.message);
        res.status(500).json({ reply: "⚠️ AI service unavailable" });
    }
});




/* ============ START SERVER ============ */
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
