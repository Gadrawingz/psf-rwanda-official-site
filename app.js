// Main imports and definition
require("dotenv").config();
const helmet = require("helmet");
const express = require("express");
const session = require("express-session");
const eLayout = require("express-ejs-layouts");
const cors = require("cors");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();

const PORT = 5005 || process.env.PORT;

// Setting up custom default layout
app.set("layout", "./layouts/LClients");
app.set("view engine", "ejs");

// Enabling express-session and flash
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.urlencoded({ extended: true}))
app.use(
  session({
    secret: "psf-secret1",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 21600000, // 6hrs
    },
  }),
);

app.use(methodOverride("_method"));
// Middleware for handling file uploads
app.use(fileUpload());

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    referrerPolicy: { policy: "no-referrer" },
  }),
);

//app.use(express.static('public/'));
app.use(eLayout);

//000000000000000000000000
// Serve static files from the 'public' directory
app.use(express.static("public"));
// Serve files uploaded to the 'uploads' directory
app.use("/uploads", express.static("uploads"));
//000000000000000000000000

// Middleware f(x) to check and set default session data across the pages
app.use((req, res, next) => {
  if (!req.session.in_user) {
    // To check if user is logged in, if not, set default values
    req.session.in_user = {
      loggedin: false,
      role: "visitor",
      user_id: 0,
      username: "Guest",
      firstname: "",
      lastname: "",
    };
  }
  // Passing control to the next middleware or route handler
  next();
});

// Routes
// For clients
app.use("/", require("./server/routes/clients"));
app.use("/view/", require("./server/routes/clients-view"));

// For admin Panel
app.use("/panel", require("./server/routes/access"));
app.use("/quitus", require("./server/routes/quitus"));
app.use("/posts", require("./server/routes/posts"));
app.use("/publica", require("./server/routes/publica"));
app.use("/gallery", require("./server/routes/gallery"));
app.use("/messages", require("./server/routes/messages"));
app.use("/events", require("./server/routes/events"));
app.use("/documents", require("./server/routes/documents"));
app.use("/companies", require("./code/routes/companyRoutes"));
app.use("/api", require("./code/routes/locationRoutes"));
app.use("/dummy-api", require("./code/routes/registration"));

const companyController = require("./code/controllers/companyController");
// Company CRUD routes
// Company CRUD routes (mounted at root level for 2-level paths)
app.get("/company-edit/:id", companyController.edit);
app.post("/company-update/:id", companyController.update);

// Memberships:
app.use("/business-sectors", require("./code/routes/businessSectorRoutes"));
app.use("/api/associations", require("./code/routes/associationRoutes"));

// Quitus route imports
const quitusRoutes = require("./code/routes/quitusRoutes");
app.use("/api/quitus", quitusRoutes);

// Import route modules
const applicantRoutes = require("./code/routes/applicant");
const adminRoutes = require("./code/routes/admin");
const rraIntegrationRoutes = require("./code/routes/rraIntegrationRoutes");

// Use route modules
app.use("/applicants", applicantRoutes);
app.use("/app-admin", adminRoutes);
app.use("/gateway", rraIntegrationRoutes);

app.use("/umwiherero", require("./server/routes/umwiherero"));

// Redirect any URL that doesn't exist to the 404 page.
app.get("*", function (req, res) {
  res.redirect("/view/error/404");
});

// Running
app.listen(PORT, () => {
  console.log(`Just listening on port ${PORT}`);
});
