

const router = require("express").Router();
const User = require('../models/User.model')
const bcrypt = require('bcryptjs');

router.get("/accounts/:userId", (req, res, next) => {

    const {userId} = req.params

  User.findById(userId)
  .then((user) => {
    
    const thisUser = {

        email:user.email, username:user.username, picture:user.picture
    }
    
    res.status(200).json(thisUser)
    
  })
  .catch((err) => res.json(err));
});



router.put('/accounts/:userId', (req,res, next)=>{

  const {username, email, password} = req.body
  const {userId} = req.params

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!emailRegex.test(email)) {
    res.json({ emailMsg: 'Provide a valid email address.' });
    return;
  }

  if(password===""){
    console.log('monkey')
    res.json({ pwErrorMsg: "Please provide password." });
    return;
  }
  
  User.findById(userId)
    .then((foundUser) => {
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
      if (passwordCorrect) {
        User.findByIdAndUpdate(userId, {username:username, email:email}, {new:true})
        .then((user)=>res.status(200).json({message:'Successfully updated'}))
        .catch(err => console.log(err))
      }
      else {
        res.json({errorMsg:"Incorrect password. Try again"})
        return
      }
    })
    .catch(err=>console.log(err))




      // Compare the provided password with the one saved in the database

      

      


})


router.put('/upload/:userId', async (req, res) => {
    const{userId} = req.params
    console.log(req.body)
    try {
      const user =   await User.findByIdAndUpdate(userId, req.body, {new:true})
     console.log(user.picture)
      res.json(user.picture);

    } catch (err) {
      console.error('Something went wrong', err);
    }
  });

router.get('/getLatest/:userId', async (req, res) => {
    const{userId} = req.params
    const getImage = await User.findById(userId)
    res.json(getImage.picture);
  });

module.exports = router;
