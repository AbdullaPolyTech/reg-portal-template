const express = require("express");
const db = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const appRow = db
    .prepare("SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1")
    .get(userId);

  res.render("app/dashboard", { application: appRow || null });
});

router.get("/apply", requireAuth, (req, res) => {
  res.render("app/apply");
});

router.post("/apply", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const { organization, phone, message } = req.body;

  // Optional: allow only one active application; keep it simple for now: create a new one
  db.prepare(
    "INSERT INTO applications (user_id, organization, phone, message, status) VALUES (?, ?, ?, ?, 'PENDING')"
  ).run(userId, organization || null, phone || null, message || null);

  res.redirect("/dashboard");
});

module.exports = router;
