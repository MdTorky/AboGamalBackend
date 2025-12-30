const Order = require("../models/Order")
const nodemailer = require("nodemailer")
const { sendEmail } = require("../utils/emailService");

var transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

exports.testEmail = async (req, res) => {
  try {
    // We await here because this is a specific test route
    await sendEmail({
      to: "mohamed2003torky@gmail.com", // Or req.body.email
      subject: "SendGrid Test ✔",
      html: "<p>If you received this, SendGrid works on Render!</p>"
    });
    res.json({ success: true, message: "📩 Email sent successfully!" });
  } catch (err) {
    console.log("Email Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const generateTrackingNumber = () => {
  const prefix = "AGS"
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}${timestamp}${random}`
}

// const generateWhatsAppLink = (phoneNumber, message) => {
//   const cleanPhone = phoneNumber.replace(/[^0-9]/g, "")
//   const encodedMessage = encodeURIComponent(message)
//   return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
// }

exports.createOrder = async (req, res) => {
  try {
    const { customerName, email, phoneNumber, whatsappNumber, items, totalAmount, extraRequests, paymentMethod } =
      req.body

    if (!customerName || !email || !phoneNumber || !items || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      })
    }

    let trackingNumber
    let isUnique = false

    while (!isUnique) {
      trackingNumber = generateTrackingNumber()
      const existingOrder = await Order.findOne({ trackingNumber })
      if (!existingOrder) {
        isUnique = true
      }
    }

    const order = new Order({
      trackingNumber,
      customerName,
      email,
      phoneNumber,
      whatsappNumber: whatsappNumber || phoneNumber,
      items,
      totalAmount,
      extraRequests,
      paymentMethod,
      paymentStatus: paymentMethod === "payNow" ? "completed" : "pending",
    })

    await order.save()
    const io = req.app.get("socketio")
    io.emit("new_order", order)

    const trackingUrl = `${process.env.FRONTEND_URL}/track/${trackingNumber}`

    // await new Promise((resolve, reject) => {
    //   transporter.verify(function (error, success) {
    //     if (error) {
    //       console.log(error);
    //       reject(error);
    //     } else {
    //       resolve(success);
    //     }
    //   });
    // });

    // var mailOptions = {
    //   from: {
    //     name: 'Shawarma Fahman',
    //     address: process.env.EMAIL_USER // Replace with your email
    //   },
    //   to: email,
    //   subject: "Order Confirmation - Shawarma Fahman",
    //   html: `
    //     <h2>Thank you for your order!</h2>
    //     <p>Dear ${customerName},</p>
    //     <p>Your order has been received successfully.</p>

    //     <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
    //       <h3 style="margin-top: 0;">Tracking Number:</h3>
    //       <p style="font-size: 24px; font-weight: bold; color: #059669;">${trackingNumber}</p>
    //       <p><a href="${trackingUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Order</a></p>
    //     </div>

    //     <h3>Order Details:</h3>
    //     <ul>
    //       ${items.map((item) => `<li>${item.name} x${item.quantity} - RM${item.price * item.quantity}</li>`).join("")}
    //     </ul>
    //     <p><strong>Total: RM${totalAmount}</strong></p>
    //     ${extraRequests ? `<p>Special Requests: ${extraRequests}</p>` : ""}
    //     <p>We'll notify you when your order is ready!</p>
    //     <p>Best regards,<br>Shawarma Fahman Team</p>
    //   `
    // };

    // await new Promise((resolve, reject) => {
    //   // send mail
    //   transporter.sendMail(mailOptions, (err, info) => {
    //     if (err) {
    //       console.error(err);
    //       reject(err);
    //     } else {
    //       resolve(info);
    //     }
    //   });
    // });

    await sendEmail({
      to: email,
      subject: "Order Confirmation - Shawarma Fahman",
      html: `
        <h2>Thank you for your order!</h2>
        <p>Dear ${customerName},</p>
        <p>Your order has been received successfully.</p>

        <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">Tracking Number:</h3>
          <p style="font-size: 24px; font-weight: bold; color: #059669;">${trackingNumber}</p>
          <p><a href="${trackingUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Order</a></p>
        </div>

        <h3>Order Details:</h3>
        <ul>
          ${items.map((item) => `<li>${item.name} x${item.quantity} - RM${item.price * item.quantity}</li>`).join("")}
        </ul>
        <p><strong>Total: RM${totalAmount}</strong></p>
        ${extraRequests ? `<p>Special Requests: ${extraRequests}</p>` : ""}
        <p>We'll notify you when your order is ready!</p>
        <p>Best regards,<br>Shawarma Fahman Team</p>
      `
    }).catch(err => console.error("Background Email Failed:", err.message));;



    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
      trackingNumber,
    })
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
    })
  }
}

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $in: ["pending", "ready"] },
    }).sort({ createdAt: -1 })

    res.json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    })
  }
}

