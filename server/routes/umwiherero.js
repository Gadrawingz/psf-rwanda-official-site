// server/routes/umwiherero.js
const express = require("express");
const router = express.Router();
const con = require("../config/database");

// GET /umwiherero — render the standalone page (layout: false bypasses express-ejs-layouts)
router.get("/", (req, res) => {
  res.render("clients/umwiherero", { layout: false });
});

// POST /umwiherero/submit — receive idea JSON and insert into DB
// NOTE: do NOT add express.json() here — bodyParser.json() in app.js already handles it globally.
// Adding it again on the sub-router causes req.body to be silently swallowed (double-parse conflict).
router.post("/submit", (req, res) => {
  const {
    full_name,
    organisation,
    email,
    phone,
    role,
    panel,
    idea_type,
    idea_title,
    idea_body,
    expected_impact,
    priority,
    submitted_at,
  } = req.body;

  // Server-side validation — never trust the client alone
  if (
    !full_name ||
    !organisation ||
    !email ||
    !role ||
    !panel ||
    !idea_type ||
    !idea_title ||
    !idea_body ||
    !priority
  ) {
    return res
      .status(400)
      .json({ ok: false, message: "Missing one or more required fields." });
  }
  if (idea_body.trim().length < 30) {
    return res
      .status(400)
      .json({
        ok: false,
        message: "Idea description is too short (minimum 30 characters).",
      });
  }

  const sql = `
    INSERT INTO umwiherero_ideas
      (full_name, organisation, email, phone, role_at_retreat, panel_tag, idea_type, idea_title, idea_body, expected_impact, priority, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const vals = [
    full_name.trim(),
    organisation.trim(),
    email.trim(),
    phone ? phone.trim() : null,
    role,
    panel,
    idea_type,
    idea_title.trim(),
    idea_body.trim(),
    expected_impact ? expected_impact.trim() : null,
    priority,
    submitted_at ? new Date(submitted_at) : new Date(),
  ];

  con.query(sql, vals, (err, result) => {
    if (err) {
      // Log full error server-side, return safe message to client
      console.error(
        "[umwiherero] DB insert error:",
        err.code,
        err.sqlMessage || err.message,
      );
      return res
        .status(500)
        .json({
          ok: false,
          message: "Database error: " + (err.sqlMessage || err.message),
        });
    }
    console.log(
      "[umwiherero] Idea saved — ID:",
      result.insertId,
      "| From:",
      email,
    );
    res.json({ ok: true, idea_id: result.insertId });
  });
});

// GET /umwiherero/ideas — standalone viewer page (layout:false, code-gated)
router.get("/ideas", (req, res) => {
  res.render("clients/umwiherero-ideas", { layout: false });
});

// GET /umwiherero/ideas/data?code=XXX — returns ideas as JSON only if code matches
const ACCESS_CODE = process.env.UMWIHERERO_CODE || "PSF2026";
router.get("/ideas/data", (req, res) => {
  if ((req.query.code || "").trim() !== ACCESS_CODE) {
    return res.status(401).json({ ok: false, message: "Invalid access code." });
  }
  const sql = `
    SELECT idea_id, full_name, organisation, role_at_retreat, panel_tag,
           idea_type, idea_title, idea_body, expected_impact, priority, submitted_at
    FROM umwiherero_ideas
    ORDER BY submitted_at DESC
  `;
  con.query(sql, (err, rows) => {
    if (err) {
      console.error(
        "[umwiherero] ideas/data error:",
        err.sqlMessage || err.message,
      );
      return res
        .status(500)
        .json({ ok: false, message: err.sqlMessage || err.message });
    }
    res.json({ ok: true, total: rows.length, ideas: rows });
  });
});

module.exports = router;
