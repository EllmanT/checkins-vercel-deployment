const express = require("express");
const Contractor = require("../model/contractor");
const { upload } = require("../multer");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Deliverer = require("../model/deliverer");
const { default: mongoose } = require("mongoose");
const { google } = require("googleapis");
const db = mongoose.connection; // Obtain the db object from Mongoose
const Visit = require("../model/visit");

//const credentials = require("../credentials.json");

const spreadsheetId = "16u0V_zisUTJQKd8oY-3-KE6d2vh64YjWFu2V4vmczRg";

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
    const values = [
      [
        values1.companyName,
        values1.taxPayerName,
        values1.tin,
        values1.vat,
        values1.region,
        values1.station,
        values1.province,
        values1.city,
        values1.street,
        values1.houseNo,
        values1.contactName,
        values1.contactNumber,
        values1.contactEmail,
        values1.deviceType,
        values1.serialNumber,
      ],
    ];
    const resource = {
      values,
    };

    console.log("resources", resource);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A2:O2",
      valueInputOption: "USER_ENTERED",
      resource,
    });
    console.log(`${response.data.updatedCells} cells updated`);

    readSheetData();
  }

  router.post("/create-contractor", upload.none(), async (req, res, next) => {
    try {
      const {
        companyName,
        taxPayerName,
        tin,
        vat,
        region,
        station,
        province,
        city,
        street,
        companyId,
        houseNo,
        contactName,
        contactNumber,
        contactEmail,
        deviceType,
        serialNumber,
      } = req.body;

      console.log(req.body);

      let checkCompany = await Contractor.findOne({
        tin: tin,
        serialNumber: serialNumber,
      });
      const isCompanyDeliverer = await Deliverer.findById(companyId);

      if (checkCompany) {
        //checking the deliverer table
        return next(
          new ErrorHandler("Company and serial number already exists", 405)
        );
      } else {
        checkCompany = await Contractor.create({
          tradeName: companyName,
          taxPayerName: taxPayerName,
          tin: tin,
          vat: vat,
          region: region,
          station: station,
          province: province,

          city: city,
          street: street,
          houseNo: houseNo,
          contactName: contactName,
          contactNumber: contactNumber,
          contactEmail: contactEmail,
          deviceType: deviceType,
          serialNumber: serialNumber,
        });

        if (isCompanyDeliverer) {
          isCompanyDeliverer.contractor_ids.push(checkCompany._id);
          await isCompanyDeliverer.save();
        }

        console.log(isCompanyDeliverer);

        res.status(201).json({
          success: true,
          message: "Client added successfully",
        });
        //pushing the data into deliverer

        // res.status(201).json({
        //   success: true,
        //    checkCompany,
        //  });

        //

        writeSheetData(req.body);
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });
}

accessGoogleSheet();

//get all contractors for deliverer
router.get(
  "/get-all-contractors-deliverer",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      //1. find out if the user is deliverer or supplier
      const deliverer = await Deliverer.findById(req.user.companyId);
      // check to see if deliverer
      if (!deliverer) {
        return next(new ErrorHandler("Login Pleaseee", 401));
      }

      const delivererWithContractors = await Deliverer.aggregate([
        //get only information about the one deliverer
        {
          $match: { _id: new mongoose.Types.ObjectId(req.user.companyId) },
        },
        {
          $lookup: {
            from: "contractors",
            let: { contractorIds: "$contractor_ids" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$contractorIds"],
                  },
                },
              },
              {
                $project: {
                  tin: 1,
                  tradeName: 1,
                },
              },
            ],
            as: "contractors",
          },
        },
        {
          $project: {
            contractors: 1,
          },
        },
      ]);
      if (delivererWithContractors.length === 0) {
        res.status(201).json({
          success: false,
          message: "no results",
        });
      }
      // Display the info about the particular contractors for the deliverer
      res.status(201).json({
        success: true,
        delivererWithContractors,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//get all contractors for deliverer
router.get(
  "/get-all-current-clients-deliverer",
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      //creating the aggreagate call

      // Update the pipeline with the revised $match stage
      const pipeline = [
        {
          $match: {
            _id: { $in: visitIds },
            timeIn: { $gte: today },
            timeOut: null,
          },
        },

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
      const delivererWithCurrentVisits = await Visit.aggregate(pipeline);
      const clientIds = delivererWithCurrentVisits.map(
        (visit) => visit.contractorId._id
      );
      console.log("ids", clientIds);

      let currentVisitIds = [];
      currentVisitIds = delivererWithCurrentVisits.map((visit) => visit._id);

      console.log("currentVisit Ids", currentVisitIds);
      //now we want to get info of the available contractors only
      const delivererWithCurrentClients = await Deliverer.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(req.user.companyId) },
        },
        {
          $lookup: {
            from: "contractors",
            let: { contractorIds: clientIds },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$contractorIds"],
                  },
                },
              },
              {
                $project: {
                  tin: 1,
                  tradeName: 1,
                  //number: 1,
                },
              },
            ],
            as: "contractors",
          },
        },
        {
          $project: {
            contractors: 1,
            currentVisitIds,
          },
        },
      ]);
      //end of that
      // console.log("page Visits", pageVisits);
      if (delivererWithCurrentClients.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No visits in the system",
        });
      }
      // Get the total count of jobs
      const totalCount = currentVisitIds.length;
      console.log(totalCount);

      console.log(delivererWithCurrentClients);
      res.status(200).json({
        success: true,
        delivererWithCurrentClients,
        totalCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/get-all-contractors-page",
  isAuthenticated,
  async (req, res, next) => {
    try {
      let { page = 0, pageSize = 25, sort = null, search = "" } = req.query;

      // Formatted sort should look like { field: 1 } or { field: -1 }
      const generateSort = () => {
        const sortParsed = JSON.parse(sort);
        const sortOptions = {
          [sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1,
        };

        return sortOptions;
      };

      const sortOptions = Boolean(sort) ? generateSort() : { createdAt: -1 };

      // Find the deliverer based on the company ID
      const deliverer = await Deliverer.findById(req.user.companyId);
      if (!deliverer) {
        return res.status(404).json({
          success: false,
          message: "Deliverer not found",
        });
      }

      // Get the contractor IDs associated with the deliverer
      const contractorIds = deliverer.contractor_ids;

      // Create a search filter with the contractor IDs
      const searchFilter = {
        _id: { $in: contractorIds },
        $or: [
          { tradeName: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { contactName: { $regex: search, $options: "i" } },
          // Add other fields to search on as needed
        ],
      };

      // Query for the contractors using the search filter
      const pageContractors = await Contractor.find(searchFilter)
        .sort(sortOptions)
        .skip(page * pageSize)
        .limit(pageSize)
        .lean();

      if (pageContractors.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No contractors found",
        });
      }

      // Get the total count of contractors matching the search criteria
      const totalCount = await Contractor.countDocuments(searchFilter);

      res.status(200).json({
        success: true,
        pageContractors,
        totalCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

router.put(
  "/update-contractor",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        companyId,
        companyName,
        taxPayerName,
        tin,
        vat,
        region,
        station,
        province,
        city,
        street,
        houseNo,
        contactName,
        contactNumber,
        contactEmail,
        deviceType,
        serialNumber,
      } = req.body;

      console.log("Request body", req.body);
      const contractor = await Contractor.findById(companyId);

      if (!contractor) {
        return next(new ErrorHandler("Contractor is not found", 400));
      }

      contractor.tradeName = companyName;
      contractor.taxPayerName = taxPayerName;
      contractor.tin = tin;
      contractor.vat = vat;
      contractor.region = region;
      contractor.station = station;
      contractor.province = province;
      contractor.city = city;
      contractor.street = street;
      contractor.houseNo = houseNo;
      contractor.contactName = contactName;
      contractor.contactNumber = contactNumber;
      contractor.contactEmail = contactEmail;
      contractor.deviceType = deviceType;
      contractor.serialNumber = serialNumber;

      await contractor.save();

      res.status(201).json({
        success: true,
        contractor,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.delete(
  "/delete-contractor/:contractorId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const contractorId = req.params.contractorId;

      const contractor = await Contractor.findByIdAndDelete(contractorId);
      if (!contractor) {
        return next(
          new ErrorHandler("There is no contractor with this id", 500)
        );
      }
      const deliverer = await Deliverer.findById(req.user.companyId);
      if (!deliverer) {
        return next(
          new ErrorHandler("There is no deliverer with this id", 500)
        );
      }

      // Remove the contractorId from the deliverer's array of contractorIds
      const updatedContractorIds = deliverer.contractor_ids.filter(
        (id) => id.toString() !== contractorId
      );

      // Update the deliverer's contractorIds array with the updated array
      deliverer.contractor_ids = updatedContractorIds;
      await deliverer.save();

      res.status(201).json({
        success: true,
        message: "Contractor Deleted!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

//updating the contact details for the client

//Update contractor addresses

router.put(
  "/update-contact-person",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const contractor = await Contractor.findById(req.body.tradeCompanyId);

      console.log("trade Company id is ", req.body.tradeCompanyId._id);
      console.log("the contractor is ", contractor);
      console.log("the request body", req.body);

      let addContactDetails;
      const sameTypeContactDetails = contractor.contactPersons.find(
        (details) => details.phoneNumber === req.body.phoneNumber
      );

      if (sameTypeContactDetails) {
        return next(
          new ErrorHandler(`${req.body.phoneNumber}  already exists`)
        );
      }

      const existsContactDetails = contractor.contactPersons.find(
        (details) => details._id === req.body._id
      );
      if (existsContactDetails) {
        Object.assign(existsContactDetails, req.body);
      } else {
        //add the new address to the array

        contractor.contactPersons.push(req.body);
      }
      await contractor.save();

      const contactPersonDetails =
        contractor.contactPersons[contractor.contactPersons.length - 1];

      res.status(200).json({
        success: true,
        contactPersonDetails,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
