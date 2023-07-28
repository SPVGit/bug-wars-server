const { Schema, model } = require("mongoose")
require("./User.model")

let GameSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
    },
  ],
  
})


let Game = model("game", GameSchema)


module.exports = Game