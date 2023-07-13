const { Schema, model } = require("mongoose")
require("./User.model")
require("./Game.model")


let MessageSchema = new Schema(
  {
    uniqueId: String,
    senderName: String,
    sender: {
      
      type: Schema.Types.ObjectId,
    },
    message: String,
    gameId: {
      ref: "game",
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
)

let Message = model("message", MessageSchema)

module.exports = Message