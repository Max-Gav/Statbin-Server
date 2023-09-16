const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require('bcrypt');
const {UserModel, userValidation, loginValidation, createToken, createAdminToken} = require("../models/userModel");
const {userAuth, adminAuth} = require("../middlewares/auth");
const router = express.Router();

//GET - get all users name and email (admin authentication required)
router.get("/", adminAuth,async (req,res)=>{
    try{
        const users = await UserModel.find({},{"name":1,"email":1, "_id":0});
        res.status(201).json(users);
    }
    catch(err){
        console.log(err);
        res.status(502).json({err})
    }
})


//GET - get a single user name and email details of the current user
router.get("/single", userAuth,async (req,res)=>{
    try{
        const user_id = req.tokenData._id;
        const user = await UserModel.findOne({_id:user_id},{"name":1,"email":1,"_id":0});
        res.status(201).json(user);
    }
    catch(err){
        console.log(err);
        res.status(502).json({err})
    }
})


//POST - signup using email and password
router.post("/signup", async (req,res)=>{
    const validateBody = userValidation(req.body);
    if(validateBody.error){
        return res.status(432).json({err:validateBody.error.details});
    }
    try{
        const user = new UserModel(req.body);
        user.password = await bcrypt.hash(user.password,10);
        await user.save();

        user.password = "*****";
        res.status(201).json(user);
    }
    catch(err){
        if(err.code == 11000){
            return res.status(433).json("Email already exist!");
        }
        console.log(err);
        res.status(502).json({err})
        
    }
})

//POST - log in using email and password
router.post("/login",async  (req,res)=>{
    const validateLogin = loginValidation(req.body);
    console.log(req.body);
    if(validateLogin.error){
        return res.status(432).json(validateLogin.error.details);
    }
    try{
        const user = await UserModel.findOne({email:req.body.email});
        if(!user){
            return res.status(433).json("Email not found!!");
        }
        
        const passValidate = await bcrypt.compare(req.body.password, user.password);

        if(!passValidate){
            return res.status(434).json("Wrong Password!");
        }

        const token = createToken(user._id, user.role);

        res.status(201).json(token);

    }
    catch(err){

        console.log(err);
        res.status(502).json({err})
    }
})

//DELETE - deleting user by ID, only the current user or an admin can delete a user
router.delete("/:id", userAuth,async(req,res)=>{
    try{
        if(req.tokenData._id == req.params.id || req.tokenData.role == "admin"){            
            const data = await UserModel.deleteOne({_id:req.params.id});
            res.status(200).json(data);
        }
        else{
            return res.status(400).json({err:"Trying to delete a different user than yours!"})
        }

    }
    catch(err){
        console.log(err);
        res.status(502).json({err})
    }

})

//PATCH - updating an user role, only an admin can update an users role
router.patch("/:id/:role", adminAuth, async(req,res) => {
    try{
      const id = req.params.id;
      const role = req.params.role;
      if(id == req.tokenData._id){
        return res.json("You try to change your own role!");
      }
      if(role != "user" || role != "admin")
      {
        return res.json("Enter valid role!");
      }
      const data = await UserModel.updateOne({_id:id},{role});
      res.json(data);
    }
    catch(err){
      console.log(err);
      res.status(502).json({err})
    }
  })


module.exports = router;