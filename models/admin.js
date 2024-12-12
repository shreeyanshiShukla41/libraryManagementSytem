const mongoose=require("mongoose")

const adminSchema=mongoose.Schema({
  aname:{
    type:"String",
    required:true
  },
  aemail:{
    type:String,
    required:true
  },
  apassword:{
    type:String,
    required:true
  }
})

const Admin=mongoose.model("Admin",adminSchema);

module.exports=Admin;