const router = require("express").Router();
const User = require('../models/User.model')


router.get("/home", (req, res, next) => {
  User.find()   
  .then((allUsers) => {
    res.json(allUsers);
  })
  .catch((err) => res.json(err));
});

module.exports = router;
