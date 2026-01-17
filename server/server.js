import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import OpenAI from "openai";

/* ----------------------------------
   Validate Environment Variables
----------------------------------- */
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is missing");
  process.exit(1);
}

/* ----------------------------------
   Initialize App & OpenAI Client
----------------------------------- */
const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ----------------------------------
   Security Middleware
----------------------------------- */
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));

/* ----------------------------------
   Health Check
----------------------------------- */
app.get("/health", (_, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

/* ----------------------------------
   Explain Code API endpoint
----------------------------------- */
app.post("/api/explain-code", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const prompt = `
Explain the following ${language || ""} code in simple terms:

\`\`\`${language || ""}
${code}
\`\`\`
`;

    const response = await openai.responses.create({
      model: "gpt-5",
      input: prompt,
      max_output_tokens: 800,
    });

    const explanation =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text;

    if (!explanation) {
      return res.status(500).json({ error: "Failed to generate explanation" });
    }

    res.json({
      explanation,
      language: language || "unknown",
    });
  } catch (error) {
    console.error(" Explain Code API Error:", error);
    res.status(500).json({
      error: "Server error",
      message: error.message,
    });
  }
});

/* ----------------------------------
   Start Server
----------------------------------- */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
