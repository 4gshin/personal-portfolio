import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  detailedDescription: { type: String }, // Modalda gÃ¶rÃ¼nÉ™cÉ™k uzun mÉ™tn
  stack: [{ type: String }], // MÉ™sÉ™lÉ™n: ["React", "Node.js"]
  type: { type: String }, // MÉ™sÉ™lÉ™n: "Full-Stack", "Frontend"
  githubLink: { type: String },
  liveLink: { type: String },
  featured: { type: Boolean, default: false }, // Ana sÉ™hifÉ™dÉ™ gÃ¶stÉ™rilsinmi?
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', projectSchema);