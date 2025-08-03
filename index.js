require('dotenv').config();
const { App } = require('@slack/bolt');
const reminderController = require('./controllers/reminderController');
const connectDB = require('./utils/db');
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
  // Start the app
  await connectDB();
  await app.start(process.env.PORT || 3000);

  app.command('/remindme-add', reminderController.saveReminder);
  app.command('/remindme-view', reminderController.getReminders);

  console.log('ReMindful app is running!');
})();