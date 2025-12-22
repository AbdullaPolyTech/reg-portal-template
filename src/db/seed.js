const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("./database");

async function seed() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  const email = "admin@local.test";
  const fullName = "System Admin";
  const password = "Admin123!"; // change after first run
  const passwordHash = await bcrypt.hash(password, 12);

  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (!exists) {
    db.prepare(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'ADMIN')"
    ).run(fullName, email, passwordHash);
    console.log("✅ Seeded admin:", email, "password:", password);
  } else {
    console.log("ℹ️ Admin already exists:", email);
  }

  console.log("✅ Database ready.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
