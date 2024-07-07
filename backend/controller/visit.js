const express = require("express");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Deliverer = require("../model/deliverer");
const Visit = require("../model/visit");
const router = express.Router();
const dayjs = require("dayjs");
const OverallStats = require("../model/overallStats");
const Contractor = require("../model/contractor");

const { default: mongoose } = require("mongoose");
const { google, cloudresourcemanager_v1 } = require("googleapis");
const contractor = require("../model/contractor");
const sendMail = require("../utils/sendMail");
require("dotenv").config();

//const credentials = require("../credentials.json");

const spreadsheetId = "1LOMYFgnjSyZ4g_yABahnh6kntZltgqw5Vs6MT-GEDFA";

//counting the number of downloads

async function accessGoogleSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "controller/credentials.json", // Path to your service account key file.
    scopes: ["https://www.googleapis.com/auth/spreadsheets"], // Scope for Google Sheets API.
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth });

  async function readSheetData() {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A2:02",
    });
    const values = response.data.values;
    console.log(values);
  }

  async function writeSheetData(values1) {
    const formattedTimeIn = dayjs(values1.timeIn)
      .add(2, "hour")
      .format("YYYY-MM-DD HH:mm:ss");
    const formattedTimeOut = dayjs(values1.timeOut)
      .add(2, "hour")
      .format("YYYY-MM-DD HH:mm:ss");

    //console.log("Trade Comp Id, " ,values1.tradeCompanyId)

    const values = [
      [
        values1.tradeCompanyId.tin,
        values1.tradeCompanyId.tradeName,
        values1.email,
        values1.phoneNumber,
        formattedTimeIn,
        formattedTimeOut,
        values1.reasonForVisit,
        values1.ticketNumber,
        values1.status,
      ],
    ];
    const resource = {
      values,
    };

    console.log("resources", resource);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A2:G2",
      valueInputOption: "USER_ENTERED",
      resource,
    });
    console.log(`${response.data.updatedCells} cells updated`);

    readSheetData();
  }
  // ...
  // update visit info
  router.put(
    "/update-visit",
    isAuthenticated,
    //upload.single("file"),
    catchAsyncErrors(async (req, res, next) => {
      try {
        const {
          visitId,
          tradeCompanyId,
          contactPersonId,
          timeIn,
          timeOut,
          email,
          phoneNumber,
          regNumber,
          reasonForVisit,
          ticketNumber,
          status,
          companyId,
        } = req.body;

        console.log(visitId);
        console.log(req.body);

        let bulkOverallStats = [];

        const visit = await Visit.findById(visitId);
        const contractor = await Contractor.findById(tradeCompanyId);

        if (!visit) {
          return next(new ErrorHandler("Visit not found", 400));
        }
        if (!visitId) {
          return next(new ErrorHandler("Visit Id is required"));
        }

        visit.tradeCompanyId = tradeCompanyId;
        visit.email = email;
        visit.phoneNumber = phoneNumber;
        visit.regNumber = regNumber;
        visit.timeIn = timeIn;
        visit.timeOut = timeOut;
        visit.reasonForVisit = reasonForVisit;
        visit.ticketNumber = ticketNumber;
        visit.status = status;
        visit.contactPersonId = contactPersonId;

        await visit.save();

        const date = new Date(timeIn);

        year = date.getFullYear();
        const month = date.toLocaleString("default", { month: "long" }); // Get month name

        //const currentDate = date.getDate();

        const day = String(date.getDate()).padStart(2, "0"); // Get the day component and pad with leading zero if necessary
        const monthNumber = String(date.getMonth() + 1).padStart(2, "0"); // Get the month component and pad with leading zero if necessary

        const formattedDate = `${year}-${monthNumber}-${day}`;
        console.log(formattedDate);

        //START OF THE bulkOverallStats UPDATING
        console.log("timeOut", timeOut);
        if (timeOut.length !== 0) {
          bulkOverallStats.push({
            updateOne: {
              filter: { companyId, year },
              update: {
                $inc: {
                  //yearlyVisits: 1,
                  // yearlyJobs: 1, // Increment yearlyJobs by 1
                },
                $setOnInsert: {
                  monthlyData: [],
                  dailyData: [],
                  yearlyVisits: 1,
                  [`visitsByContractor.${contractor.taxPayerName}`]: 1,

                  // totalContractors: totalContractors,
                },
              },
              upsert: true,
            },
          });

          bulkOverallStats.push({
            updateOne: {
              filter: { companyId, year, "monthlyData.month": month },
              update: {
                $inc: {
                  yearlyVisits: 0,
                  [`visitsByContractor.${contractor.taxPayerName}`]: 1,

                  "monthlyData.$.totalVisits": 0,
                  "monthlyData.$.totalAssisted": status === "assisted" ? 1 : 0,
                  "monthlyData.$.totalPending": status === "pending" ? 1 : 0,
                },

                arrayFilters: [{ "elem.month": month }],
              },
            },
          });

          bulkOverallStats.push({
            updateOne: {
              filter: { companyId, year, "monthlyData.month": { $ne: month } },
              update: {
                $push: {
                  monthlyData: {
                    $each: [
                      {
                        month,
                        totalVisits: 0,
                        totalAssisted: status === "assisted" ? 1 : 0,
                        totalPending: status === "pending" ? 1 : 0,
                      },
                    ],
                    $sort: { month: -1 },
                  },
                },
              },
            },
          });
          //Updating the daily data and soring
          bulkOverallStats.push({
            updateOne: {
              filter: { companyId, year, "dailyData.date": formattedDate },
              update: {
                $inc: {
                  "dailyData.$.totalVisits": 0,
                  "dailyData.$.totalAssisted": status === "assisted" ? 1 : 0,
                  "dailyData.$.totalPending": status === "pending" ? 1 : 0,
                },
              },
            },
          });

          bulkOverallStats.push({
            updateOne: {
              filter: {
                companyId,
                year,
                "dailyData.date": { $ne: formattedDate },
              },
              update: {
                $push: {
                  dailyData: {
                    $each: [
                      {
                        date: formattedDate,
                        totalVisits: 0,
                        totalAssisted: status === "assisted" ? 1 : 0,
                        totalPending: status === "pending" ? 1 : 0,
                      },
                    ],
                    $sort: { date: -1 },
                  },
                },
              },
            },
          });

          await OverallStats.bulkWrite(bulkOverallStats);
          //   const timeOutFormatted = dayjs(req.body.timeOut).format("YYYY-MM-DD HH:mm:ss");

          writeSheetData(req.body);

          //writing the email to notify the client

          try {
            await sendMail({
              email: email,
              subject: "Thank you for visiting Axis Solutions!",
              message: `Dear ${contractor.taxPayerName}. We hope you received the 5 star service that you deserve! Travel safe and see you soon!  `,
            });
          } catch (error) {
            return next(new ErrorHandler(error.message, 500));
          }
        }
        res.status(201).json({
          success: true,
          visit,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );
}

accessGoogleSheet();

//creating the visit
router.post(
  "/create-visit",
  //isAuthenticated,
  //catchAsyncErrors
  upload.single("file"),
  async (req, res, next) => {
    try {
      let {
        tradeCompanyId,
        email,
        phoneNumber,
        regNumber,
        timeIn,
        timeOut,
        reasonForVisit,
        status,
        ticketNumber,
        contactPersonId,
        companyId,
        tin,
        tradeName,
      } = req.body;

      console.log("tin", tin);
      console.log("tradeName", tradeName);

      console.log(req.body);
      //const checkClient = await Contractor.findOne({tin})
      const bulkOverallStats = [];

      const isCompanyDeliverer = await Deliverer.findById(companyId);
      let existingContractor;
      if (tradeCompanyId !== "undefined") {
        existingContractor = await Contractor.findById(tradeCompanyId);
      }

      if (tin !== undefined && tradeName !== undefined) {
        let addCompany = await Contractor.create({
          tradeName: tradeName,
          taxPayerName: tradeName,
          tin: tin,
        });
        console.log(addCompany);

        if (isCompanyDeliverer) {
          isCompanyDeliverer.contractor_ids.push(addCompany._id);
          tradeCompanyId = addCompany._id;
          existingContractor = addCompany;
        }
      }

      const totalContractors = isCompanyDeliverer.contractor_ids.length;
      console.log(totalContractors);

      let year;

      const date = new Date(timeIn);

      year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" }); // Get month name

      //const currentDate = date.getDate();

      const day = String(date.getDate()).padStart(2, "0"); // Get the day component and pad with leading zero if necessary
      const monthNumber = String(date.getMonth() + 1).padStart(2, "0"); // Get the month component and pad with leading zero if necessary

      const formattedDate = `${year}-${monthNumber}-${day}`;
      console.log(formattedDate);

      // console.log("current date",currentDate)

      console.log("month", month);
      console.log("contractor name", existingContractor.taxPayerName);

      // if(checkClient){

      //}

      console.log("Trade Comp Id", tradeCompanyId);

      let createVisit = await Visit.create({
        contractorId: tradeCompanyId,
        contactPersonId: contactPersonId,
        phoneNumber: phoneNumber,
        regNumber: regNumber,
        timeIn: timeIn,
        timeOut: timeOut,
        reasonForVisit: reasonForVisit,
        ticketNumber: ticketNumber,
        email: email,
        status: status,
      });

      if (isCompanyDeliverer) {
        isCompanyDeliverer.visit_ids.push(createVisit._id);
        await isCompanyDeliverer.save();
      }

      //START OF THE bulkOverallStats UPDATING

      bulkOverallStats.push({
        updateOne: {
          filter: { companyId, year },
          update: {
            $inc: {
              //yearlyVisits: 1,
              //   [`visitsByContractor.${existingContractor.taxPayerName}`]: 1,
              // yearlyJobs: 1, // Increment yearlyJobs by 1
            },
            $setOnInsert: {
              monthlyData: [],
              dailyData: [],
              yearlyVisits: 1,
              //  [`visitsByContractor.${contractor.taxPayerName}`]: 1,
              totalContractors: totalContractors,
            },
          },
          upsert: true,
        },
      });

      bulkOverallStats.push({
        updateOne: {
          filter: { companyId, year, "monthlyData.month": month },
          update: {
            totalContractors: totalContractors,
            $inc: {
              yearlyVisits: 1,
              //   [`visitsByContractor.${contractor.taxPayerName}`]: 1,

              "monthlyData.$.totalVisits": 1,
              "monthlyData.$.totalAssisted": 0,
              "monthlyData.$.totalPending": 0,
            },

            arrayFilters: [{ "elem.month": month }],
          },
        },
      });

      bulkOverallStats.push({
        updateOne: {
          filter: { companyId, year, "monthlyData.month": { $ne: month } },
          update: {
            $push: {
              monthlyData: {
                $each: [
                  {
                    month,
                    totalVisits: 1,
                    totalAssisted: 0,
                    totalPending: 0,
                  },
                ],
                $sort: { month: -1 },
              },
            },
          },
        },
      });
      //Updating the daily data and soring
      bulkOverallStats.push({
        updateOne: {
          filter: { companyId, year, "dailyData.date": formattedDate },
          update: {
            $inc: {
              "dailyData.$.totalVisits": 1,
              "dailyData.$.totalAssisted": 0,
              "dailyData.$.totalPending": 0,
            },
          },
        },
      });

      bulkOverallStats.push({
        updateOne: {
          filter: {
            companyId,
            year,
            "dailyData.date": { $ne: formattedDate },
          },
          update: {
            $push: {
              dailyData: {
                $each: [
                  {
                    date: formattedDate,
                    totalVisits: 1,
                    totalAssisted: 0,
                    totalPending: 0,
                  },
                ],
                $sort: { date: -1 }, //date name that is in the model
              },
            },
          },
        },
      });

      await OverallStats.bulkWrite(bulkOverallStats);

      if (createVisit) {
        res.status(201).json({
          success: true,
          message: "Visit created successfully!",
        });

        writeSheetData(req.body);
      } else {
        res.status(500).json({
          success: false,
          message: "Error occurred while creating visit",
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get all visits for deliverer
router.get(
  "/get-all-visits-company",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      //1. find out if the user is deliverer or supplier
      const deliverer = await Deliverer.findById(req.user.companyId);

      // check to see if deliverer
      if (!deliverer) {
        // const contractor = await Contractor.findById(req.user.id);
        return next(new ErrorHandler("Herer we are", 400));
      }

      //2.Getting the array of the visits for the deliverer

      const delivererWithVisits = await Deliverer.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.user.companyId) } },

        {
          $lookup: {
            from: "visits",
            let: { visitIds: "$visit_ids" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$visitIds"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,

                  address: 1,
                },
              },
            ],
            as: "visits",
          },
        },

        {
          $project: {
            visits: 1,
          },
        },
      ]);
      if (delivererWithVisits.length === 0) {
        res.status(201).json({
          success: true,
          message: "No visit in the system",
        });
      }

      res.status(201).json({
        success: true,
        delivererWithVisits,
      });

      // Display the info about the particular Visits for the deliverer
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//get all the Visits for the Visits Page
router.get(
  "/get-all-visits-page",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let {
        page = 0,
        pageSize = 25,
        sort = null,
        sortField = "_id",
        sortOrder = "desc",
        search = "",
      } = req.query;

      // Formatted sort should look like { field: 1 } or { field: -1 }
      const generateSort = () => {
        const sortParsed = JSON.parse(sort);
        const sortOptions = {
          [sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1,
        };

        return sortOptions;
      };

      const sortOptions = Boolean(sort) ? generateSort() : {};

      // Find the deliverer based on the company ID
      const deliverer = await Deliverer.findById(req.user.companyId);
      if (!deliverer) {
        return res.status(404).json({
          success: false,
          message: "Deliverer not found",
        });
      }

      console.log(deliverer, "deliverer");
      // Get the visit IDs associated with the deliverer
      const visitIds = deliverer.visit_ids;

      //creating the aggreagate call

      // Update the pipeline with the revised $match stage
      const pipeline = [
        { $match: { _id: { $in: visitIds } } },

        {
          $lookup: {
            from: "contractors",
            let: { contractorId: "$contractorId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$contractorId"] } } },
              { $project: { tradeName: 1, tin: 1, contactPersons: 1 } },
            ],
            as: "contractorId",
          },
        },
        { $unwind: "$contractorId" },
        {
          $match: {
            $or: [
              {
                "contractorId.tradeName": {
                  $regex: `.*${search}.*`,
                  $options: "i",
                },
              },
              { timeIn: { $regex: `.*${search}.*`, $options: "i" } },
              { ticketNumber: { $regex: `.*${search}.*`, $options: "i" } },
              { status: { $regex: `.*${search}.*`, $options: "i" } },

              // Add more conditions as needed
            ],
          },
        },
        { $sort: { timeIn: -1 } }, // Sort by orderDate in descending order

        { $skip: page * parseInt(pageSize, 10) },

        { $limit: parseInt(pageSize, 10) },
        { $sort: sortOptions },
      ];

      // Execute the aggregation pipeline
      const pageVisits = await Visit.aggregate(pipeline);
      //console.log("pageVisits",pageVisits)

      if (pageVisits.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No visits in the system",
        });
      }

      // console.log("page Visits", pageVisits);
      // Get the total count of jobs
      const totalCount = await Visit.countDocuments({
        _id: { $in: visitIds },
      });

      res.status(200).json({
        success: true,
        pageVisits,
        totalCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//delete visit
router.delete(
  "/delete-visit/:visitId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const visitId = req.params.visitId;

      const findVisit = await Visit.findById(visitId);

      console.log(findVisit);

      if (findVisit) {
        const visitDate = findVisit.timeOut;
        const visitStatus = findVisit.status;
        const contractorId = findVisit.contractorId;

        console.log("visitStatus", visitStatus.toLocaleString());
        //getting the taxPayerName for the contractor

        const deliverer = await Deliverer.findById(req.user.companyId);

        const contractorDetails = await Contractor.findById(contractorId);
        if (!contractorDetails) {
          return next(new ErrorHandler("Failed to find the contractor", 400));
        }

        year = visitDate.getFullYear();
        const month = visitDate.toLocaleString("default", { month: "long" }); // Get month name

        //const currentDate = date.getDate();

        const day = String(visitDate.getDate()).padStart(2, "0"); // Get the day component and pad with leading zero if necessary
        const monthNumber = String(visitDate.getMonth() + 1).padStart(2, "0"); // Get the month component and pad with leading zero if necessary

        const formattedDate = `${year}-${monthNumber}-${day}`;

        const overallStats = await OverallStats.findOne({
          companyId: req.user.companyId,
        });
        console.log("overallStats starts here", overallStats);

        if (overallStats) {
          const dailyStatsToUpdate = overallStats.dailyData.find(
            (item) => item.date === formattedDate
          );
          const monthlyStatsToUpdate = overallStats.monthlyData.find(
            (item) => item.month === month
          );
          const visitsByContractorStatsToUpdate =
            overallStats.visitsByContractor;

          const yearlystatsUpdate = (overallStats.yearlyVisits -= 1);

          // console.log("Updated Yearly", yearlystatsUpdate);

          const contractorEntry = Array.from(
            visitsByContractorStatsToUpdate.entries()
          ).find(([key]) => key === contractorDetails.taxPayerName);

          console.log("visits by contractor", visitsByContractorStatsToUpdate);
          console.log("taxpayer name", contractorDetails.taxPayerName);
          console.log("contractor entry", contractorEntry);
          if (contractorEntry) {
            const [key, contractorValue] = contractorEntry;
            console.log("contractor to update", contractorValue);

            visitsByContractorStatsToUpdate.set(key, contractorValue - 1);
            console.log(
              "updated contractor value",
              visitsByContractorStatsToUpdate.get(key)
            );
          }

          if (dailyStatsToUpdate) {
            dailyStatsToUpdate.totalVisits -= 1;
            if (visitStatus === "pending") {
              dailyStatsToUpdate.totalPending -= 1;
            }
            if (visitStatus === "assisted") {
              dailyStatsToUpdate.totalAssisted -= 1;
            }
          }
          if (monthlyStatsToUpdate) {
            monthlyStatsToUpdate.totalVisits -= 1;
            if (visitStatus === "pending") {
              monthlyStatsToUpdate.totalPending -= 1;
            }
            if (visitStatus === "assisted") {
              monthlyStatsToUpdate.totalAssisted -= 1;
            }
          }
        }

        await overallStats.save();
        // Remove the visitId from the deliverer's array of visitIds
        const updatedVisitIds = deliverer.visit_ids.filter(
          (id) => id.toString() !== visitId
        );

        // Update the deliverer's visitIds array with the updated array
        deliverer.visit_ids = updatedVisitIds;
        await deliverer.save();

        const visit = await Visit.deleteOne({ _id: visitId });
        if (!visit) {
          return next(new ErrorHandler("There is no visit with this id", 500));
        }
      }

      res.status(201).json({
        success: true,
        message: "Visit Deleted!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

//get all the Visits for the Visits Page
router.get(
  "/get-latest-visits-deliverer",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let {
        page = 0,
        pageSize = 25,
        sort = null,
        sortField = "_id",
        sortOrder = "desc",
        search = "",
      } = req.query;

      // Formatted sort should look like { field: 1 } or { field: -1 }
      const generateSort = () => {
        const sortParsed = JSON.parse(sort);
        const sortOptions = {
          [sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1,
        };

        return sortOptions;
      };

      const sortOptions = Boolean(sort) ? generateSort() : { timeIn: -1 };

      // Find the deliverer based on the company ID
      const deliverer = await Deliverer.findById(req.user.companyId);
      if (!deliverer) {
        return res.status(404).json({
          success: false,
          message: "Deliverer not found",
        });
      }

      // Get the visit IDs associated with the deliverer
      const visitIds = deliverer.visit_ids;

      //creating the aggreagate call

      // Update the pipeline with the revised $match stage
      const pipeline = [
        { $match: { _id: { $in: visitIds } } },

        {
          $lookup: {
            from: "contractors",
            let: { contractorId: "$contractorId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$contractorId"] } } },
              { $project: { tradeName: 1, tin: 1 } },
            ],
            as: "contractorId",
          },
        },
        { $unwind: "$contractorId" },
        {
          $match: {
            $or: [
              {
                "contractorId.tradeName": {
                  $regex: `.*${search}.*`,
                  $options: "i",
                },
              },
              { timeIn: { $regex: `.*${search}.*`, $options: "i" } },
              { ticketNumber: { $regex: `.*${search}.*`, $options: "i" } },
              { status: { $regex: `.*${search}.*`, $options: "i" } },

              // Add more conditions as needed
            ],
          },
        },
        { $sort: { timeIn: -1 } }, // Sort by orderDate in descending order
        { $limit: 5 }, // Limit the results to 5 jobs
        { $sort: sortOptions }, // Apply the requested sort options
      ];

      // console.log(pageVisits)
      // Execute the aggregation pipeline
      const latestDelivererVisits = await Visit.aggregate(pipeline);
      if (latestDelivererVisits.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No visits in the system",
        });
      }

      // console.log("page Visits", pageVisits);
      // Get the total count of jobs
      const totalCount = await Visit.countDocuments({
        _id: { $in: visitIds },
      });

      res.status(200).json({
        success: true,
        latestDelivererVisits,
        totalCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
