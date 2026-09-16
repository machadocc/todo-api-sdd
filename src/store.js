const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

class TaskStore {
  constructor(filePath) {
    this.filePath = filePath;
    this._ensureFile();
  }

  _ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "[]", "utf8");
    }
  }

  _readAll() {
    const raw = fs.readFileSync(this.filePath, "utf8");
    return raw.trim() ? JSON.parse(raw) : [];
  }

  _writeAll(tasks) {
    const tmpPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(tasks, null, 2), "utf8");
    fs.renameSync(tmpPath, this.filePath);
  }

  list({ done } = {}) {
    const tasks = this._readAll();
    if (done === undefined) return tasks;
    return tasks.filter((t) => t.done === done);
  }

  get(id) {
    return this._readAll().find((t) => t.id === id) || null;
  }

  create({ title, description }) {
    const now = new Date().toISOString();
    const task = {
      id: randomUUID(),
      title,
      description: description || "",
      done: false,
      createdAt: now,
      updatedAt: now,
    };
    const tasks = this._readAll();
    tasks.push(task);
    this._writeAll(tasks);
    return task;
  }

  update(id, changes) {
    const tasks = this._readAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updated = {
      ...tasks[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = updated;
    this._writeAll(tasks);
    return updated;
  }

  delete(id) {
    const tasks = this._readAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    this._writeAll(tasks);
    return true;
  }
}

module.exports = { TaskStore };
