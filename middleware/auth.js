const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  if (req.session && req.session.user && req.session.token) {
    try {
      const decoded = jwt.verify(req.session.token, process.env.TOKEN_KEY)
      req.user = decoded
      next()
    } catch {
      return res.status(401).send("Invalid Token")
    }
  } else {
    res.status(401).send("Need to be logged in")
  }
}

module.exports = verifyToken