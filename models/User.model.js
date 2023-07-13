const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      lowercase: true,
      trim: true
    },
    username:{
      type:String,
      required:[true, 'Username is required'],
   
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    route:{
      type:String
    },
    picture:{
      type:String
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
