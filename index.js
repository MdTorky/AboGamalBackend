const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const http = require("http")
const { Server } = require("socket.io")

dotenv.config()

const app = express()

// const server = http.createServer(app) // 3. Create HTTP server

// // 4. Initialize Socket.io
// const io = new Server(server, {
//     cors: {
//         origin: process.env.FRONTEND_URL, // Allow your frontend
//         methods: ["GET", "POST", "PATCH", "DELETE"],
//     },
// })

// 5. Save 'io' to app so we can use it in controllers
// app.set("socketio", io)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
    // console.log(req.path, req.method)
    next()
})

// MongoDB Connection
// mongoose
//     .connect(process.env.MONGO_URI, {
//         serverSelectionTimeoutMS: 30000, // Increase from default 10000ms
//         socketTimeoutMS: 45000,
//     })
//     .then(() => console.log("✅ MongoDB connected successfully"))
//     .catch((err) => console.error("❌ MongoDB connection error:", err))

// mongoose.connect(process.env.MONGO_URI, {})
//     .then(() => {
//         console.log('connected to the database');
//         // listen to port
//         app.listen(process.env.PORT, () => {
//             console.log('listening for requests on port', process.env.PORT);
//         });
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// Routes
const authRoutes = require("./routes/authRoutes")
const orderRoutes = require("./routes/orderRoutes")
const shopRoutes = require("./routes/shopRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/shop", shopRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "ABO GAMAL Shawrama API is running",
        timestamp: new Date().toISOString(),
    })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Global error handler:", err)
    res.status(500).json({
        success: false,
        message: "Internal server error",
    })
})

// const PORT = process.env.PORT
// server.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`)
// })




mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // listen for requests
        const server = app.listen(process.env.PORT, () => {
            console.log(`🚀 Connected to DB & Listening on port ${process.env.PORT}`)
        })

        // Initialize Socket.io with the server instance
        const io = require("socket.io")(server, {
            pingTimeout: 60000,
            cors: {
                origin: [
                    process.env.FRONTEND_URL
                ],
                methods: ["GET", "POST", "PATCH", "DELETE"],
            },
        })

        app.set("socketio", io)

        io.on("connection", (socket) => {
            console.log("✅ Connected to socket.io")

            // You can add global listeners here if needed
            socket.on("setup", (userData) => {
                if (userData && userData.userId) {
                    socket.join(userData.userId)
                    socket.emit("connected")
                }
            })

            socket.on("disconnect", () => {
                // console.log("User disconnected")
            })
        })
    })
    .catch((error) => {
        console.log("❌ MongoDB Connection Error:", error)
    })









