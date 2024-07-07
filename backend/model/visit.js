const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
   
   
    email: {
      type: String,
    },
 

    phoneNumber: {
      type: String,
     // required: true,
    },
    regNumber:{
      type:String,
      required:true,
    },
  
    timeIn: {
      type: Date,
      required: true,
    },
    timeOut: {
      type: Date,
   //   required: true,
    },
    reasonForVisit:{
      type:String,
    },
  
    ticketNumber: {
      type: String,
      //required: true,
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true,
    },
    contactPersonId:{
      type:String,
    },

    status:{
      type:String,
      
    }
  
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
