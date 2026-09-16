const path = require("path");
const express = require("express");
const { TaskStore } = require("./store");
const { createTasksRouter } = require("./routes/tasks");

function createApp({ dataFile }) {
  const app = express();
  app.use(express.json());

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  const store = new TaskStore(dataFile);
  app.use("/tasks", createTasksRouter(store));

  app.use(express.static(path.join(__dirname, "..", "public")));

  return app;
}

module.exports = { createApp };
