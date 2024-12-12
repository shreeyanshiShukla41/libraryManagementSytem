const { emit } = require("nodemon");
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken")
const redis = require('redis');
const client = redis.createClient();

module.exports.adminRegister=async (req, res, next) => {
  try {
    let { aname, aemail, apassword } = req.body;

    if (!aname || !aemail || !apassword) {
      res.status(400).send("fill all details");
    } else {
      let alreadyExists = await Admin.findOne({ aemail });
      if (alreadyExists) {
        res.status(400).send("Account already exists");
      } else {
        const admin = new Admin({ aname, aemail });
        bcrypt.hash(apassword, 10, (err, hashPassword) => {
          admin.set("apassword", hashPassword);
          admin.save();
          next();
        });
        return res.status(200).send("You got registered successfully as an admin");
      }
    }
  } catch (e) {
    console.log("admin registration error ", e);
  }
}

module.exports.adminLogin=async (req, res) => {
  try {
    console.log(req.body)
    let {aemail,apassword}=req.body;

    if(!aemail || !apassword){
      res.status(400).send("fill all details");
    }else{
      let admin=await Admin.findOne({aemail});
      if (!admin){
        res.status(400).send("Data does not exists")
      }else{
        const validatedAdmin=await bcrypt.compare(apassword,admin.apassword);
        
        if(!validatedAdmin){
          res.status(400).send("Data not found, get right credentials");
        }else{
          const payload={
            id:admin._id,email:admin.aemail
          }
          const JWT_SECRET_KEY=process.env.JWT_SECRET_KEY|| 'AN_EXAMPLE_OF_A_SECRET_KEY';

          jwt.sign(
            payload,
            JWT_SECRET_KEY,
            { expiresIn: 24 * 60 * 60 },
            async (err, token) => {
              await Admin.updateOne(
                { _id: admin._id },
                {
                  $set: { token },
                }
              );
              admin.save();
              return res.status(200).json({
                admin: {
                  _id:admin._id,
                  aemail: admin.aemail,
                  aname: admin.aname,
                },
                token:token,
              });
            }
          );
        }
      }
    }
  } catch (e) {
    console.log("admin login error ", e);
  }
}


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

module.exports.adminLogout=(req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
      addToBlacklist(token); 
      res.status(200).redirect("/");
  } else {
      res.status(400).send("Token not provided");
  }
}