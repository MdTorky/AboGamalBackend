const ShopSettings = require("../models/Shop")

exports.getShopStatus = async (req, res) => {
    try {
        let settings = await ShopSettings.findOne()

        if (!settings) {
            settings = new ShopSettings()
            await settings.save()
        }

        res.json({
            success: true,
            settings,
        })
    } catch (error) {
        console.error("Get shop status error:", error)
        res.status(500).json({
            success: false,
            message: "Server error while fetching shop status",
        })
    }
}

exports.updateShopStatus = async (req, res) => {
    try {
        const { isOpen, closedMessage, openingHours, openingHoursArabic } = req.body

        let settings = await ShopSettings.findOne()

        if (!settings) {
            settings = new ShopSettings()
        }

        if (typeof isOpen !== "undefined") {
            settings.isOpen = isOpen
        }

        if (closedMessage) {
            settings.closedMessage = closedMessage
        }

        if (openingHours) {
            settings.openingHours = openingHours
        }
        if (openingHoursArabic) {
            settings.openingHoursArabic = openingHoursArabic
        }

        settings.updatedAt = Date.now()
        await settings.save()

        res.json({
            success: true,
            message: "Shop status updated successfully",
            settings,
        })
    } catch (error) {
        console.error("Update shop status error:", error)
        res.status(500).json({
            success: false,
            message: "Server error while updating shop status",
        })
    }
}
