const Reminder = require('../models/Reminder');
const helperFunctions = require ('../utils/helperFunctions');

const saveReminder = async ({command, ack, say}) => {
  try {
    await ack();
    const userId = command.user_id;
    const channelId = command.channel_id;
    const parsed = helperFunctions.parseReminderCommand(command.text);
    const newReminder = new Reminder({
        userId,
        channelId,
        reminderText: parsed.reminderText,
        triggerTime: parsed.epoch
    });

    await newReminder.save();
    await say('Reminder Created Successfully!');
  } catch (err) {
    await say(`Someting went went wrong! ${err.message}`);
  }
}

module.exports = {saveReminder};