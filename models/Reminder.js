// models/Reminder.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    userId: String,
    channelId: String,           // Slack channel ID (for DM or channel post)
    reminderText: String,
    triggerTime: Number,
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' } // or 'sent'
});

module.exports = mongoose.model('Reminder', reminderSchema);
