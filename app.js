require("dotenv").config() 
require("./config/database").connect()

const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const User = require("./model/user") 
const auth = require("./middleware/auth")

const app = express()

app.use(express.json())

// Register new user
app.post("/register", async (req, res) => {
   try {
    // Get user input
    const { firstName, lastName, email, password } = req.body

    // Validate user input
    if (!(firstName && lastName && email && password)) {
      res.status(400).send("All input is required") 
    }

    // Check if user already exist in out database
    const existingUser = await User.findOne({ email }) 

    if (existingUser) {
      return res.status(409).send("User Already Exist. Please Login") 
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10) 

    // Create user in the database
    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: encryptedPassword,
    })

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "5h",
      }
    ) 

    // Save token
    user.token = token 

    // Return new user
    res.status(201).json(user) 
  } catch (err) {
    console.log(err) 
  }
}) 

// Login
app.post("/login", async (req, res) => {
   try {
    // Get user input
    const { email, password } = req.body  

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required")  
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email })  

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "5h",
        }
      )  

      // Save the users token
      user.token = token  

      // Return the user
      return res.status(200).json(user)  
    }
    return res.status(400).send("Invalid Credentials")  
  } catch { 
    res.send()
  }
})

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome!")
})

module.exports = app