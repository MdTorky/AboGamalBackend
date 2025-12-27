const mongoose = require("mongoose")
require("dotenv").config()

// This is a basic menu seeder for future use
// You would need to create a Menu model first

const menuItems = [
  {
    name: { en: "Chicken Shawarma", ar: "شاورما دجاج" },
    description: {
      en: "Marinated chicken with garlic sauce and pickles",
      ar: "دجاج متبل مع صلصة الثوم والمخلل",
    },
    price: 12.0,
    image: "/chicken-shawarma-wrap.png",
    category: "shawarma",
    available: true,
  },
  {
    name: { en: "Beef Shawarma", ar: "شاورما لحم" },
    description: {
      en: "Premium beef with tahini sauce and vegetables",
      ar: "لحم بقري ممتاز مع صلصة الطحينة والخضار",
    },
    price: 15.0,
    image: "/beef-shawarma-wrap.jpg",
    category: "shawarma",
    available: true,
  },
  {
    name: { en: "Mixed Shawarma", ar: "شاورما مشكلة" },
    description: {
      en: "Combination of chicken and beef with special sauce",
      ar: "مزيج من الدجاج واللحم مع صلصة خاصة",
    },
    price: 18.0,
    image: "/mixed-shawarma-plate.jpg",
    category: "shawarma",
    available: true,
  },
  {
    name: { en: "Falafel Wrap", ar: "لفة فلافل" },
    description: {
      en: "Crispy falafel with hummus and fresh vegetables",
      ar: "فلافل مقرمش مع حمص وخضار طازجة",
    },
    price: 10.0,
    image: "/falafel-wrap.png",
    category: "vegetarian",
    available: true,
  },
  {
    name: { en: "Shawarma Plate", ar: "صحن شاورما" },
    description: {
      en: "Large serving with rice, salad, and garlic sauce",
      ar: "حصة كبيرة مع أرز وسلطة وصلصة الثوم",
    },
    price: 22.0,
    image: "/shawarma-plate-with-rice.jpg",
    category: "plates",
    available: true,
  },
  {
    name: { en: "Hummus Bowl", ar: "صحن حمص" },
    description: {
      en: "Creamy hummus with olive oil and pita bread",
      ar: "حمص كريمي مع زيت الزيتون وخبز البيتا",
    },
    price: 8.0,
    image: "/hummus-bowl.jpg",
    category: "sides",
    available: true,
  },
]

async function seedMenu() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    // Note: You need to create a Menu model first
    // const Menu = require('../models/Menu');
    // await Menu.deleteMany({});
    // await Menu.insertMany(menuItems);

    console.log("✅ Menu items seeded successfully!")
    console.log("Total items:", menuItems.length)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding menu:", error)
    process.exit(1)
  }
}

// Uncomment to run: node backend/scripts/menuSeeder.js
// seedMenu();

module.exports = menuItems
