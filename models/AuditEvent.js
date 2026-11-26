import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'project.create', 'project.update', 'project.delete', 'message.delete']
  },
  outcome: {
    type: String,
    required: true,
    enum: ['success', 'failure']
  },
  actor: String,
  targetId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now, immutable: true }
}, { versionKey: false });

export default mongoose.model('AuditEvent', auditEventSchema);
