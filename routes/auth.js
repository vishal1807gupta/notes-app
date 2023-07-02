// status 400 - for Bad request

const express = require('express');
const User = require('../models/User') // importing user template from the file
const bcrypt = require('bcryptjs'); // for creating hash password
const { body, validationResult } = require('express-validator');  // for validating credentials
var jwt = require('jsonwebtoken');  // for providing token to the user which is unique
const router = express.Router();
const salt = bcrypt.genSaltSync(10);      // generating salt of length 10
const JWT_SECRET = "Vishalisagoodb$oy";
const fetchuser = require('../middleware/fetchuser');

// Create a user using : POST "/api/auth/createuser". Doesn't require authentication(login)

router.post('/createuser',[
  
  body('name',"Enter a valid name").isLength({ min: 5 }),
  body('email',"Enter a valid email").isEmail(),
  body('password',"Password must be at least of 5 characters").isLength({ min: 5 }),
  body('cpassword',"Password must be at least of 5 characters").isLength({ min: 5 })
  
  // validating credentials of the user
  
  
  
],async(req,res)=>{

  let success = false;
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: success,errors: errors.array() });  // checking for the errors for validating such as unique email
  }
  
  try{
    
    let checkPassword = req.body.password===req.body.cpassword?true:false;
    if(!checkPassword){
      return res.status(400).json({success: success,error: "Password doesn't match"});

    }
    let user = await User.findOne({email: req.body.email}); // finding the user in the database of given email in request body of thunderclient
    if(user ){
      return res.status(400).json({success: success,error: "Sorry a user of this email already exists"});
      // if user if found in the db then sending the error
    }
    
    const secPass = await bcrypt.hashSync(req.body.password, salt);
    user =  await User.create({  // creating the user using await as it will return promise
        name: req.body.name,
        password: secPass,
        email: req.body.email
      })
      
      // .then(user => res.json(user)).catch(err=>{console.log(err)
      // res.json({error:"Please enter a unique value for email",message : err.message})});

      const data = {
        user : {
          id : user.id
        }
        
      };
      const authToken = jwt.sign(data,JWT_SECRET);
      success = true;
      console.log(authToken);
      res.json({success: success,authToken:authToken});


    }catch(error){
        console.error(error.message);
        res.status(500).send("Some error occurred");

       // res.json and res.send both convert the jsobject to string like json.stringify
       // res.json used to send the jsobject
    }
})

// Create a user using : POST "/api/auth/login". Doesn't require authentication(login)

router.post('/login',[
  
  
  body('email',"Enter a valid email").isEmail(),
  body('password',"Password can't be blank").exists()
  
  // validating credentials of the user
  
  
  
],async(req,res)=>{
  
  const errors = validationResult(req);
  let success = false;
  if (!errors.isEmpty()) {
    return res.status(400).json({success : success, errors: errors.array() });  // checking for the errors for validating such as unique email
  }

  const{email,password} = req.body; // Destructuring , creating variables from the given input

  try{

  let user = await User.findOne({email}); // {email} symbolise {email:email}
  if(!user){
    return res.status(400).json({success : success, error:"Try to login with correct credentials"});
  }

  let comparePassword = await bcrypt.compare(password,user.password);
  if(!comparePassword){
    return res.status(400).json({success : success, error:"Try to login with correct credentials"});
  }
  const data = {
    user : {
      id : user.id
    }
    
  };
  success = true;
  const authToken = jwt.sign(data,JWT_SECRET);
  console.log(authToken);
  res.json({success : success, authToken:authToken});
  
}catch(error){
    console.error(error.message);
    res.status(500).send("Internal server error");
}
  
})

// Get loggedin user details using POST - "/api/auth/getuser"

router.post('/getuser',fetchuser,async(req,res)=>{

  try{
  const userId = req.user.id;
  const user = await User.findById(userId).select("-password");
  res.send(user);
}catch(error){
  console.error(error.message);
  res.status(500).send("Internal server error");
}

})


module.exports = router;