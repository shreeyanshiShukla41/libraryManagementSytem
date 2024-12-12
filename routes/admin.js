const express = require("express");
const router = express.Router();

const adminController=require("../controller/admin")

router.get("/register", (req, res) => {
  res.render("admin/register");
});

router.get("/login", (req, res) => {
  res.render("admin/login");
});

router.post("/register", adminController.adminRegister);

router.post("/login",adminController.adminLogin );

router.get("/logout",(req,res)=>{
  res.render("admin/logout")
})
router.post("/logout",adminController.adminLogout)

module.exports = router;
