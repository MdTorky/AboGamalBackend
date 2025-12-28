const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/create", orderController.createOrder)
router.get("/track/:trackingNumber", orderController.trackOrder)
router.get("/", authMiddleware, orderController.getAllOrders)
router.get("/past", authMiddleware, orderController.getPastOrders)
router.get("/analytics", authMiddleware, orderController.getAnalytics)
router.patch("/:id/status", authMiddleware, orderController.updateOrderStatus)
router.delete("/clear-day", authMiddleware, orderController.clearDayOrders)
router.delete("/:id", authMiddleware, orderController.deleteOrder)
router.get("/test-email", orderController.testEmail)


module.exports = router