exports.getPastOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const query = { orderStatus: "delivered" }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 })

    res.json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error) {
    console.error("Get past orders error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching past orders",
    })
  }
}

exports.getAnalytics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query

    let dateFilter = {}
    const now = new Date()

    // 1. Setup Date Filter
    if (period === "thisMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = { createdAt: { $gte: firstDay } }
    } else if (period === "lastMonth") {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      dateFilter = {
        createdAt: {
          $gte: firstDayLastMonth,
          $lte: lastDayLastMonth,
        },
      }
    } else if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }
    }

    // 2. Fetch DELIVERED orders (For Revenue & Sales Stats)
    const deliveredOrders = await Order.find({
      ...dateFilter,
      orderStatus: "delivered", // STRICTLY 'delivered'
    })

    // DEBUGGING: Remove this line in production
    console.log(`Found ${deliveredOrders.length} delivered orders for analytics.`)

    // 3. Fetch PENDING/ACTIVE orders (For the Dashboard Badge)
    // We usually want ALL currently active orders, regardless of date
    const pendingOrdersCount = await Order.countDocuments({
      orderStatus: { $in: ["pending", "ready"] },
    })

    // 4. Calculate Stats
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const totalOrders = deliveredOrders.length

    const itemSales = {}
    deliveredOrders.forEach((order) => {
      // Check if items exist to prevent crashes
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          // Handle both 'name' (schema) and 'name.en' variations safely
          const itemName = item.name || "Unknown Item"

          if (!itemSales[itemName]) {
            itemSales[itemName] = { quantity: 0, revenue: 0 }
          }
          itemSales[itemName].quantity += item.quantity
          itemSales[itemName].revenue += item.price * item.quantity
        })
      }
    })

    // 5. Send Response
    res.json({
      success: true,
      // We return the data directly at the top level to match your Dashboard expectations
      // Or inside an 'analytics' object if that's how your frontend parses it. 
      // Based on your previous code, you did setStats(statsRes.data), so let's match that structure:
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      pendingOrders: pendingOrdersCount, // <--- ADDED THIS
      itemSales,
    })

  } catch (error) {
    console.error("Get analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
    })
  }
}

