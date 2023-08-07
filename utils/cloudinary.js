const cloudinary= require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.Cloudinary_name,
    api_key:process.env.Cloudinary_API_KEY ,
    api_secret: process.env.Cloudinary_API_SECRET,
  });
  
module.exports=cloudinary;  