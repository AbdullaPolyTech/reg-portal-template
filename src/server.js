const express = require("express");
const path = require("path");
require("dotenv").config();

const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const crypto = require("crypto");
// CSRF protection is implemented manually with session based synchronizer tokens
// same pattern as csurf but without extra dependency

const authRoutes = require("./routes/auth.routes");
const applicationRoutes = require("./routes/application.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new SQLiteStore({ db: "sessions.db", dir: "./data" }),
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);

// Make user visible in EJS
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Flash messages (one-time)
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

// --------------------
// CSRF Protection
// --------------------

app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

app.use((req, res, next) => {
  const csrfUnsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
  if (!csrfUnsafeMethods.has(req.method)) return next();
  if (req.body?._csrf === req.session.csrfToken) return next();
  req.session.flash = { type: "danger", message: "Invalid CSRF token. Please try again." };
  res.redirect(req.get("referer") || "/");
});

app.get("/", (req, res) => {
    res.render("home", { title: "Welcome" });
});

app.use(authRoutes);
app.use(applicationRoutes);
app.use(adminRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running http://localhost:${port}`));
