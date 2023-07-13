// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

const { isAuthenticated } = require("./middleware/jwt.middleware")

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here


const authRouter = require("./routes/auth.routes") 
app.use("/", authRouter)

const indexRoutes = require("./routes/index.routes");
app.use("/",isAuthenticated, indexRoutes);

const gameRoutes = require("./routes/game.routes");
app.use("/",isAuthenticated, gameRoutes);

//const gameRouter = require("./routes/game.routes")
//app.use("/", isAuthenticated, gameRouter)


// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
