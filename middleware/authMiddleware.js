const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    req.admin = decoded
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    })
  }
}
