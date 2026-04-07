import mongoose from 'mongoose';

// Mesajın necə görünəcəyini təyin edirik
const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ad mütləqdir"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email mütləqdir"],
    trim: true,
    lowercase: true
  },
  text: {
    type: String,
    required: [true, "Mesaj boş ola bilməz"],
    minlength: [5, "Mesaj ən azı 5 simvol olmalıdır"]
  },
  createdAt: {
    type: Date,
    default: Date.now // Mesajın gəlmə vaxtını qeyd etmə
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;