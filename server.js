require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { dispatchReminders } = require('./src/jobs/reminderDispatch');

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  setInterval(() => {
    dispatchReminders().catch((error) => console.error(`Reminder dispatch error: ${error.message}`));
  }, 60 * 1000);

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});