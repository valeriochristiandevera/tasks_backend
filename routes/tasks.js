const express = require("express");
const router = express.Router();
const { tasks: db } = require("../database");
const allowedPriorities = new Set(["low", "medium", "high"]);

router.get("/", (req, res) => {
  db.find({})
    .sort({ createdAt: -1 })
    .exec((err, tasks) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch tasks" });
      }
      res.json(tasks);
    });
});

router.get("/:id", (req, res) => {
  db.findOne({ _id: req.params.id }, (err, task) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  });
});

router.post("/", (req, res) => {
  const { title, priority } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (priority !== undefined && !allowedPriorities.has(priority)) {
    return res.status(400).json({ error: "Priority must be low, medium, or high" });
  }

  const newTask = {
    title: title.trim(),
    completed: false,
    priority: priority || "medium",
  };

  db.insert(newTask, (err, task) => {
    if (err) {
      return res.status(500).json({ error: "Failed to create task" });
    }
    res.status(201).json(task);
  });
});

router.put("/:id", (req, res) => {
  const { title, completed, priority } = req.body;
  const updates = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title must be a non-empty string" });
    }
    updates.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Completed must be true or false" });
    }
    updates.completed = completed;
  }

  if (priority !== undefined) {
    if (!allowedPriorities.has(priority)) {
      return res.status(400).json({ error: "Priority must be low, medium, or high" });
    }
    updates.priority = priority;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Provide at least one field to update" });
  }

  db.update(
    { _id: req.params.id },
    { $set: updates },
    { returnUpdatedDocs: true },
    (err, numReplaced, updatedDoc) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update" });
      }
      if (numReplaced === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(updatedDoc);
    }
  );
});

router.delete("/:id", (req, res) => {
  db.remove({ _id: req.params.id }, {}, (err, numRemoved) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete" });
    }
    if (numRemoved === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted", _id: req.params.id });
  });
});

module.exports = router;