exports.trackOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params

    const order = await Order.findOne({ trackingNumber })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found with this tracking number",
      })
    }

    res.json({
      success: true,
      order: {
        trackingNumber: order.trackingNumber,
        customerName: order.customerName,
        items: order.items,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    })
  } catch (error) {
    console.error("Track order error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while tracking order",
    })
  }
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["ready", "delivered", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      })
    }

    const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    const io = req.app.get("socketio")
    if (io) {
      console.log("Broadcasting update for order:", order.trackingNumber) // Debug log
      io.emit("order_status_updated", order)
    } else {
      console.log("Socket.io not found!")
    }

    const trackingUrl = `${process.env.FRONTEND_URL}/track/${order.trackingNumber}`

    if (status === "ready") {

      // await new Promise((resolve, reject) => {
      //   transporter.verify(function (error, success) {
      //     if (error) {
      //       console.log(error);
      //       reject(error);
      //     } else {
      //       resolve(success);
      //     }
      //   });
      // });

      // var mailOptions = {
      //   from: {
      //     name: 'Shawarma Fahman',
      //     address: process.env.EMAIL_USER // Replace with your email
      //   },
      //   to: order.email,
      //   subject: "Your Order is Ready! - Shawarma Fahman",
      //   html: `
      //     <h2>Good news, ${order.customerName}!</h2>
      //     <p>Your order is ready for pickup!</p>

      //     <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
      //       <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
      //       <p><a href="${trackingUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Order Status</a></p>
      //     </div>

      //     <h3>Order Details:</h3>
      //     <ul>
      //       ${order.items.map((item) => `<li>${item.name} x${item.quantity}</li>`).join("")}
      //     </ul>
      //     <p><strong>Total: RM${order.totalAmount}</strong></p>
      //     <p>Please come by to collect your delicious shawarma!</p>
      //     <p>Best regards,<br>Shawarma Fahman Team</p>
      //   `,
      // };

      // await new Promise((resolve, reject) => {
      //   // send mail
      //   transporter.sendMail(mailOptions, (err, info) => {
      //     if (err) {
      //       console.error(err);
      //       reject(err);
      //     } else {
      //       resolve(info);
      //     }
      //   });
      // });


      await sendEmail({
        to: order.email,
        subject: "Your Order is Ready! - Shawarma Fahman",
        html: `
          <h2>Good news, ${order.customerName}!</h2>
          <p>Your order is ready for pickup!</p>

          <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
            <p><a href="${trackingUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Order Status</a></p>
          </div>

          <h3>Order Details:</h3>
          <ul>
            ${order.items.map((item) => `<li>${item.name} x${item.quantity}</li>`).join("")}
          </ul>
          <p><strong>Total: RM${order.totalAmount}</strong></p>
          <p>Please come by to collect your delicious shawarma!</p>
          <p>Best regards,<br>Shawarma Fahman Team</p>
        `
      });

    } else if (status === "delivered") {


      // await new Promise((resolve, reject) => {
      //   // verify connection configuration
      //   transporter.verify(function (error, success) {
      //     if (error) {
      //       console.log(error);
      //       reject(error);
      //     } else {
      //       // console.log("Server is ready to take our messages");
      //       resolve(success);
      //     }
      //   });
      // });

      // var mailOptions = {
      //   from: {
      //     name: 'Shawarma Fahman',
      //     address: process.env.EMAIL_USER // Replace with your email
      //   },
      //   to: order.email,
      //   subject: "Order Delivered - Thank You! - Shawarma Fahman",
      //   html: `
      //     <h2>Thank you, ${order.customerName}!</h2>
      //     <p>Your order has been marked as delivered.</p>
      //     <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
      //     <p>We hope you enjoyed your meal! Please visit us again soon.</p>
      //     <p>Best regards,<br>Shawarma Fahman Team</p>
      //   `,
      // };

      // await new Promise((resolve, reject) => {
      //   // send mail
      //   transporter.sendMail(mailOptions, (err, info) => {
      //     if (err) {
      //       console.error(err);
      //       reject(err);
      //     } else {
      //       resolve(info);
      //     }
      //   });
      // });
      // await sendEmail({
      //   to: order.email,
      //   subject: "Order Delivered - Thank You! - Shawarma Fahman",
      //   html: `
      //     <h2>Thank you, ${order.customerName}!</h2>
      //     <p>Your order has been marked as delivered.</p>
      //     <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
      //     <p>We hope you enjoyed your meal! Please visit us again soon.</p>
      //     <p>Best regards,<br>Shawarma Fahman Team</p>
      //   `
      // });


    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    })
  }
}

exports.clearDayOrders = async (req, res) => {
  try {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const result = await Order.deleteMany({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      orderStatus: "delivered",
    })

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} delivered orders from today`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Clear day orders error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while clearing orders",
    })
  }
}


exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params

    const order = await Order.findById(id)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    await order.deleteOne()

    res.json({
      success: true,
      message: "Order deleted successfully",
    })
  } catch (error) {
    console.error("Delete order error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting order",
    })
  }
}




