import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Rating,
  useTheme,
  useMediaQuery,
  FormControl,
  DialogContent,
  DialogTitle,
  Dialog,
  DialogActions,
  TextField,
  Stepper,
  StepButton,
  Step,
  MenuItem,
  Select,
  InputLabel,
  IconButton,
  Input,
  DialogContentText,
} from "@mui/material";
import {
  AddBusiness,
  Business,
  Close,
  EditSharp,
  Group,
  GroupAdd,
  Refresh,
  Search,
  Visibility,
} from "@mui/icons-material";
import FlexBetween from "component/deliverer/FlexBetween";
import Header from "component/deliverer/Header";
import { useDispatch, useSelector } from "react-redux";
import {
  createContractor,
  deleteContractor,
  getAllContractorsPage,
  updateContractor,
} from "redux/actions/contractor";
import toast from "react-hot-toast";
import DataGridCustomToolbar from "component/deliverer/DataGridCustomToolbar";
import { useNavigate } from "react-router-dom";
import Regions from "component/Regions";
import Stations from "component/deliverer/Stations";
import DeviceType from "component/deviceType";
import { DataGrid, GridDeleteIcon } from "@mui/x-data-grid";
import BasicPopover from "component/deliverer/AuthenticationPopover";
import socketIO,{ io } from 'socket.io-client';
import { endpoint } from "socketIOEndpoint";

let steps = [];

