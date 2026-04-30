import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  detailedDescription: { type: String }, // Modalda görünəcək uzun mətn
  stack: [{ type: String }], // Məsələn: ["React", "Node.js"]
  type: { type: String }, // Məsələn: "Full-Stack", "Frontend"
  githubLink: { type: String },
  liveLink: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', projectSchema);