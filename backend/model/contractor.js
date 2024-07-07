const mongoose = require("mongoose");

const contractorSchema = new mongoose.Schema(
  {
    tradeName: {
      type: String,
      //required: true,
    },
   taxPayerName : {
      type: String,
    },
    tin: {
      type: String,
    },
    vat: {
      type: String,
      
    },
    region: {
      type: String,
      //required: true,
    },
    station: {
      type: String,
      //default: 1,
    },
    province: {
      type: String,
      //required: true,
    },

    city: {
      type: String,
      //required: true,
    },

    street: {
      type: String,
      //required: true,
    },

    houseNo: {
      type: String,
    },
    contactName: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactPersons: [
      {
        contactName: String,
        phoneNumber: String,
        email: String,        
      },
    ],
    deviceType: {
      type: String,
    },
    serialNumber: {
      type: String,
    },

    //to update to visits
    visit_Ids: {
      type: [mongoose.Types.ObjectId],
      ref: "Visit",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Contractor", contractorSchema);
