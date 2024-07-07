import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
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
  IconButton,
  Popover,
} from "@mui/material";
import {
  AddBusiness,
  AddToQueue,
  Business,
  Close,
  EditSharp,
  GroupAdd,
  SendOutlined,
  Visibility,
} from "@mui/icons-material";
import FlexBetween from "component/deliverer/FlexBetween";
import Header from "component/deliverer/Header";
import GoodsTypes from "component/deliverer/GoodsType";
import Cities from "component/Cities";
import { useDispatch, useSelector } from "react-redux";
import VehicleTypes from "component/deliverer/VehicleTypes";
import DeliveryTypes from "component/deliverer/DeliveryTypes";
import {
  createDeliverer,
  getAllDeliverersPage,
  updateDeliverer,
} from "redux/actions/deliverer";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridDeleteIcon } from "@mui/x-data-grid";
import DataGridCustomToolbar from "component/deliverer/DataGridCustomToolbar";
import axios from "axios";
import { server } from "server";
import BasicPopover from "component/deliverer/AuthenticationPopover";

const steps = ["General Details"];

const DeliverersPage = () => {
  const isNonMobile = useMediaQuery("(min-width: 1000px)");
  const { user } = useSelector((state) => state.user);
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isAddButtonn, setIsAddButtonn] = useState(false);
  const [isEditButtonn, setIsEditButtonn] = useState(false);
  const [addedAdmin, setAddedAdmin] = useState("");
  const [chosenDeliverer, setChosenDeliverer] = useState({});
  const [isView, setIsView] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [lastStep, setLastStep] = useState(0);
  const [disableSelect, setDisableSelect] = useState(false);

  const [pagee, setPagee] = useState(1);
  const [pageSizee, setPageSizee] = useState(20);
  const [sort, setSort] = useState({});
  const [search, setJobSearch] = useState("");
  const [results, setResults] = useState("");
  const [totalDeliverers, setTotalDeliverers] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const { deliverersPage, totalCount, isPageDeliverersLoading } = useSelector(
    (state) => state.deliverers
  );
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 25,
    page: 0,
  });

  let pageSize;
  let page;
  pageSize = paginationModel.pageSize;
  page = paginationModel.page;

  useEffect(() => {
    if (page < 0) {
      setPagee(0); // Reset to the first page if the value is negative
    } else {
      dispatch(
        getAllDeliverersPage(page, pageSize, JSON.stringify(sort), search)
      );
    }
  }, [page, pageSize, sort, search, dispatch]);

  useEffect(() => {
    if (deliverersPage) {
      if (totalDeliverers === 0) {
        setTotalDeliverers(deliverersPage.length);
      }
      if (search === "") {
        setResults(deliverersPage.length);
      }
      setResults(deliverersPage.length);
    } else {
      setResults(0);
    }
  }, [deliverersPage, totalDeliverers, search]);

  const { success, error } = useSelector((state) => state.deliverers);
  const [open, setOpen] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [goodsType, setGoodsType] = useState([]);
  const [vehiclesType, setVehiclesType] = useState([]);
  const [deliveryType, setDeliveryType] = useState([]);
  const [city, setCity] = useState("");
  const [prefix, setPrefix] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [password, setPassword] = useState("");
  //the steps
  const [activeStep, setActiveStep] = React.useState(0);
  let [completed, setCompleted] = React.useState({});

  const [disable, setDisable] = useState(false);
  const [isUserAllowedToEdit, setIsUserAllowedToEdit] = useState(false);


  const [isEditSelected, setIsEditSelected] = useState(false);
  const [isDeleteSelected, setIsDeleteSelected] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success("Provider created successfully");
      navigate("/del-deliverers");
      window.location.reload();
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

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
    if (isAddButtonn || isEditButtonn) {
      stepChecker();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (isAddButtonn || isEditButtonn) {
      stepChecker();
    }
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  //handle the changes from step to step check to see if step is complete
  const stepChecker = () => {
    if (activeStep === 0) {
      if (companyName !== "" && city !== "" && address !== "") {
        const newCompleted = completed;
        newCompleted[activeStep] = true;
        setCompleted(newCompleted);
        console.log("this condition met");
      } else {
        const newCompleted = completed;
        newCompleted[activeStep] = false;
        setCompleted(newCompleted);
        console.log("this condition not met");
      }
    }
  };

  //the steps ENDS

  const handleClickOpen = () => {
    setCompanyName("");
    setAddress("");
    setCity("");
    setCompanyId("");
    setCompleted({});
    setLastStep(steps.length - 1);
    setActiveStep(0);
    setIsAddButtonn(true);
    setIsEditButtonn(false);
    setDisable(false);
    setDisableSelect(false);
    setOpen(true);
  };

  const handleDelete = () => {};

  const handleView = (delivererId) => {
    const selectedDeliverer =
      deliverersPage &&
      deliverersPage.find((deliverer) => deliverer._id === delivererId);
    setCompanyId(selectedDeliverer._id);
    setCompanyName(selectedDeliverer.companyName);
    setContact(selectedDeliverer.contact);
    setAddress(selectedDeliverer.address);
    setCity(selectedDeliverer.city);
    setLastStep(steps.length - 1);
    setActiveStep(0);
    setCompleted({});
    setDisableSelect(true);
    setIsAddButtonn(false);
    setIsEditButtonn(false);
    setOpen(true);
  };

  const handleEdit = (delivererId) => {
    const selectedDeliverer =
      deliverersPage &&
      deliverersPage.find((deliverer) => deliverer._id === delivererId);
    setCompanyId(selectedDeliverer._id);
    setCompanyName(selectedDeliverer.companyName);
    setContact(selectedDeliverer.contact);
    setAddress(selectedDeliverer.address);
    setCity(selectedDeliverer.city);
    console.log(city);
    setLastStep(steps.length - 1);
    completed = setActiveStep(0);
    setDisable(false);
    setDisableSelect(false);
    setIsEditButtonn(true);
    setIsAddButtonn(false);
    setOpen(true);
    console.log(open, "is Open");
  };

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
      setIsDeleteSelected(false);
      setIsEditSelected(false);
    }
  };

  const handleSubmit = async (e) => {
    setDisable(true);

    e.preventDefault();

    const newForm = new FormData();
    console.log(completed[0]);
    newForm.append("id", companyId);
    newForm.append("companyName", companyName);
    newForm.append("address", address);
    newForm.append("city", city);
    if (companyName !== "" && city !== "" && address !== "") {
      if (isAddButtonn === true && isEditButtonn === false) {
        dispatch(createDeliverer(newForm)).then(() => {
          dispatch(getAllDeliverersPage());
          handleClose();
          dispatch({ type: "clearMessages" });
        });
      }

      if (isAddButtonn === false && isEditButtonn === true) {
        dispatch(
          updateDeliverer(companyId, companyName, contact, city, address)
        )
          .then(() => {
            toast.success("Deliverer updated successfully");
            dispatch(getAllDeliverersPage());
            handleClose();
            dispatch({ type: "clearMessages" });
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });

        //edit the customer
      }
    } else {
      toast.error("fill in all fields");
      setDisable(false);
    }
  };

  console.log(isUserAllowedToEdit);

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

  const handleCloseAuthenticationPopup = (event, delivererId) => {
    console.log("contr id", delivererId);
    if (delivererId === undefined || delivererId === "backdropClick") {
      setIsPopupSelected(false);
      setAnchorEl(null);
      console.log("close done", isPopupSelected);
    } else {
      setIsPopupSelected(false);
      if (isEditSelected) {
        handleEdit(delivererId);
      }
      if (isDeleteSelected) {
        handleDelete(delivererId);
      }
    }
  };

  //functions for dealing with the popover end

  const columns = [
    {
      field: "companyName",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
    },
    {
      field: "contact",
      headerName: "Contact",
      flex: 1.5,
      sortable: false,
    },
    {
      field: "totalJobs",
      headerName: "Total Jobs",
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
            onClick={() => handleView(params.row._id)}
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

          {/**Handlling the authentication for editing the details for the customer */}

          <IconButton
            aria-label="Delete"
            onClick={(event) =>
              authenticateUser(event, params.row._id, "delete")
            }
          >
            <GridDeleteIcon />
          </IconButton>
          {isPopupSelected && (
            <BasicPopover
              labelId={id}
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
        <Header title="Providers" subtitle="See all your providers." />
        <Box>
          <Button
            disabled
            sx={{
              backgroundColor: theme.palette.secondary.light,
              color: theme.palette.background.alt,
              fontSize: "16px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
            onClick={handleClickOpen}
          >
            <Business sx={{ mr: "10px" }} />
            {totalCount}
          </Button>
        </Box>
        <Box>
          <Button
            sx={{
              backgroundColor: theme.palette.secondary.light,
              color: theme.palette.background.alt,
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              ":hover": {
                backgroundColor: theme.palette.secondary[100],
              },
            }}
            onClick={handleClickOpen}
          >
            <AddBusiness sx={{ mr: "10px" }} />
            Add
          </Button>
        </Box>
      </FlexBetween>
      {/**Add Deliverer dialogue start */}
      <div>
        <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
          <form onSubmit={handleSubmit}>
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
                Deliverer
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
                      <Box
                        sx={{ mt: "0.5rem" }}
                        display="flex"
                        maxWidth={"400px"}
                        margin={"auto"}
                        padding={"0rem 5rem"}
                        flexDirection="column"
                        alignItems={"center"}
                        justifyContent={"center"}
                      >
                        {activeStep === 0 && (
                          <Box display={"flex"} flexDirection={"column"}>
                            <FormControl sx={{ m: 1, minWidth: 250 }}>
                              <TextField
                                disabled={disableSelect}
                                required
                                variant="outlined"
                                type="text"
                                label="Company Name"
                                color="info"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                              />
                            </FormControl>
                            <Box display={"flex"}>
                              <FormControl sx={{ m: 1, minWidth: 180 }}>
                                <Cities
                                  name={city}
                                  onChange={(e) => setCity(e.target.value)}
                                  disabled={disableSelect}
                                />
                              </FormControl>
                              <FormControl sx={{ m: 1, minWidth: 250 }}>
                                <TextField
                                  disabled={disableSelect}
                                  required
                                  variant="outlined"
                                  type="text"
                                  label="Address"
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  color="info"
                                />
                              </FormControl>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </React.Fragment>
                  }
                </div>
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: "center",
              }}
            >
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

                {activeStep === lastStep && (isAddButtonn || isEditButtonn) && (
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
                        backgroundColor: theme.palette.secondary[300],
                      },
                      ":disabled": {
                        backgroundColor: theme.palette.secondary[300],
                      },
                    }}
                  >
                    {isAddButtonn && !isEditButtonn && <>Add Admin</>}
                    {!isAddButtonn && isEditButtonn && <>Edit Admin</>}
                  </Button>
                )}
              </Box>
            </DialogActions>
          </form>
        </Dialog>
      </div>
      {/**Add Deliverer dialogue ends
       *
       */}

      {/**Where the info goes */}
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
          loading={isPageDeliverersLoading || !deliverersPage}
          getRowId={(row) => row._id}
          rows={(deliverersPage && deliverersPage) || []}
          columns={columns}
          rowCount={totalCount || 0}
          rowsPerPageOptions={[25, 50, 100]}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          sortingMode="server"
          onPageChange={(newPage) => setPagee(newPage)}
          onPageSizeChange={(newPageSize) => setPageSizee(newPageSize)}
          onSortModelChange={(newSortModel) => setSort(...newSortModel)}
          components={{ Toolbar: DataGridCustomToolbar }}
          componentsProps={{
            toolbar: { searchInput, setSearchInput, setJobSearch, results },
          }}
        />
      </Box>
      {/**Where the info ends */}
    </Box>
  );
};

export default DeliverersPage;
