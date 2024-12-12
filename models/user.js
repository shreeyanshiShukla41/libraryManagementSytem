const mongoose=require("mongoose")

const userSchema=mongoose.Schema({
  uname:{
    type:"String",
    required:true
  },
  uemail:{
    type:String,
    required:true
  },
  upassword:{
    type:String,
    required:true
  }
})

const User=mongoose.model("User",userSchema);

module.exports=User;