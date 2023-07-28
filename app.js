//ACCESS TO ENVIRONMENT VARIABLES-----------------------------------------------------------------------------------

require("dotenv").config();

//DATABASE----------------------------------------------------------------------------------------------------------

require("./db");

//EXPRESS FRAMEWORK FOR NODE JS WHICH HANDLES THE HTTP FUNCTIONS----------------------------------------------------

const express = require("express");

const app = express();

//MIDDLEWARE FUNCTIONS-----------------------------------------------------------------------------------------------

const { isAuthenticated } = require("./middleware/jwt.middleware")

//CONFIG FUNCTIONS---------------------------------------------------------------------------------------------------

require("./config")(app);

// ROUTE HANDLING FUNCTIONS------------------------------------------------------------------------------------------

const authRouter = require("./routes/auth.routes") 
app.use("/", authRouter)

//const passwordRouter = require('./routes/password.routes')
//app.use('/', passwordRouter)

const indexRoutes = require("./routes/index.routes");
app.use("/",isAuthenticated, indexRoutes);

const gameRoutes = require("./routes/game.routes");
app.use("/",isAuthenticated, gameRoutes);

const accountRoutes = require('./routes/account.routes')
app.use('/', isAuthenticated, accountRoutes);


//ERROR HANDLING FUNCTIONS-------------------------------------------------------------------------------------------

require("./error-handling")(app);

module.exports = app;
