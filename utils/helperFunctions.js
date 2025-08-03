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

module.exports = {parseReminderCommand, convertEpochToIST};
