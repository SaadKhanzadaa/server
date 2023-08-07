const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  donorName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: false},
  cnicFrontImage: {
    public_id: { type: String, required: true },
    secure_url:{ type: String, required: true },
  },
  cnicBackImage: {

    public_id: { type: String, required: true },
    secure_url:{ type: String, required: true },

  },
  status:{type:String, required: true}
}, { collection: "donation-medicine-data" });

const Donation = mongoose.model('DonatedMedicineData', DonationSchema);

module.exports = Donation;
