const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("./database.db");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Create tasks table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'pending'
    )`);
});

// Routes
app.get("/", (req, res) => {
  db.all("SELECT * FROM tasks", (err, tasks) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.render("index", { tasks });
  });
});

app.post("/add", (req, res) => {
  const { title } = req.body;
  if (!title.trim()) return res.redirect("/");

  db.run("INSERT INTO tasks (title) VALUES (?)", [title], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to add task");
    }
    res.redirect("/");
  });
});

app.post("/delete/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tasks WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to delete task");
    }
    res.redirect("/");
  });
});

app.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run("UPDATE tasks SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to update task");
    }
    res.redirect("/");
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
