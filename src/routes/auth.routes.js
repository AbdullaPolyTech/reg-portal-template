const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db/database");

const router = express.Router();

router.get("/register", (req, res) => res.render("auth/register"));
router.get("/login", (req, res) => res.render("auth/login"));

router.post("/register", async (req, res) => {
  const full_name = (req.body.full_name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!full_name || !email || !password) {
    req.session.flash = { type: "danger", message: "Missing fields." };
    return res.redirect("/register");
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    req.session.flash = { type: "danger", message: "Email already in use." };
    return res.redirect("/register");
  }

  const password_hash = await bcrypt.hash(password, 12);

  const result = db
    .prepare("INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'USER')")
    .run(full_name, email, password_hash);

  req.session.user = { id: result.lastInsertRowid, full_name, email, role: "USER" };
  req.session.flash = { type: "success", message: "Account created successfully." };
  res.redirect("/dashboard");
});

router.post("/login", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    req.session.flash = { type: "danger", message: "Invalid email or password." };
    return res.redirect("/login");
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    req.session.flash = { type: "danger", message: "Invalid email or password." };
    return res.redirect("/login");
  }

  req.session.user = { id: user.id, full_name: user.full_name, email: user.email, role: user.role };

  if (user.role === "ADMIN") return res.redirect("/admin/applications");
  res.redirect("/dashboard");
});


router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;
