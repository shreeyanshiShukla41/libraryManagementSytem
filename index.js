const express=require("express");
const app=express()
const path=require("path")
const port=8080
const userRoute=require("./routes/user")
const adminRoute=require("./routes/admin")
const mongoose=require("mongoose")

// db connection
const dbUrl='mongodb://127.0.0.1:27017/lms';
main().then(r=>console.log(r)).catch(e=>console.log(e));

async function main() {
  await mongoose.connect(dbUrl)
}

// middlewares
app.set("view engine","ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/admin",adminRoute)
app.use("/api/user",userRoute)
app.set('views', path.join(__dirname, 'views'));


app.get("/",(req,res)=>{
  res.render("homepage")
})

app.listen(port ,(req,res)=>{
  console.log("http://localhost:8080");
})