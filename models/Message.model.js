const { Schema, model } = require("mongoose")
require("./User.model")
require("./Game.model")


let MessageSchema = new Schema(
  {
    uniqueId: String,
    senderName: String,
    picture: String,
    sender: {
      
      type: Schema.Types.ObjectId,
    },
    message: String,
    gameId: {
      ref: "game",
      type: Schema.Types.ObjectId,
    },
    winMsg:String
  },
  {
    timestamps: true,
  }
)

let Message = model("message", MessageSchema)

module.exports = Message