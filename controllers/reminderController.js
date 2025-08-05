const Reminder = require('../models/Reminder');
const helperFunctions = require ('../utils/helperFunctions');
const moment = require('moment-timezone');

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

const startReminderScheduler = async (app) => {
      const nowIST = moment().tz('Asia/Kolkata');
      // Calculate start & end of the day (in minutes)
      const startOfDayIST = moment.tz(nowIST.format('YYYY-MM-DD 00:00'), 'Asia/Kolkata').valueOf() / 1000;
      const endOfDayIST = moment.tz(nowIST.format('YYYY-MM-DD 23:59'), 'Asia/Kolkata').valueOf() / 1000;

      // Current time in epoch minutes
      const currentEpochMinutes = Math.floor(
        moment().tz("Asia/Kolkata").seconds(0).milliseconds(0).valueOf() / 1000
      );

      // Fetch reminders for today's IST date
      const reminders = await Reminder.find({
        status: 'pending',
        triggerTime: { $gte: startOfDayIST, $lte: endOfDayIST }
      }).lean();

      for (const reminder of reminders) {
        try {
          // Send reminder only if it's exactly the current IST minute
          if (reminder.triggerTime === currentEpochMinutes) {

            await app.client.chat.postMessage({
              channel: reminder.channelId,
              text: `🔔 Hey <@${reminder.userId}>, ${reminder.reminderText}`,
            });

            await Reminder.updateOne(
              { _id: reminder._id },
              { $set: { status: 'sent' } }
            );
          }
        } catch (innerErr) {
          console.error(`Failed to send reminder ${reminder._id}:`, innerErr);
        }
      }
}

module.exports = {saveReminder, getReminders, updateReminders, deleteReminder, startReminderScheduler};