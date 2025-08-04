const moment = require('moment-timezone');

const parseReminderCommand = (commandText) => {
    const [reminderTextRaw, dateTimeRaw] = commandText.split(',').map(s => s.trim());

    // Parse the date in IST timezone
    const istMoment = moment.tz(dateTimeRaw, "h:mm A DD/MM/YYYY", "Asia/Kolkata");
    if (!istMoment.isValid()) throw new Error("Invalid date/time format");

    const epochTime = istMoment.unix(); // in seconds

    return {
        reminderText: reminderTextRaw,
        epoch: epochTime,
        dateTime: istMoment.toISOString()
    };
}

function convertEpochToIST(epoch) {
  return moment.tz(epoch * 1000, 'Asia/Kolkata').format('h:mm A DD/MM/YYYY');
}

const parseUpdateReminderCommand = (commandText) => {
    const parts = commandText.split(',').map(p => p.trim());
    const reminderId = parts[0];
    const reminderText = parts[1] || '';
    const timeString = parts[2];

    // Parse the date in IST timezone
    const istMoment = moment.tz(timeString, "h:mm A DD/MM/YYYY", "Asia/Kolkata");
    if (!istMoment.isValid()) throw new Error("Invalid date/time format");

    const epochTime = istMoment.unix(); // in seconds

   const updateObject = { triggerTime: epochTime };
    if (reminderText) {
      updateObject.reminderText = reminderText;
    }

    return {
        reminderId,
        updateObject
    };
}

module.exports = {parseReminderCommand, convertEpochToIST, parseUpdateReminderCommand};
