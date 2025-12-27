const mongoose = require("mongoose")

const shopSettingsSchema = new mongoose.Schema({
    isOpen: {
        type: Boolean,
        default: true,
    },
    closedMessage: {
        en: {
            type: String,
            default: "We are currently closed. Please check back later!",
        },
        ar: {
            type: String,
            default: "نحن مغلقون حاليًا. يرجى العودة لاحقًا!",
        },
    },
    openingHours: {
        type: String,
        default: "12:00 PM - 6:00 PM",
    },
    openingHoursArabic: {
        type: String,
        default: "من الساعة 12:00 ظهراً إلى الساعة 6:00 مساءً",
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("ShopSettings", shopSettingsSchema)
