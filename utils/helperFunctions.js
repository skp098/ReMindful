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

module.exports = {parseReminderCommand};