const ContractorsPage = () => {
  const isNonMobile = useMediaQuery("(min-width: 1000px)");
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
const socketId = socketIO(endpoint, {transports:["websocket"]})


  const [isAddButtonn, setIsAddButtonn] = useState(false);
  const [isEditButtonn, setIsEditButtonn] = useState(false);
  const [isUpdateRates, setIsUpdateRate] = useState(false);
  const [disableSelect, setDisableSelect] = useState(false);
  const [lastStep, setLastStep] = useState("");

  const [pagee, setPagee] = useState(1);
  const [pageSizee, setPageSize] = useState(20);
  const [filter, setFilter] = useState("");
  const [totalContractors, setTotalContractors] = useState(0);
  const [view, setView] = useState("");
  const [sort, setSort] = useState({});
  const [search, setJobSearch] = useState("");
  const [results, setResults] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const handleResetSearch = () => {
    setJobSearch("");
    setView("");
  };

  const { user } = useSelector((state) => state.user);
  const { pageContractors, error, success, totalCount, isContrPageLoading } =
    useSelector((state) => state.contractors);

  console.log(pageContractors);
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 25,
    page: 0,
  });

  let pageSize = paginationModel.pageSize;
  let page = paginationModel.page;
  let start = page * pageSize; // Calculate the start index based on the page and pageSize

  useEffect(() => {
    if (page < 0) {
      setPaginationModel((prevPaginationModel) => ({
        ...prevPaginationModel,
        page: 0,
      }));
    } else {
      dispatch(
        getAllContractorsPage(page, pageSize, JSON.stringify(sort), search)
      );
    }
  }, [page, pageSize, sort, search, dispatch]);

  let dContractors = [];
  if (!isContrPageLoading) {
    dContractors = pageContractors ? pageContractors.flatMap((i) => i) : [];
  }
  useEffect(() => {
      if (page < 0) {
        setPagee(0); // Reset to the first page if the value is negative
      } else {
        dispatch(
          getAllContractorsPage(page, pageSize, JSON.stringify(sort), search)
        );
      }
  
  }, [page, pageSize, sort, search, dispatch]);

  useEffect(() => {
    if (pageContractors) {
      if (totalContractors === 0) {
        setTotalContractors(pageContractors.length);
      }
      if (search === "") {
        setResults(pageContractors.length);
        setTotalContractors(pageContractors.length);
      }
      setResults(pageContractors.length);
    } else {
      setResults(0);
    }
  }, [pageContractors, totalContractors, search]);
  const [open, setOpen] = useState(false);
  const [disable, setDisable] = useState(false);

  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxPayerName, setTaxPayerName] = useState("");
  const [tin, setTin] = useState("");
  const [vat, setVAT] = useState("");
  const [region, setRegion] = useState("");
  const [station, setStation] = useState("");
  const [street, setStreet] = useState("");
  const [province, setProvince] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [city, setCity] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [deviceType, setDeviceType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  //the steps
  const [activeStep, setActiveStep] = React.useState(0);
  let [completed, setCompleted] = React.useState({});
  const [isEditSelected, setIsEditSelected] = useState(false);
  const [isDeleteSelected, setIsDeleteSelected] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      dispatch({ type: "clearErrors" });
    }
    if (success) {
      toast.success("Contractor added successfully!");
      setOpen(false);
      dispatch({ type: "clearMessages" });
    }
  }, [dispatch, error, success]);

  //steps stuff start here START

  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleContractorDash = (contractorId) => {
    navigate(`/del-dash-contractor/${contractorId}`);
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
    if (isAddButtonn || isEditButtonn || isUpdateRates) {
      stepChecker();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);

    if (isAddButtonn || isEditButtonn || isUpdateRates) {
      stepChecker();
    }
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  //handle the changes from step to step check to see if step is complete
  const stepChecker = () => {
    if (activeStep === 0) {
      if (
        companyName !== "" &&
        tin !== "" &&
        vat !== 0 &&
        taxPayerName !== "" &&
        region !== "" &&
        station !== ""
      ) {
        const newCompleted = completed;
        newCompleted[activeStep] = true;
        setCompleted(newCompleted);
      } else {
        const newCompleted = completed;
        newCompleted[activeStep] = false;
        setCompleted(newCompleted);
      }
    }

    if (activeStep === 1) {
      if (
        contactNumber !== "" &&
        contactEmail !== "" &&
        province !== "" &&
        city !== "" &&
        street !== "" &&
        houseNo !== "" &&
        contactName !== ""
      ) {
        const newCompleted = completed;
        newCompleted[activeStep] = true;
        setCompleted(newCompleted);
      } else {
        const newCompleted = completed;
        newCompleted[activeStep] = false;
        setCompleted(newCompleted);
      }
    }
    if (activeStep === 2) {
      if (deviceType !== "" && serialNumber !== "") {
        const newCompleted = completed;
        newCompleted[activeStep] = true;
        setCompleted(newCompleted);
      } else {
        const newCompleted = completed;
        newCompleted[activeStep] = false;
        setCompleted(newCompleted);
      }
    }
  };

  //the steps ENDS

  const handleViewC = (contractorId) => {
    console.log(contractorId);
    const selectedContractor =
      pageContractors &&
      pageContractors.find((contractor) => contractor._id === contractorId);

    setCompanyName(selectedContractor.tradeName);
    setTaxPayerName(selectedContractor.taxPayerName);
    setTin(selectedContractor.tin);
    setVAT(selectedContractor.vat);
    setRegion(selectedContractor.region);
    setStation(selectedContractor.station);
    setStreet(selectedContractor.street);
    setProvince(selectedContractor.province);
    setHouseNo(selectedContractor.houseNo);
    setCity(selectedContractor.city);
    setContactName(selectedContractor.contactName);
    setContactNumber(selectedContractor.contactNumber);
    setContactEmail(selectedContractor.contactEmail);

    setDeviceType(selectedContractor.deviceType);
    setSerialNumber(selectedContractor.serialNumber);
    steps = [];

    steps = ["General Details", "Requirements", "Device Info"];
    setLastStep(steps.length - 1);

    setCompleted({});
    setIsUpdateRate(false);
    setIsAddButtonn(false);
    setIsEditButtonn(false);
    setActiveStep(0);
    setDisableSelect(true);
    //setDisable(true);
    setOpen(true);
    console.log(companyName);
  };

  const handleEditC = (contractorId) => {
    console.log("contractorId", contractorId);
    if (isEditSelected) {
      console.log("contractorId", contractorId);
      const selectedContractor =
        pageContractors &&
        pageContractors.find((contractor) => contractor._id === contractorId);

      //let specificRates = [];
      setCompanyId(selectedContractor._id);
      setCompanyName(selectedContractor.tradeName);
      setTaxPayerName(selectedContractor.taxPayerName);
      setTin(selectedContractor.tin);
      setVAT(selectedContractor.vat);
      setRegion(selectedContractor.region);
      setStation(selectedContractor.station);
      setStreet(selectedContractor.street);
      setProvince(selectedContractor.province);
      setHouseNo(selectedContractor.houseNo);
      setCity(selectedContractor.city);
      setContactNumber(selectedContractor.contactNumber);
      setContactName(selectedContractor.contactName);
      setContactEmail(selectedContractor.contactEmail);

      setDeviceType(selectedContractor.deviceType);
      setSerialNumber(selectedContractor.serialNumber);

      steps = [];
      steps = ["General Details", "Requirements", "Device Info", "Preview"];
      setLastStep(steps.length - 1);
      setActiveStep(0);
      setCompleted({});
      setIsUpdateRate(false);
      setIsEditButtonn(true);
      setIsAddButtonn(false);
      setDisable(false);
      setDisableSelect(false);
      setOpen(true);
    }
  };
  const [isDelete, setIsDelete] = useState(false);

  const handleDelete = (contractorId) => {
    if(isDeleteSelected){
      dispatch(deleteContractor(contractorId))
      .then(() => {
        toast.success("Contractor deleted successfully");
        dispatch(getAllContractorsPage());
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
    }
   
  };

  //the steps

  const handleDeleteDialogue = (contractorId) => {
    const selectedContractor =
      pageContractors &&
      pageContractors.find((contractor) => contractor._id === contractorId);

    setCompanyId(companyId);
    setCompanyName(selectedContractor.tradeName);
    setIsDelete(true);
  };
  //This function handles the  closing of the delete dialogue box
  const handleDeleteDialogueClose = () => {
    setIsDelete(false);
  };

  const handleClickOpen = () => {
    //initialising everything to ensure all fields are empty
    setCompanyName("");
    setTaxPayerName("");
    setTin("");
    setVAT("");
    setContactNumber("");
    setRegion("");
    setStation("");
    setStreet("");
    setProvince("");
    setHouseNo("");
    setCity("");
    setContactName("");
    setContactEmail("");

    setDeviceType("");
    setSerialNumber("");

    setActiveStep(0);
    steps = [];
    steps = ["General Details", "Contact Details", "Device Info", "Preview"];

    setLastStep(steps.length - 1);

    setIsEditButtonn(false);
    setIsAddButtonn(true);
    setDisableSelect(false);
    setDisable(false);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
      setIsDeleteSelected(false);
      setIsEditSelected(false);
    }
  };

  //populating the rates object
  const handleSubmit = (e) => {
    setDisable(true);
    e.preventDefault();
    const newForm = new FormData();

    newForm.append("companyName", companyName);
    newForm.append("taxPayerName", taxPayerName);
    newForm.append("tin", tin);
    newForm.append("vat", vat);
    newForm.append("region", region);
    newForm.append("station", station);
    newForm.append("province", province);
    newForm.append("city", city);
    newForm.append("street", street);
    newForm.append("companyId", user.companyId);
    newForm.append("houseNo", houseNo);
    newForm.append("contactName", contactName);
    newForm.append("contactNumber", contactNumber);
    newForm.append("contactEmail", contactEmail);
    newForm.append("deviceType", deviceType);
    newForm.append("serialNumber", serialNumber);

    // if (completed[0] && completed[1]) {
      if (isAddButtonn === true && isEditButtonn === false) {
        dispatch(createContractor(newForm))
          .then(() => {
            socketId.emit("update-visits");
            socketId.on("update-completed", () => {
            dispatch(getAllContractorsPage());
            // dispatch(getRates());
            handleClose();
            dispatch({ type: "clearMessages" });
            })
          })
          .catch((err) => {
            toast.error(err.response.message);
          });
      }
  
      if (isAddButtonn === false && isEditButtonn === true) {
        dispatch(
          updateContractor(
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
            serialNumber
          )
        )
          .then(() => {
            toast.success("Contractor updated successfully");
            socketId.emit("update-visits");
            socketId.on("update-completed", () => {
            dispatch(getAllContractorsPage());
            handleClose();
            dispatch({ type: "clearMessages" });
            })
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
  
        //edit the customer
      }

  };

  //functions for dealing with the popover start
  const [isPopupSelected, setIsPopupSelected] = useState(false);
  const [typeId, setTypeId] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const id = isPopupSelected ? "simple-popover" : undefined;

  const authenticateUser = (event, delivererId, isEditorDelete) => {
    if (isEditorDelete === "edit") {
      setIsEditSelected(true);
      setIsDeleteSelected(false);
    }
    if (isEditorDelete === "delete") {
      setIsEditSelected(false);
      setIsDeleteSelected(true);
    }
    setTypeId(delivererId);
    setIsPopupSelected(true);
    console.log("type Id ", typeId);
    console.log(delivererId);
    console.log(isPopupSelected, "ispopuselected");
    console.log("isEditorDelete", isEditorDelete);

    setAnchorEl(event.currentTarget);

    console.log("anchor El", anchorEl);
  };

  const handleCloseAuthenticationPopup = (event, contractorId) => {
    console.log("contr id", contractorId)
    if (contractorId === undefined || contractorId === "backdropClick") {
      setIsPopupSelected(false);
      setAnchorEl(null);
      console.log("close done", isPopupSelected);
    } else {
      setIsPopupSelected(false);
      if(isEditSelected){
        handleEditC(contractorId);

      }
      if(isDeleteSelected){
        handleDelete(contractorId)
      }
    }
  };

  //functions for dealing with the popover end

  //defining the columns for to view the clients
  const columns = [
    {
      field: "tradeName",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "tin",
      headerName: "TIN",
      flex: 1,
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
    },
    {
      field: "contactNumber",
      headerName: "Phone Number",
      flex: 1.5,
      sortable: false,
    },
    {
      field: "options",
      headerName: "Options",
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton
            aria-label="View"
            onClick={() => handleViewC(params.row._id)}
          >
            <Visibility />
          </IconButton>

          <IconButton
            aria-describedby={id}
            aria-label="Edit"
            onClick={(event) => authenticateUser(event, params.row._id, "edit")}
          >
            <EditSharp />
          </IconButton>

          <IconButton
            color="error"
            aria-label="Delete"
            onClick={(event) => authenticateUser(event, params.row._id, "delete")}
          >
            <GridDeleteIcon />
          </IconButton>

          {isPopupSelected && (
            <BasicPopover
              //labelId={id}
              typeId={typeId}
              isPopupSelected={isPopupSelected}
              anchorEl={anchorEl}
              handleCloseAuthenticationPopup={handleCloseAuthenticationPopup}
            />
          )}
        </>
      ),
    },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Clients" subtitle="See all your clients." />

        <Box>
          <Button
            //disabled
            variant="contained"
            color="secondary"
            sx={{
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              ":hover": {
                // backgroundColor: theme.palette.secondary[300],
              },
            }}
          >
            <Group sx={{ mr: "10px" }} />
            {totalCount}
          </Button>
        </Box>

        <Box>
          <Button
            onClick={handleClickOpen}
            variant="outlined"
            color="info"
            sx={{
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              ":hover": {
                // backgroundColor: theme.palette.secondary[300],
              },
            }}
          >
            <GroupAdd sx={{ mr: "10px" }} />+ Client
          </Button>
        </Box>
      </FlexBetween>

      {/**This is where the add customer dialogue starts */}

      {/**This is where the add customer dialogue ends */}

      <div>
        <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
          <DialogTitle variant="h3" sx={{ m: "0rem 6rem" }}>
            <Button
              disabled
              variant="outlined"
              sx={{
                fontSize: "20px",
                fontWeight: "bold",
                padding: "10px 20px",
                ":disabled": {
                  color: theme.palette.primary[100],
                },
              }}
            >
              <GroupAdd sx={{ mr: "10px", fontSize: "25px" }} />
              Contractor
            </Button>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="info"
              sx={{ ml: "30px" }}
            >
              <Close sx={{ fontSize: "25px" }} />
            </Button>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ width: "100%" }}>
              <Stepper nonLinear activeStep={activeStep}>
                {steps.map((label, index) => (
                  <Step key={label} completed={completed[index]}>
                    <StepButton color="inherent" onClick={handleStep(index)}>
                      {label}
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
              <div>
                {
                  <React.Fragment>
                    <form onSubmit={handleSubmit}>
                      <Box
                        sx={{ mt: "0.5rem" }}
                        display="flex"
                        maxWidth={"400px"}
                        margin={"auto"}
                        flexDirection="column"
                        alignItems={"center"}
                        justifyContent={"center"}
                      >
                        {activeStep === 0 && (
                          <Box display={"flex"} flexDirection={"column"}>
                            <FormControl sx={{ m: 1, width: 415 }}>
                              <TextField
                                disabled={disableSelect}
                                required
                                variant="filled"
                                type="text"
                                label="Tax Payer Name"
                                value={companyName}
                                sx={{
                                  border: "solid",
                                  borderRadius: "5px",
                                  borderColor:
                                    //setting the validation for the first input
                                    companyName !== ""
                                      ? companyName.length > 2
                                        ? "green"
                                        : "red"
                                      : "red",
                                }}
                                onChange={(e) => setCompanyName(e.target.value)}
                              />
                            </FormControl>

                            <Box display={"flex"}>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled={disableSelect}
                                  required
                                  variant="filled"
                                  type="text"
                                  label="Tax Payer TIN"
                                  value={tin}
                                  inputProps={{
                                    maxLength: 10,
                                    pattern: "[0-9]*",
                                    onKeyPress: (event) => {
                                      const keyValue = event.key;

                                      if (!/^\d$/.test(keyValue)) {
                                        event.preventDefault();
                                      }
                                    },
                                  }}
                                  sx={{
                                    border: "solid",

                                    borderRadius: "5px",
                                    borderColor:
                                      //setting the validation for the first input
                                      tin !== ""
                                        ? tin.length === 10
                                          ? "green"
                                          : "red"
                                        : "red",
                                  }}
                                  onChange={(e) => setTin(e.target.value)}
                                />
                              </FormControl>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled={disableSelect}
                                  required
                                  variant="filled"
                                  type="text"
                                  label="Tax Payer VAT(new one)"
                                  value={vat}
                                  inputProps={{
                                    maxLength: 9,
                                    pattern: "[0-9]*",
                                    onKeyPress: (event) => {
                                      const keyValue = event.key;

                                      if (!/^\d$/.test(keyValue)) {
                                        event.preventDefault();
                                      }
                                    },
                                  }}
                                  onChange={(e) => setVAT(e.target.value)}
                                  sx={{
                                    border: "solid",

                                    borderRadius: "5px",
                                    borderColor:
                                      //setting the validation for the first input
                                      vat !== ""
                                        ? vat.length === 9
                                          ? "green"
                                          : "red"
                                        : "red",
                                  }}
                                />
                              </FormControl>
                            </Box>

                            <FormControl sx={{ m: 1, width: 415 }}>
                              <TextField
                                disabled={disableSelect}
                                required
                                variant="filled"
                                type="text"
                                label="Tax Payer Trade Name"
                                value={taxPayerName}
                                
                                onChange={(e) =>
                                  setTaxPayerName(e.target.value)
                                }
                                sx={{
                                  border: "solid",

                                  borderRadius: "5px",
                                  borderColor:
                                    //setting the validation for the first input
                                    taxPayerName !== ""
                                      ? taxPayerName.length > 2
                                        ? "green"
                                        : "red"
                                      : "red",
                                }}
                              />
                            </FormControl>

                            <Box display={"flex"}>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <Regions
                                  name={region}
                                  onChange={(e) => setRegion(e.target.value)}
                                  disabled={disableSelect}
                                />
                              </FormControl>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <Stations
                                  name={station}
                                  onChange={(e) => setStation(e.target.value)}
                                  disabled={disableSelect}
                                />
                              </FormControl>
                            </Box>
                          </Box>
                        )}

                        {activeStep === 1 && (
                          <Box display={"flex"} flexDirection={"column"}>
                            <Box display={"flex"}>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled={disableSelect}
                                  required
                                  variant="filled"
                                  type="text"
                                  label="Company Phone No."
                                  value={contactNumber}
                                  color="info"
                                  onChange={(e) =>
                                    setContactNumber(e.target.value)
                                  }
                                  sx={{
                                    border: "solid",

                                    borderRadius: "5px",
                                    borderColor:
                                      //setting the validation for the first input
                                      contactNumber !== ""
                                        ? contactNumber.length > 6
                                          ? "green"
                                          : "red"
                                        : "red",
                                  }}
                                />
                              </FormControl>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled={disableSelect}
                                  required
                                  variant="filled"
                                  type="email"
                                  label="Company Email"
                                  value={contactEmail}
                                  onChange={(e) =>
                                    setContactEmail(e.target.value)
                                  }
                                  sx={{
                                    border: "solid",

                                    borderRadius: "5px",
                                    borderColor:
                                      //setting the validation for the first input
                                      contactEmail !== ""
                                        ? contactEmail.length > 6
                                          ? "green"
                                          : "red"
                                        : "red",
                                  }}
                                />
                              </FormControl>
                            </Box>

                            <Box display={"flex"}>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled={disableSelect}
                                  required
                                  variant="filled"
                                  type="text"
                                  label="Province"
                                  value={province}
                                  onChange={(e) => setProvince(e.target.value)}
                                  sx={{
                                    border: "solid",

                                    borderRadius: "5px",
                                    borderColor:
                                      //setting the validation for the first input
                                      province !== ""
                                        ? province.length > 4
                                          ? "green"
                                          : "red"
                                        : "red",
                                  }}
                                />
                              </FormControl>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled={disableSelect}
                                  required
                                  variant="filled"
                                  type="text"
                                  label="City"
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                  sx={{
                                    border: "solid",

                                    borderRadius: "5px",
                                    borderColor:
                                      //setting the validation for the first input
                                      city !== ""
                                        ? city.length > 3
                                          ? "green"
                                          : "red"
                                        : "red",
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <Box display={"flex"}>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled={disableSelect}
                                  required
                                  variant="filled"
                                  type="text"
                                  label="Street"
                                  value={street}
                                  onChange={(e) => setStreet(e.target.value)}
                                  sx={{
                                    border: "solid",

                                    borderRadius: "5px",
                                    borderColor:
                                      //setting the validation for the first input
                                      street !== ""
                                        ? street.length > 3
                                          ? "green"
                                          : "red"
                                        : "red",
                                  }}
                                />
                              </FormControl>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled={disableSelect}
                                  required
                                  variant="filled"
                                  type="text"
                                  label="House No"
                                  value={houseNo}
                                  onChange={(e) => setHouseNo(e.target.value)}
                                  sx={{
                                    border: "solid",

                                    borderRadius: "5px",
                                    borderColor:
                                      //setting the validation for the first input
                                      houseNo !== ""
                                        ? houseNo.length > 0
                                          ? "green"
                                          : "red"
                                        : "red",
                                  }}
                                />
                              </FormControl>
                            </Box>

                            <FormControl sx={{ m: 1, width: 415 }}>
                              <TextField
                                disabled={disableSelect}
                                required
                                variant="filled"
                                type="text"
                                label="Contact Person Name"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                sx={{
                                  border: "solid",

                                  borderRadius: "5px",
                                  borderColor:
                                    //setting the validation for the first input
                                    contactName !== ""
                                      ? contactName.length > 2
                                        ? "green"
                                        : "red"
                                      : "red",
                                }}
                              />
                            </FormControl>
                          </Box>
                        )}
                        {activeStep === 2 && (
                          <Box display={"flex"}>
                            <FormControl sx={{ m: 1, width: 200 }}>
                              <DeviceType
                                name={deviceType}
                                onChange={(e) => setDeviceType(e.target.value)}
                                disabled={disableSelect}
                              />
                            </FormControl>
                            <FormControl sx={{ m: 1, width: 200 }}>
                              <TextField
                                disabled={disableSelect}
                                required
                                variant="outlined"
                                type="text"
                                label="Device Serial Number"
                                inputProps={{
                                  maxLength: 12,
                                //  pattern: "[0-9]*",
                          
                                }}
                                value={serialNumber}
                                onChange={(e) =>
                                  setSerialNumber(e.target.value)
                                }
                                sx={{
                                  border: "solid",

                                  borderRadius: "5px",
                                  borderColor:
                                    //setting the validation for the first input
                                    serialNumber !== ""
                                      ? serialNumber.length === 12
                                        ? "green"
                                        : "red"
                                      : "red",
                                }}
                              />
                            </FormControl>
                          </Box>
                        )}
                        {activeStep === 3 && (
                          <Box display={"flex"} flexDirection={"column"}>
                            <FormControl sx={{ m: 1, width: 415 }}>
                              <TextField
                                disabled
                                required
                                variant="outlined"
                                type="text"
                                label="Tax Payer Name"
                                value={companyName}
                                color="info"
                                onChange={(e) => setCompanyName(e.target.value)}
                              />
                            </FormControl>

                            <Box display={"flex"}>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled
                                  required
                                  variant="outlined"
                                  type="text"
                                  label="Tax Payer TIN"
                                  value={tin}
                                  onChange={(e) => setTin(e.target.value)}
                                  color="info"
                                />
                              </FormControl>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled
                                  required
                                  variant="outlined"
                                  type="text"
                                  label="Tax Payer VAT(new one)"
                                  value={vat}
                                  onChange={(e) => setVAT(e.target.value)}
                                  color="info"
                                />
                              </FormControl>
                            </Box>

                            <FormControl sx={{ m: 1, width: 415 }}>
                              <TextField
                                disabled
                                required
                                variant="outlined"
                                type="text"
                                label="Tax Payer Name"
                                value={taxPayerName}
                                color="info"
                                onChange={(e) =>
                                  setTaxPayerName(e.target.value)
                                }
                              />
                            </FormControl>

                            <Box display={"flex"}>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <Regions
                                  name={region}
                                  onChange={(e) => setRegion(e.target.value)}
                                  disabled={true}
                                />
                              </FormControl>
                              <FormControl sx={{ m: 1, width: 200 }}>
                                <TextField
                                  disabled
                                  required
                                  variant="outlined"
                                  type="text"
                                  label="Device Serial Number"
                                  value={serialNumber}
                                  color="info"
                                  onChange={(e) =>
                                    setSerialNumber(e.target.value)
                                  }
                                />
                              </FormControl>
                            </Box>
                          </Box>
                        )}
                        <Box display={"flex"}>
                          <Button
                            disabled={activeStep === 0 || disable === true}
                            onClick={handleBack}
                            variant="contained"
                            size="large"
                            sx={{
                              color: theme.palette.secondary[300],

                              margin: "0.5rem",
                              border: "solid 1px",
                              ":hover": {
                                backgroundColor: theme.palette.secondary[800],
                              },
                              ":disabled": {
                                backgroundColor: theme.palette.secondary[800],
                              },
                            }}
                          >
                            Back
                          </Button>
                          {activeStep !== lastStep && (
                            <Button
                              onClick={handleNext}
                              variant="outlined"
                              fontWeight="bold"
                              sx={{
                                color: theme.palette.secondary[100],
                                // backgroundColor: theme.palette.secondary[300],
                                margin: "0.5rem  ",
                                border: "solid 0.5px",
                                ":hover": {
                                  backgroundColor: theme.palette.secondary[300],
                                },
                                ":disabled": {
                                  backgroundColor: theme.palette.secondary[300],
                                },
                              }}
                            >
                              Next
                            </Button>
                          )}

                          {activeStep === lastStep &&
                            (isAddButtonn || isEditButtonn) && (
                              <Button
                                type={"submit"}
                                disabled={disable}
                                variant="outlined"
                                fontWeight="bold"
                                sx={{
                                  color: theme.palette.secondary[100],
                                  // backgroundColor: theme.palette.secondary[300],
                                  margin: "0.5rem  ",
                                  border: "solid 0.5px",
                                  ":hover": {
                                    backgroundColor:
                                      theme.palette.secondary[300],
                                  },
                                  ":disabled": {
                                    backgroundColor:
                                      theme.palette.secondary[300],
                                  },
                                }}
                              >
                                {isAddButtonn && !isEditButtonn && (
                                  <>Add Contractor</>
                                )}
                                {!isAddButtonn && isEditButtonn && (
                                  <>Edit Contractor</>
                                )}
                              </Button>
                            )}
                        </Box>
                      </Box>
                    </form>
                  </React.Fragment>
                }
              </div>
            </Box>
          </DialogContent>
          <DialogActions></DialogActions>
        </Dialog>
      </div>
      {/**Add contractor dialogue ends



    {/**This is where the content goes */}
      <Box
        height="80vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.secondary[200]} !important`,
          },
        }}
      >
        <DataGrid
          loading={!pageContractors || isContrPageLoading}
          getRowId={(row) => row._id}
          rows={(pageContractors && pageContractors) || []}
          columns={columns}
          rowCount={totalCount || 0}
          rowsPerPageOptions={[20, 50, 100]}
          pagination
          page={page}
          pageSize={pageSize}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          sortingMode="server"
          onSortModelChange={(newSortModel) => setSort(...newSortModel)}
          components={{ Toolbar: DataGridCustomToolbar }}
          componentsProps={{
            toolbar: { searchInput, setSearchInput, setJobSearch, results },
          }}
        />
      </Box>
      {/**This is where the content ends */}
    </Box>
  );
};

export default ContractorsPage;
