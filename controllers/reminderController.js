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

const getReminders = async ({command, ack, say}) => {
  try {
    await ack();
    const userId = command.user_id;
    const reminders = await Reminder.find({userId, status: command.text}).lean();
    let responseText = {blocks: []};
    for (i = 0; i < reminders.length; i++) {
      responseText.blocks.push(
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": `Reminder ${i+1} :alarm_clock: - ${reminders[i]._id.toString()}`,
            "emoji": true
          }
        }
      );
      responseText.blocks.push(
      {
        "type": "section",
        "fields": [
          {
            "type": "mrkdwn",
            "text": `*Reminder:*\n${reminders[i].reminderText}`
          },
          {
            "type": "mrkdwn",
            "text": `*Scheduled At:*\n${helperFunctions.convertEpochToIST(reminders[i].triggerTime)}`
          }
        ]
      }
      );
    }
    await say(responseText);
  } catch (err) {
    await say(`Someting went went wrong! ${err.message}`);
  }
}

const updateReminders = async ({command, ack, say}) => {
  try {
    await ack();
    const {reminderId, updateObject} = helperFunctions.parseUpdateReminderCommand(command.text);
    const updatedReminder = await Reminder.findByIdAndUpdate(
      reminderId,
      updateObject,
      { upsert: false }
    ).lean();

    if (!updatedReminder) {
      await say('Reminder not found.');
    }
    await say('Reminder updated successfully. :white_check_mark:');
  } catch (err) {
    await say(`Something went wrong while updating the reminder. ${err.message}`);
  }
}

const deleteReminder = async ({command, ack, say}) => {
  try {
    await ack();``
    await Reminder.deleteOne({_id: command.text});
    await say('Reminder Deleted Successfully!');
  } catch (err) {
    await say(`Someting went went wrong! ${err.message}`);
  }
}

module.exports = {saveReminder, getReminders, updateReminders, deleteReminder};