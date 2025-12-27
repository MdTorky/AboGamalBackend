const Admin = require("../models/Admin")
const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRE = "7d"

exports.register = async (req, res) => {
  try {
    const { username, email, type, password } = req.body

    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] })
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email or username already exists",
      })
    }

    const admin = new Admin({
      username,
      email,
      type,
      password,
    })

    await admin.save()

    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: JWT_EXPIRE })

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email, type: admin.type,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const isPasswordCorrect = await admin.comparePassword(password)
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: JWT_EXPIRE })

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
    })
  }
}

exports.verifyToken = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password")
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      })
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    })
  } catch (error) {
    console.error("Verify token error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during token verification",
    })
  }
}
