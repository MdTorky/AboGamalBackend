const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    unique: true,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  whatsappNumber: {
    type: String,
    trim: true,
  },
  items: [
    {
      name: {
        type: String,
        required: true,
      },
      nameAr: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  extraRequests: {
    type: String,
    default: "",
  },
  receiptImage: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["duitnow"],
    default: "duitnow",
  },
  paymentStatus: {
    type: String,
    enum: ["pending_verification", "pending", "completed"],
    default: "pending_verification",
  },
  orderStatus: {
    type: String,
    enum: ["pending", "ready", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

orderSchema.pre("save", function () {
  this.updatedAt = Date.now()
})

module.exports = mongoose.model("Order", orderSchema)
