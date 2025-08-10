// seed.js for Shyaam Electronics Seller Database
const mysql = require("mysql2/promise");
require("dotenv").config(); // Ensure dotenv is configured to load your .env file

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Indian-origin product data
const products = [
  {
    sku: "SMARTPHONE-XY2",
    name: "Redmi Note 13 Pro 5G",
    image_url: "https://shyam-electronics.in/images/redmi-note-13-pro.jpg",
    price: 24999.0,
  },
  {
    sku: "LAPTOP-ALPHA",
    name: "Dell Inspiron 15 (i5-12th Gen)",
    image_url: "https://shyam-electronics.in/images/dell-inspiron-15.jpg",
    price: 65500.0,
  },
  {
    sku: "AC-INVERTER-1.5T",
    name: "Voltas 1.5 Ton 5 Star Inverter AC",
    image_url: "https://shyam-electronics.in/images/voltas-ac.jpg",
    price: 42000.0,
  },
  {
    sku: "FRIDGE-DD-300L",
    name: "Samsung 300L Double Door Refrigerator",
    image_url: "https://shyam-electronics.in/images/samsung-fridge.jpg",
    price: 32500.0,
  },
];

// Indian-origin order data, including the one for our test customer
const orders = [
  {
    order_id: "SHE-ORD-2024-5001",
    customer_name: "Neha Singh",
    customer_phone_number: "+919876543210", // THIS MUST MATCH THE PHONE IN SMJ CUSTOMER REGISTRATION
    product_price: 24999.0,
    date_of_purchase: "2024-07-20", // This date will be used for product registration
    warranty_period_months: 12,
    seller_internal_product_sku: "SMARTPHONE-XY2",
  },
  {
    order_id: "SHE-ORD-2024-5002",
    customer_name: "Amit Kumar",
    customer_phone_number: "+919012345678",
    product_price: 65500.0,
    date_of_purchase: "2024-06-15",
    warranty_period_months: 24,
    seller_internal_product_sku: "LAPTOP-ALPHA",
  },
  {
    order_id: "SHE-ORD-2024-5003",
    customer_name: "Pooja Gupta",
    customer_phone_number: "+918877665544",
    product_price: 42000.0,
    date_of_purchase: "2024-05-01",
    warranty_period_months: 60, // 5 years
    seller_internal_product_sku: "AC-INVERTER-1.5T",
  },
];

async function seedDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Connected to the database.");

    await connection.beginTransaction();
    console.log("Transaction started.");

    // Temporarily disable foreign key checks to truncate tables
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("TRUNCATE TABLE seller_orders;");
    await connection.query("TRUNCATE TABLE seller_products;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("Tables truncated.");

    // Seed products
    const [productResult] = await connection.query(
      "INSERT INTO seller_products (sku, name, image_url, price) VALUES ?",
      [products.map((p) => [p.sku, p.name, p.image_url, p.price])]
    );
    console.log(`Seeded ${productResult.affectedRows} products.`);

    // Seed orders
    const [orderResult] = await connection.query(
      "INSERT INTO seller_orders (order_id, customer_name, customer_phone_number, product_price, date_of_purchase, warranty_period_months, seller_internal_product_sku) VALUES ?",
      [
        orders.map((o) => [
          o.order_id,
          o.customer_name,
          o.customer_phone_number,
          o.product_price,
          o.date_of_purchase,
          o.warranty_period_months,
          o.seller_internal_product_sku,
        ]),
      ]
    );
    console.log(`Seeded ${orderResult.affectedRows} orders.`);

    await connection.commit();
    console.log("Transaction committed successfully!");
  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.error("Transaction rolled back due to an error:", error);
    } else {
      console.error("Error during seeding:", error);
    }
  } finally {
    if (connection) pool.end(); // Close the pool after seeding
    if (connection) connection.release(); // Ensure connection is released even if pool ends later
  }
}

seedDatabase();
