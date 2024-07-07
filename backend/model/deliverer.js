const mongoose = require("mongoose");

const delivererSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
  
  
  
    visit_ids: {
      type: [mongoose.Types.ObjectId],
      ref: "Visit",
    },
    customer_ids: {
      type: [mongoose.Types.ObjectId],
      ref: "Customer",
    },
    contractor_ids: {
      type: [mongoose.Types.ObjectId],
      ref: "Contractor",
    },
    admin_ids: {
      type: [mongoose.Types.ObjectId],
      ref: "Admin",
    },
   
  
  
   
   
  },
  { timestamps: true }
);
module.exports = mongoose.model("Deliverer", delivererSchema);
``;
