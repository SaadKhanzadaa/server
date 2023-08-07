const mongoose = require('mongoose');

const AcceptedSchema = new mongoose.Schema({
  AcceptorName: { type: String, required: true },
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
  DonatedMedicine_id:{type:String, required:true}
}, { collection: "Accepted-medicine-data" });

const AcceptMedicine = mongoose.model('DonatedMedicineData', AcceptedSchema);

module.exports = AcceptMedicine;
