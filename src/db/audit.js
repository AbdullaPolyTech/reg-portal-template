const db = require("./database");

const insertAuditLog = db.prepare(`
  INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (?, ?, ?, ?, ?)
`);

const serializeMetadata = (metadata) => {
  if (!metadata) return null;
  return JSON.stringify(metadata);
};

const logAudit = ({ actorUserId = null, action, entityType, entityId = null, metadata = null }) => {
  if (!action || !entityType) {
    throw new Error("Audit log requires action and entityType.");
  }

  insertAuditLog.run(actorUserId, action, entityType, entityId, serializeMetadata(metadata));
};

module.exports = { logAudit };