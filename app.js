require("dotenv").config() 
require("./config/database").connect()

const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const cors = require('cors')
const session = require('express-session')

const User = require("./model/user") 
const auth = require("./middleware/auth")
const user = require("./model/user")

const app = express()

app.use(cors())

const sessionConfig = {
  name: 'UID', // name of cookie
  secret: process.env.COOKIE_SECRET, // secret that makes the cookie effective
  cookie: {
    maxAge: 1000 * 60 * 60, // time span of cookie in ms
    secure: false, // set to true in production for HTTPS only access
    httpOnly: true // true = no access from js
  },
  resave: false,
  saveUninitialized: true, // set to false in production, user has to give consent
}

app.use(express.json())
app.use(session(sessionConfig))

// Register new user
app.post("/register", async (req, res) => {
   try {
    // Get user input
    const { firstName, lastName, email, password } = req.body

    // Validate user input
    if (!(firstName && lastName && email && password)) {
      res.status(400).send("All input is required") 
    }

    // Check if user already exist in our database
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

    req.session.user = user

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "5h",
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
      // Create cookie with user details
      req.session.user = user

      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "5h",
        }
      )  

      // Save the users token to cookie
      req.session.token = token 

      console.log(req.session)

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