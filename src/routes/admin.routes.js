const express = require("express");
const db = require("../db/database");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/admin/applications", requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, u.full_name, u.email
    FROM applications a
    JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
  `).all();

  res.render("admin/applications", { applications: rows });
});

router.get("/admin/applications/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare(`
    SELECT a.*, u.full_name, u.email
    FROM applications a
    JOIN users u ON u.id = a.user_id
    WHERE a.id = ?
  `).get(id);

  if (!row) return res.status(404).send("Not found");
  res.render("admin/application_detail", { application: row });
});

router.post("/admin/applications/:id/status", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { status, admin_note } = req.body;

  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return res.status(400).send("Invalid status");
  }

  db.prepare("UPDATE applications SET status = ?, admin_note = ? WHERE id = ?")
    .run(status, admin_note || null, id);

  res.redirect(`/admin/applications/${id}`);
});

module.exports = router;
