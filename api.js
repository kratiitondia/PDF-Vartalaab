const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractText } = require('../utils/pdfParser');
const { HfInference } = require("@huggingface/inference");

// Initialize HuggingFace
const hf = new HfInference(process.env.HF_API_KEY);

// ===============================
// 📌 Multer Configuration
// ===============================
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// ===============================
// 📌 UPLOAD → Extract Text
// ===============================
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: 'No file uploaded' });

    const text = await extractText(req.file);

    res.json({
      text,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// 📌 Summarize (HuggingFace - BART)
// ===============================
router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text)
      return res.status(400).json({ error: 'No text provided' });

    const result = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: text.slice(0, 4000)
    });

    res.json({ summary: result.summary_text });

  } catch (error) {
    console.error("Summarize error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// 📌 Query Document (HF QA Model)
// ===============================
router.post('/query', async (req, res) => {
  try {
    const { text, query } = req.body;

    if (!text || !query)
      return res.status(400).json({ error: 'Text and query are required' });

    const answer = await hf.questionAnswering({
      model: "deepset/roberta-base-squad2",
      inputs: {
        question: query,
        context: text.slice(0, 15000)
      }
    });

    res.json({
      answer: answer.answer || "No clear answer found."
    });

  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// 📌 Export Router
// ===============================
module.exports = router;
