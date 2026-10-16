const mongoose = require("mongoose");

const aiResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("AiResponse", aiResponseSchema);