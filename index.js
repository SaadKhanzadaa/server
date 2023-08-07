const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const db = require("./key").mongoURI;
const User = require("./models/user");
const Donation = require("./models/donation");
const jwt = require("jsonwebtoken");
const donateMedicine = require("../../Blockchain Backend/functions/connections");
const bcrypt = require("bcrypt");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv"); // load the env file
const cloudinary = require("./utils/cloudinary");
// const upload= require('./utils/multer')

dotenv.config();
app.use(fileUpload());
app.use(cors());
app.use(express.json());

try {
  mongoose.connect(db).then(() => {
    console.log("Mongo Atlas connected....");
  });
} catch (err) {
  console.log(err);
}

//port for google cloud
// const PORT=process.env.PORT ||8800;
// var server =app.listen(PORT,function(){
// console.log("app running on the port:"+PORT);
// })




app.listen(1999, () => {
  console.log("App running on 1999");
});
//port for google cloud
const PORT=process.env.PORT ||8800;
var server =app.listen(PORT,function(){
console.log("app running on the port:"+PORT);
})




app.post("/api/register", async (req, res) => {
  console.log("body", req.body);

  try {
    const Hashpassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      cnic: req.body.cnic,
      age: req.body.age,
      userType: req.body.userType,
      password: Hashpassword,
    });
    res.json({ status: "ok" });
  } catch (err) {
    res.json({ status: "error", error: "Signup Failed" });
  }
});

//donating Medicine
app.post("/api/donate", async (req, res) => {
  console.log("donate medicine body", req.body);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: "No files were uploaded." });
  }

  // Get the image files from the request
  const cnicFrontImage = req.files.cnicFrontImage;
  const cnicBackImage = req.files.cnicBackImage;
  var cnicFrontImageResult = null;
  var cnicBackImageResult = null;
  try {
    // Upload CNIC back image to Cloudinary
    let b64 = Buffer.from(cnicFrontImage.data).toString("base64");
    let dataURI = "data:" + cnicFrontImage.mimetype + ";base64," + b64;

    cnicFrontImageResult = await cloudinary.uploader.upload(
      dataURI,
      { folder: "cnic_images" },
      (error, result) => {
        if (error) {
          console.error("Error uploading cnicFrontImage to Cloudinary:", error);
        } else {
          console.log("cnicFrontImage uploaded successfully:", result);
          // Save the result.secure_url or result.public_id in your database for future reference if needed
        }
      }
    );
    b64 = Buffer.from(cnicBackImage.data).toString("base64");
    dataURI = "data:" + cnicBackImage.mimetype + ";base64," + b64;

    cnicBackImageResult = await cloudinary.uploader.upload(
      dataURI,
      { folder: "cnic_images" },
      (error, result) => {
        if (error) {
          console.error("Error uploading cnicBackImage to Cloudinary:", error);
        } else {
          console.log("cnicBackImage uploaded successfully:", result);
          // Save the result.secure_url or result.public_id in your database for future reference if needed
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
  if (cnicFrontImageResult == null  || cnicBackImageResult == null) return;

  // Create new Donation document with the image data and save it in the database
  try {
    const donation = new Donation({
      medicineName: req.body.medicineName,
      expiryDate: req.body.expiryDate,
      quantity: req.body.quantity,
      donorName: req.body.donorName,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
      email: req.body.email,
      cnicFrontImage: {
        public_id: cnicFrontImageResult.public_id,
        secure_url: cnicFrontImageResult.secure_url,
      },
      cnicBackImage: {
        public_id: cnicBackImageResult.public_id,
        secure_url: cnicBackImageResult.secure_url,
      },
      status:"pending"
    });

    await donation.save();
    res.json({ message: "Donation data and images uploaded successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error uploading donation data and images." });
  }
});

//login code

app.post("/api/login", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    console.log("user", user);

    if (!user || user == null) {
      return { status: "error", user: false };
    }

    const isPasswordvalid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (isPasswordvalid) {
      const token = jwt.sign(
        {
          name: req.body.name,
          email: req.body.email,
        },
        "secret123"
      );

      return res.json({
        status: "ok : User Logged in Sucesfullly",
        user: token,
      });
    } else {
      return res.json({ status: "error", user: false });
    }
  } catch (err) {
    res.json({ status: "error" });
  }
});

app.get("/api/dashboard", async (req, res) => {
  const token = req.header("x-access-token");
  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    const user = await User.findOne({ email: email });
    console.log("user for dashbaoard", user);
    return res.json({ status: "ok", user: user });
  } catch (err) {
    return res.json({ status: "Error ! invalid token" });
  }
});

// app.get('/api/medicines', async (req, res) => {
//   try {
//     // Fetch all documents from the Donation collection
//     const donations = await Donation.find().lean();
//     console.log('yeahh abbay')

//     // Send the donation data in the response
//     res.json(donations);
//   } catch (error) {
//     console.error('Error fetching medicine data:', error);
//     res.status(500).json({ error: 'Error fetching medicine data from the database.' });
//   }
// });

//fetching data of  medicine(donation)

app.get("/api/medicineRecord", async (req, res) => {
  const token = req.header("x-access-token");
  try {
    const DonationData = await Donation.find();
    console.log("Donation Data for dashbaoard", DonationData);
    return res.json({ status: "ok", DonationData: DonationData });
  } catch (err) {
    return res.json({ status: "Error ! invalid token" });
  }
});

//connecting blockchain backend
app.post("/api/upload-on-blockchain", async (req, res) => {
  console.log("Blockchain TRX Data", req.body);
  try {
    const trxData = await donateMedicine({
      name: req.name,
      manufacturer: req.manufacturer,
      batchNumber: req.batchNumber,
      expirationDate: req.expirationDate,
      donorEmail: req.donorEmail,
      acceptorEmail: req.acceptorEmail,
    });
    console.log("trx Data on Server:::", trxData);

    return res.json({ status: "ok", trxHash: trxData.transactionHash });
  } catch (err) {
    return res.json({ status: "Error ! " + err });
  }
});



//admin changing Status of donated Medicine 



