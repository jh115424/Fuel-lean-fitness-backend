const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an experienced fitness coach and certified nutritionist specializing in macro-based nutrition and strength training. You give practical, science-backed advice tailored to each user's specific goals. Keep your responses clear, concise, and motivating. Always structure your answers in an easy to read format using line breaks between sections.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    res.status(200).json({ response: aiResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/stream", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful fitness and nutrition assistant for the Fuel Lean Fitness app.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        res.write(`data: ${text}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const AiResponse = require("../models/AiResponse");

router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await AiResponse.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
