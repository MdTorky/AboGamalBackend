const express = require("express")
const router = express.Router()
const shopController = require("../controllers/shopController")
const authMiddleware = require("../middleware/authMiddleware")

router.get("/status", shopController.getShopStatus)
router.patch("/status", authMiddleware, shopController.updateShopStatus)

module.exports = router
