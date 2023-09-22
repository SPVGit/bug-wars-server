

//-------------------PORT SET UP---------------------------------------------------------------------------

require("dotenv").config()

const PORT = process.env.PORT || 5005

const app = require("./app")

let myServer = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})

//-----------------SCOKET.IO SETUP-------------------------------------------------------------------------
const { Server } = require("socket.io")
const io = new Server(myServer, {
  cors: {

    origin: process.env.ORIGIN,
  },
})

//-------------------SOCKET EVENTS ------------------------------------------------------------------------

const Message = require("./models/Message.model")

io.on("connection", (socket) => { //detects when a user is connected
  console.log("a user connected")

  socket.on("disconnect", () => { //detects when a user is disconnected
    console.log("user disconnected")
  })

  socket.on("join_chat", (data) => { //detects when a user joins chat
    socket.join(data)
    console.log("User Joined Room: " + data)
  })


  socket.on("send_message", (data) => { //receives messages from front end

    const { sender, message, senderName, uniqueId, gameId, picture, winMsg } = data

    let newMessage = {
      gameId: gameId,
      sender: sender._id,
      message: message,
      uniqueId: uniqueId,
      senderName: senderName,
      picture:picture,
      winMsg:winMsg
    }
    // Messages received from front end are deconstructed and send to mongo in newMessage objects

    Message.create(newMessage).then(async () => {
      
      let allMessages = await Message.find({ gameId: gameId }).populate("sender")

      socket.to(data.gameId).emit("receive_message", allMessages) 
      
      
      //messages received are also sent back to front end for display

    })
  })
})