const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("./../middleware/jwt.middleware.js")
const router = express.Router();
const saltRounds = 10;
const User = require("../models/User.model")
const Token = require("../models/Token.model");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
//const Joi = require("joi");

router.post("/passwordresetemail", async (req, res) => {

  try {

    //const schema = Joi.object({ email: Joi.string().email().required() });
    //const { error } = schema.validate(req.body);
    //if (error) return res.status(400).send(error.details[0].message);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRegex.test(req.body.email)) {
      res.status(400).json({ message: 'Provide a valid email address.' });
      return;
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json({message:"user with given email doesn't exist"});

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${process.env.ORIGIN}/passwordresetpage/${user._id}/${token.token}`;
    await sendEmail(user.email, "Password reset", link);

   res.send("password reset link sent to your email account");

  } catch (error) {
    console.log(error);
  }
});

router.put("/passwordresetpage/:userId/:userToken", async (req, res) => {
  
  try {

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).json({message:"invalid link or expired"});

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.userToken,
    });
    if (!token) return res.status(400).json({message:"Invalid link or expired" });

    const { password, confirmPassword } = req.body

    if (password === '' || confirmPassword === "") {
      res.status(400).json({ message: "Please enter both fields" });
      return;
    }

    if (confirmPassword !== password) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
      return;
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const updateUser = await User.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true })

    console.log('updatedUser',updateUser)

    await Token.findOneAndDelete({token:req.params.userToken})

    res.send("password reset sucessfully.");

  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }

});

router.post('/signup', (req, res, next) => {
  const { email, password, username, confirmPassword, picture } = req.body;

  // Check if the email or password or name is provided as an empty string 

  if (email === '' || password === '' || username === '' || confirmPassword === "") {
    res.status(400).json({ msg: "Provide email, password and name" });
    return;
  }

  if (confirmPassword !== password) {
    res.status(400).json({ pwConMsg: "Passwords do not match" });
    return;
  }
  // Use regex to validate the email format

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!emailRegex.test(email)) {
    res.status(400).json({ emailMsg: 'Provide a valid email address.' });
    return;
  }

  // Use regex to validate the password format

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ pwMsg: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }

  // Check the users collection if a user with the same email already exists



  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response

      if (foundUser && foundUser.email === email) {
        res.status(400).json({ userMsg1: "Email already exists." });
        return;
      }
      // If the email is unique, proceed to hash the password


      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create a new user in the database
      // We return a pending promise, which allows us to chain another `then` 

      User.create({ email, password: hashedPassword, username, route: 'Regular', picture, notifications:[] })
        .then((createdUser) => {
          // Deconstruct the newly created user object to omit the password
          // We should never expose passwords publicly

          const { email, username, _id, route } = createdUser;

          // Create a new object that doesn't expose the password

          const user = { email, username, _id, route };

          // Send a json response containing the user object

          console.log('user-signing-up', user)

          res.status(201).json({ user: user });
        })
    })
    .catch(err => {

      console.log('err', err)

      res.status(500).json({ serverMsg: "Internal Server Error" })

    });



})


//--------------------------------------------------------GOOGLE SIGN UP / SIGN IN-----------------------------------------------------------------------------------


//Log in route

router.post('/altsignup', (req, res, next) => {

  const { email, password, username, picture, route } = req.body;

  User.findOne({ email })
    .then((foundUser) => {

      if (foundUser && foundUser.email === email) {

        // const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

        // if (passwordCorrect) {
        // Deconstruct the user object to omit the password

        const { _id, email, username, route, picture } = foundUser;

        // Create an object that will be set as the token payload

        const payload = { _id, email, username, route, picture };

        // Create and sign the token

        const authToken = jwt.sign(
          payload,
          process.env.TOKEN_SECRET,
          { algorithm: 'HS256', expiresIn: "6h" },
        );

        // Send the token as the response

        res.status(200).json({ authToken: authToken });
        // }
      }
      // If the email is unique, proceed to hash the password
      else {

        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Create a new user in the database
        // We return a pending promise, which allows us to chain another `then` 

        User.create({ email, password: hashedPassword, username, route: route, picture, notifications:[]})
          .then((createdUser) => {
            // Deconstruct the newly created user object to omit the password
            // We should never expose passwords publicly

            console.log(createdUser)


            const passwordCorrect = bcrypt.compareSync(password, createdUser.password);

            if (passwordCorrect) {
              // Deconstruct the user object to omit the password

              const { _id, email, username, route, picture } = createdUser;



              const payload = { _id, email, username, route, picture };


              const authToken = jwt.sign(
                payload,
                process.env.TOKEN_SECRET,
                { algorithm: 'HS256', expiresIn: "6h" },
              );

              // Send the token as the response

              res.status(200).json({ authToken: authToken });
            }

          })
      }


    })
    .catch(err => {

      console.log('err', err)

      res.status(500).json({ serverMsg: "Internal Server Error" })

    });
})

//------------------------------------------------------------------------------------------------------------------------------------


router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string 

  if (email === '' || password === '') {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists

  User.findOne({ email })
    .then((foundUser) => {

      if (!foundUser) {
        // If the user is not found, send an error response

        res.status(401).json({ message: "User not found." })
        return;
      }


      // Compare the provided password with the one saved in the database

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password

        const { _id, email, username, route, picture } = foundUser; //////

        // Create an object that will be set as the token payload

        console.log('user-logging-in', foundUser)

        const payload = { _id, email, username, route, picture }; //////

        // Create and sign the token

        const authToken = jwt.sign(
          payload,
          process.env.TOKEN_SECRET,
          { algorithm: 'HS256', expiresIn: "6h" },
        );

        // Send the token as the response

        res.status(200).json({ authToken: authToken });
      }
      else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }

    })
    .catch(err => res.status(500).json({ message: "Internal Server Error" }));
});


router.get('/userverify', isAuthenticated, (req, res, next) => {       // <== CREATE NEW ROUTE

  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`

  console.log(`req.payload`, req.payload);

  // Send back the object with user data
  // previously set as the token payload

  res.status(200).json(req.payload);
});

module.exports = router;