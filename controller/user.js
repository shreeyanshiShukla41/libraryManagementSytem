const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken")
const redis = require('redis');
const client = redis.createClient();


module.exports.userRegistration = async (req, res, next) => {
  try {
    let { uname, uemail, upassword } = req.body;
    console.log(req.body);
    if (!uname || !uemail || !upassword) {
      res.status(400).send("fill all details");
    } else {
      let alreadyExists = await User.findOne({ uemail });
      if (alreadyExists) {
        res.status(400).send("User already exists");
      } else {
        const user = new User({ uname, uemail });
        bcrypt.hash(upassword, 10, (err, hashPassword) => {
          user.set("upassword", hashPassword);
          user.save();
          next();
        });
        return res.status(200).send("User registered successfully");
      }
    }
  } catch (e) {
    console.log("user registration error ", e);
  }
};

module.exports.userLogin = async (req, res) => {
  try {
    let { uemail, upassword } = req.body;
    if (!uemail || !upassword) {
      res.status(400).send("Fill all details");
    } else {
      let user = await User.findOne({ uemail });
      if (!user) {
        res.status(400).send("User not found");
      } else {
        const payload={
          id:user._id,email:user.uemail
        }

        const JWT_SECRET_KEY=process.env.JWT_SECRET_KEY|| 'AN_EXAMPLE_OF_A_SECRET_KEY';

        jwt.sign(
          payload,
          JWT_SECRET_KEY,
          { expiresIn: 24 * 60 * 60 },
          async (err, token) => {
            await User.updateOne(
              { _id: user._id },
              {
                $set: { token },
              }
            );
            user.save();
            return res.redirect("")
            // return res.status(200).json({
            //   admin: {
            //     _id:user._id,
            //     uemail: user.uemail,
            //     uname: user.uname,
            //   },
            //   token:token,
            // });
          }
        );
      }
    }
  } catch (e) {
    console.log("user login error ", e);
  }
};

const addToBlacklist = (token) => {
  const decoded = jwt.decode(token);
  const expiresAt = decoded.exp; 
  const currentTime = Math.floor(Date.now() / 1000);
  const ttl = expiresAt - currentTime;

  if (ttl > 0) {
      client.setex(token, ttl, 'blacklisted'); 
  }
};

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send("Access Denied");

  client.get(token, (err, result) => {
      if (err) return res.status(500).send("Server error");
      if (result === 'blacklisted') return res.status(401).send("Token has been invalidated");

      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
          if (err) return res.status(403).send("Invalid Token");
          req.user = decoded; 
          next();
      });
  });
};

module.exports.userLogout=(req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
      addToBlacklist(token); 
      res.status(200).redirect("/");
  } else {
      res.status(400).send("Token not provided");
  }
}

module.exports.userHomePage=(req,res)=>{

  let booksData=[{
    b_code:"sc1",
    b_name:"Science Book 1",
    category:"Science",
    id:1
  },
  {
    b_code:"sc2",
    b_name:"Science Book 2",
    category:"Science",
    id:2
  },
  {
    b_code:"ec1",
    b_name:"Economics Book 1",
    category:"Economics",
    id:3
  },
  {
    b_code:"ec2",
    b_name:"Economics Book 2",
    category:"Economics",
    id:4
  },
]
  
  res.render("user/home")
}