const express = require("express");
const path = require("path");
require("dotenv").config();

const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);

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
    cookie: { httpOnly: true }
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

app.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.redirect("/login");
});

app.use(authRoutes);
app.use(applicationRoutes);
app.use(adminRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running http://localhost:${port}`));
