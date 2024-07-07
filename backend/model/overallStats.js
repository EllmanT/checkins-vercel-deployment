const mongoose = require("mongoose");

const overallStatsSchema = mongoose.Schema({
  yearlyVisits: {
    type: Number,
  },
 

  year: {
    type: Number,
  },

  monthlyData: [
    {
      month: String,
      totalVisits: Number,
      totalAssisted: Number,
      totalPending: Number,
      
    },
  ],
  dailyData: [
    {
      date: String,
      totalVisits: Number,
      totalAssisted: Number,
      totalPending: Number,
    },
  ],


  totalContractors: {
    type: Number,
  },


  visitsByContractor: {
    type: Map,
    of: Number,
  },

  companyId: { type: mongoose.Types.ObjectId, ref: "Deliverer" },
}, { timestamps: true });

module.exports = mongoose.model("overallStats", overallStatsSchema);
