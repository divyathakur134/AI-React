import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import OpenAI  from "openai";



const app = express();

//Security Middleware

app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after some time"
})
app.use(limiter);

app.use(express.json({ limit: "10mb" }));

const client = new OpenAI();

const response = await client.responses.create({
   apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-5-nano",
    input: "Write a one-sentence bedtime story about a unicorn."
});

// Code explanation endpoint
app.post("/api/explain-code", async (req, res) => {
    try {
    const { code, language } = req.body;

        if (!code) {
        return res.status(400).json({ error: "Code is required" })
        }

        const messages = [
      {
        role: "user",
        content: `Please explain this ${
          language || ""
        } code in simple terms:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``,
      },
    ];

    const response = await client.responses.create({
    model: "gpt-5",
    messages,
    temperature:0.3,
    max_tokens: 800,
});

    const explanation = response?.choices[0]?.message?.content;
    if (!explanation) {
      return res.status(500).json({ error: "Failed to explain code" });
    }

    res.json({ explanation, language: language || "unknown" });

    } catch(err){
       console.error("Code explain api error:",err);
       res.status(500).json({error: "Server error", details: err.message});
    }
})

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Enhanced API server listening on http://localhost:${PORT}`);
});
