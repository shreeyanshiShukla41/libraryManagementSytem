const express=require("express")
const router=express.Router()
const userController=require("../controller/user")

router.get("/register",(req,res)=>{
  res.render("user/register")
})

router.get("/login",(req,res)=>{
  res.render("user/login");
})

router.post("/register",userController.userRegistration);
router.post("/login",userController.userLogin)

router.get("/logout",(req,res)=>{
  res.render("admin/logout")
})
router.post("/logout",userController.userLogout)

router.get("/home",userController.userHomePage)

module.exports=router;