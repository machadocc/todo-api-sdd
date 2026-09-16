const express = require("express");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function createTasksRouter(store) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const { done } = req.query;
    let filter = {};
    if (done === "true") filter = { done: true };
    else if (done === "false") filter = { done: false };
    res.json(store.list(filter));
  });

  router.get("/:id", (req, res) => {
    const task = store.get(req.params.id);
    if (!task) return res.status(404).json({ error: "tarefa não encontrada" });
    res.json(task);
  });

  router.post("/", (req, res) => {
    const { title, description } = req.body || {};
    if (!isNonEmptyString(title)) {
      return res.status(400).json({ error: "title é obrigatório" });
    }
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ error: "description deve ser texto" });
    }
    const task = store.create({ title: title.trim(), description });
    res.status(201).json(task);
  });

  router.patch("/:id", (req, res) => {
    const existing = store.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "tarefa não encontrada" });

    const { title, description, done } = req.body || {};
    const changes = {};

    if (title !== undefined) {
      if (!isNonEmptyString(title)) {
        return res.status(400).json({ error: "title não pode ser vazio" });
      }
      changes.title = title.trim();
    }
    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({ error: "description deve ser texto" });
      }
      changes.description = description;
    }
    if (done !== undefined) {
      if (typeof done !== "boolean") {
        return res.status(400).json({ error: "done deve ser booleano" });
      }
      changes.done = done;
    }

    res.json(store.update(req.params.id, changes));
  });

  router.delete("/:id", (req, res) => {
    const deleted = store.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "tarefa não encontrada" });
    res.status(204).send();
  });

  return router;
}

module.exports = { createTasksRouter };
