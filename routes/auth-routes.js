require("dotenv").config() 
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const UserModel = require("../model/user")
const router = express.Router()

router.use(express.json())


// Register new user
router.post("/register", async (req, res) => {
   try {
    // Get user input
    const { firstName, lastName, email, password } = req.body

    // Validate user input
    if (!(firstName && lastName && email && password)) {
      res.status(400).send("All input is required") 
    }

    // Check if user already exist in our database
    const existingUser = await UserModel.findOne({ email }) 

    if (existingUser) {
      return res.status(409).send("User Already Exist. Please Login") 
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10) 

    // Create user in the database
    const user = await UserModel.create({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: encryptedPassword,
    })

    // Create cookie with user details
    req.session.user = user

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    ) 

    // Save token
    req.session.token = token

    // Return new user
    res.status(201).json(user) 
  } catch (err) {
    console.log(err) 
  }
}) 

// Login
router.post("/login", async (req, res) => {
   try {
    // Get user input
    const { email, password } = req.body  

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required")  
    }
    // Validate if user exist in our database
    const user = await UserModel.findOne({ email })  

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create cookie with user details
      req.session.user = user

      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      )  

      // Save the users token to cookie
      req.session.token = token 

      // Return the user
      return res.status(200).json(user)  
    }
    return res.status(400).send("Invalid Credentials")  
  } catch { 
    res.send()
  }
})

// Logout
router.get('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy(err => {
      if (err) {
        res.status(500).send('Something wrong with logout')
      } else {
        res.status(200).send('Successfully logged out')
      }
    })
  } else {
    res.status(200).send('Not logged in')
  }
})

module.exports = router