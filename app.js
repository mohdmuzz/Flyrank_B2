const express = require("express");
const swaggerUi = require("swagger-ui-express");
const Database = require("better-sqlite3");
const openapi = require("./openapi.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// SQLite stores tasks in tasks.db, so they remain after a server restart.
const db = new Database("tasks.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1))
  )
`);

const taskCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;

if (taskCount === 0) {
  const insertTask = db.prepare(
    "INSERT INTO tasks (title, done) VALUES (?, ?)"
  );

  const seedTasks = db.transaction(() => {
    insertTask.run("Learn REST APIs", 0);
    insertTask.run("Connect the API to SQLite", 0);
    insertTask.run("Read the assignment brief", 1);
  });

  seedTasks();
}

function formatTask(row) {
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done),
  };
}

app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/tasks", (req, res) => {
  const rows = db.prepare("SELECT id, title, done FROM tasks ORDER BY id").all();
  res.json(rows.map(formatTask));
});

app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT id, title, done FROM tasks WHERE id = ?").get(id);

  if (!row) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  return res.json(formatTask(row));
});

app.post("/tasks", (req, res) => {
  const { title } = req.body || {};

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title must be a non-empty string" });
  }

  const result = db
    .prepare("INSERT INTO tasks (title, done) VALUES (?, 0)")
    .run(title.trim());

  const created = db
    .prepare("SELECT id, title, done FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);

  return res.status(201).json(formatTask(created));
});

app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db
    .prepare("SELECT id, title, done FROM tasks WHERE id = ?")
    .get(id);

  if (!existing) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  const body = req.body || {};
  const hasTitle = Object.prototype.hasOwnProperty.call(body, "title");
  const hasDone = Object.prototype.hasOwnProperty.call(body, "done");

  if (!hasTitle && !hasDone) {
    return res.status(400).json({ error: "Provide title and/or done to update" });
  }

  if (hasTitle && (typeof body.title !== "string" || body.title.trim() === "")) {
    return res.status(400).json({ error: "title must be a non-empty string" });
  }

  if (hasDone && typeof body.done !== "boolean") {
    return res.status(400).json({ error: "done must be true or false" });
  }

  const title = hasTitle ? body.title.trim() : existing.title;
  const done = hasDone ? Number(body.done) : existing.done;

  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(
    title,
    done,
    id
  );

  const updated = db
    .prepare("SELECT id, title, done FROM tasks WHERE id = ?")
    .get(id);

  return res.json(formatTask(updated));
});

app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  return res.status(204).send();
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

app.listen(PORT, () => {
  console.log(`Task API running at http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
  console.log("SQLite database: tasks.db");
});

module.exports = app;
