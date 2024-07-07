const mongoose = require("mongoose");

const ContractorStatsSchema = new mongoose.Schema({
  contractorId: String,
  delivererId: String,
  yearlyJobs: {
    type: Number,
  },
  yearlyMileage: {
    type: Number,
  },
  yearlyRevenue: {
    type: Number,
  },

  year: {
    type: Number,
  },
  monthlyData: [
    {
      month: String,
      totalMileage: Number,
      totalRevenue: Number,

      totalJobs: Number,
    },
  ],
  dailyData: [
    {
      date: String,
      totalMileage: Number,
      totalRevenue: Number,
      totalJobs: Number,
    },
  ],
  job_ids: {
    type: [mongoose.Types.ObjectId],
    ref: "Job",
  },
}, { timestamps: true });

module.exports = mongoose.model("ContractorStats", ContractorStatsSchema);
