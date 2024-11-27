const express = require('express');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(cors());

// Middleware to parse JSON request body
app.use(express.json());

// MongoDB connection URI and database details
const uri = process.env.MONGO_URI || "mongodb+srv://dilanjan:dilanjan@sp.e5bvk.mongodb.net/?retryWrites=true&w=majority&appName=sp";
const client = new MongoClient(uri);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service provider
  auth: {
    user: process.env.EMAIL_USER || 'lucky1blog@gmail.com', // Replace with your email
    pass: process.env.EMAIL_PASS || 'pboy axqm cakk pplg', // Replace with your email password or app-specific password
  },
});

// Connect to MongoDB
let customerCollection;
async function connectDB() {
  try {
    await client.connect();
    const database = client.db("my_database"); // Replace with your database name
    customerCollection = database.collection("customers"); // Replace with your collection name
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

connectDB();

// API endpoint to test the server
app.get('/', (req, res) => {
  res.send('Hi Node');
});

// API to store customer data and send email
app.post('/api/customer', async (req, res) => {
  try {
    const { Mobile, Name } = req.body;

    if (!Mobile || !Name) {
      return res.status(400).json({ message: 'Mobile and Name are required.' });
    }

    // Save to MongoDB
    const result = await customerCollection.insertOne({ Mobile, Name });

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'lucky1blog@gmail.com', // Sender address
      to: 'kasun@sportway.lk', // Replace with the recipient email
      subject: 'New Customer Submission',
      text: `A new customer has submitted their details:\n\nName: ${Name}\nMobile: ${Mobile}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error while sending email:', error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });

    res.status(201).json({ message: 'Customer added and email sent successfully!', customerId: result.insertedId });
  } catch (error) {
    console.error('Error while saving customer or sending email:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});


