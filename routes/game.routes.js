const router = require("express").Router()
const Game = require("../models/Game.model")
const Message = require("../models/Message.model")
const User = require('../models/User.model')
const mongoose = require('mongoose')

// A route to return the converstaion id between two participants if it already exists
// or create a new converstaion, when users chat for the first time. Their ids will be saved in the database under a specific chat ID.
router.post("/game", (req, res, next) => {

  //The user will send an array of participant ids in the chat (usually just two)

  const { participants } = req.body
  Game.findOne({ participants: { $all: participants } })
    .then((found) => {
      if (found) {
        //Conversation between the participants already present
        res.status(200).json(found)
      } else {
        //Create a conversation between them if they are chatting for the first time
        Game.create({ participants}).then((response) => {
          res.status(200).json(response)
        })
      }
    })
    .catch((err) => {
      next(err)
    })
})

router.get('/bugwars/:gameId/:opponentId/:thisUserId', async (req,res,next)=>{
  console.log('wow so many errors')
  const {gameId, opponentId, thisUserId} = req.params
  console.log(req.params)

  const users = await User.find({ 

    '_id': { $in: [ 
    
   new mongoose.Types.ObjectId(`${opponentId}`),
    
   new mongoose.Types.ObjectId(`${thisUserId}`) 
    
    
    ]} 
    
    });
  res.json(users)
})

/*router.put('/notification/:opponentId/:thisUserId',(req,res,next) => {
  const {senderId, thisUserId} = req.params

  User.update({_id: thisUserId},{$push:{notifications: senderId}})
  .then((user) => {

    console.log(user.notifications)

  })
})*/

router.delete("/messages/:gameId", (req,res,next)=>{
  console.log('delete works')
  const {gameId} = req.params
  Message.deleteMany({gameId})
    .then((messages)=>{console.log('messages deleted')})
    .catch((err)=>next(err))
})


// A route to get all messages of a certain converstaion to display on chat box
router.get("/messages/:gameId", (req, res, next) => {
  const { gameId } = req.params
  Message.find({ gameId })
    .populate("sender")
    .then((messages) => {
      res.status(200).json(messages)
    })
    .catch((err) => {
      next(err)
    })
})




module.exports = router