const express = require("express");
const { TaskStore } = require("./store");
const { createTasksRouter } = require("./routes/tasks");

function createApp({ dataFile }) {
  const app = express();
  app.use(express.json());

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  const store = new TaskStore(dataFile);
  app.use("/tasks", createTasksRouter(store));

  return app;
}

module.exports = { createApp };
