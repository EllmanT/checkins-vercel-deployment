import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import {
  Add,
  AddCircleOutlineOutlined,
  Close,
  GroupAdd,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  createVisit,
  getAllVisitsPage,
  updateVisit,
} from "redux/actions/visit";
import Cities from "./Cities";
import axios from "axios";
import { server } from "server";
import { DateTimePicker } from "@mui/x-date-pickers";
import BasicDateTimePicker from "./dateTime";
import dayjs from "dayjs";
import {
  getAllContractorsDeliverer,
  getAllCurrentClientsDeliverer,
  updateContactPerson,
} from "redux/actions/contractor";

import PropTypes from "prop-types";
import { autocompleteClasses } from "@mui/material/Autocomplete";
import useMediaQuery from "@mui/material/useMediaQuery";
import ListSubheader from "@mui/material/ListSubheader";
import Popper from "@mui/material/Popper";
import { styled } from "@mui/material/styles";
import { VariableSizeList } from "react-window";
import Typography from "@mui/material/Typography";
import { io } from "socket.io-client";
import socketIO from "socket.io-client";
import { endpoint } from "socketIOEndpoint";

const AddVisitPopup = ({
  open,
  isAddNewCustomerButtonSelected,
  activeStep,
  totalSteps,
  handleClose,
  selectedVisit,
  isView,
  isEdit,
  isAddButton,
  isEditButton,
  page,
  pageSize,
  sort,
  search,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  const { success, error } = useSelector((state) => state.visits);

  //dealing with emitting real time changes START
  const socket = io("http://localhost:3005"); // Replace with your Socket.IO server URL
  const socketId = socketIO(endpoint, { transports: ["websocket"] });

  socket.on("connect", () => {
    console.log("connected on", socket.id);
  });

  //dealing with emitting real time changes END

  const [disable, setDisable] = useState(false);
  const [disableSelect, setDisableSelect] = useState(false);
  const [view, setView] = useState(false);
  const [lastStep, setLastStep] = useState(0);

  const [visitId, setVisitId] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  //details for the visiting
  const now = dayjs();
  const [timeIn, setTimeIn] = React.useState(now);
  const [timeOut, setTimeOut] = React.useState("");

  const [tradeCompanyId, setTradeCompanyId] = useState("");
  const [contactPersonId, setContactPersonId] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [isTimeOutButtonDisabled, setIsTimeOutButtonDisabled] = useState(true);
  const [isTimeInButtonDisabled, setIsTimeInButtonDisabled] = useState(false);
  const [status, setStatus] = useState("pending");
  const [contactName, setContactName] = useState("");
  const [addContactDetailsSelected, setAddContactDetailsSelected] =
    useState(false);

  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");

  //start extra details for adding the new company

  const [tin, setTin] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [contactPersonsArray, setContactPersonsArray] = useState([]);
  //end of extra details for adding the new company

  useEffect(() => {
    if (isView) {
      setVisitId(selectedVisit._id);
      setTradeCompanyId(selectedVisit.contractorId);
      setContactPersonId(selectedVisit.contactPersonId);
      console.log("contact person id", selectedVisit.contactPersonId);
      if (
        (selectedVisit.contactPersonId === null ||
          selectedVisit.contactPersonId === undefined ||
          selectedVisit.contactPersonId.length === 0) &&
          (selectedVisit.contractorId.contactPersons?.length === 0||selectedVisit.contractorId.contactPersons===undefined)
        ) {
        setAddContactDetailsSelected(true);
      }
      setContactPersonsArray(selectedVisit.contractorId.contactPersons || []);

      setTicketNumber(selectedVisit.ticketNumber);
      setName(selectedVisit.name);
      setPhoneNumber(selectedVisit.phoneNumber);
      setEmail(selectedVisit.email);
      setRegNumber(selectedVisit.regNumber);
      setReasonForVisit(selectedVisit.reasonForVisit);
      setStatus(selectedVisit.status);
      const parsedTimeIn = dayjs(selectedVisit.timeIn); // Parse the timeIn value into a dayjs obje
      const parsedTimeOut = dayjs(selectedVisit.timeOut);

      setTimeIn(parsedTimeIn);

      setTimeOut(parsedTimeOut);
      setIsTimeInButtonDisabled(true);
      setIsTimeOutButtonDisabled(true);
      setLastStep(totalSteps - 1);

      setAddress(selectedVisit.address);
      setDisableSelect(true);
    }
  }, [isView, selectedVisit]);
  useEffect(() => {
    if (isEdit) {
      console.log("selected visit", selectedVisit);

      setVisitId(selectedVisit._id);
      setTradeCompanyId(selectedVisit.contractorId);
      setContactPersonId(selectedVisit.contactPersonId);
      console.log("contact person id", selectedVisit.contactPersonId);
      if (
        (selectedVisit.contactPersonId === null ||
          selectedVisit.contactPersonId === undefined ||
          selectedVisit.contactPersonId.length === 0) &&
        (selectedVisit.contractorId.contactPersons?.length === 0||selectedVisit.contractorId.contactPersons===undefined)
      ) {
        setAddContactDetailsSelected(true);
      }
      setContactPersonsArray(selectedVisit.contractorId.contactPersons || []);
      setTicketNumber(selectedVisit.ticketNumber);
      setName(selectedVisit.name);
      setPhoneNumber(selectedVisit.phoneNumber);
      setEmail(selectedVisit.email);
      setRegNumber(selectedVisit.regNumber);
      setReasonForVisit(selectedVisit.reasonForVisit);
      // setStatus("assisted");
      const parsedTimeIn = dayjs(selectedVisit.timeIn); // Parse the timeIn value into a dayjs obje

      setTimeIn(parsedTimeIn);

      setIsTimeInButtonDisabled(true);
      if (user.role === "Guard Admin") {
        setIsTimeOutButtonDisabled(false);
        setTimeOut(dayjs());
      }
      setLastStep(totalSteps - 1);

      setAddress(selectedVisit.address);
      setDisableSelect(false);
    }
  }, [isEdit, selectedVisit]);
  const { delContractors, isContrDelLoading, contactPerson } = useSelector(
    (state) => state.contractors
  );

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      dispatch({ type: "clearErrors" });
    }
    if (success) {
      toast.success("Visit added successfully");
      // onAddNewVisit(newVisit);
      handleClose();
      dispatch({ type: "clearMessages" });
      dispatch({ type: "loadCreateVisitSuccess" });
    }
    if (contactPerson) {
      console.log("contact Person is ", contactPerson);
    }
  }, [dispatch, error, success, contactPerson]);

  useEffect(() => {}, [dispatch]);

  console.log("visitId", visitId);
  let dContractors = [];

  if (!isContrDelLoading) {
    dContractors = delContractors
      ? delContractors.flatMap((i) => i.contractors)
      : [];
  }

  const handleAutocompleteChange = (selectedCompany) => {
    console.log(selectedCompany);
    setTradeCompanyId(selectedCompany);
    console.log("tradeComp Id", tradeCompanyId);
  };
  const handleAutocompleteChangeContact = (event, selectedContact) => {
    console.log(selectedContact);
    setContactPersonId(selectedContact._id);
    console.log("contact Id", contactPersonId);
    setPhoneNumber(selectedContact.phoneNumber);
    setEmail(selectedContact.email);
    console.log("contact number", selectedContact.contactNumber);
    console.log("email", selectedContact.email);
    console.log("phone Number", phoneNumber);
    console.log("email", email);
  };

  useEffect(() => {
    console.log("contactPersonId", contactPersonId);
    console.log("tradeComp Id", tradeCompanyId);
    console.log("contact persons array", contactPersonsArray);
    console.log("phone Number", phoneNumber);
    console.log("email", email);
    console.log(selectedContactPerson, "selected Contact Person");
    console.log(contactPersonId, "contact person Id");
    console.log("contact Person Id", contactPersonId);
  }, [tradeCompanyId, contactPersonId]);

  const handleSubmit = async (e) => {
    //setDisable(true);
    e.preventDefault();

    const newForm = new FormData();
    console.log(tradeCompanyId);
    console.log(contactPersonId, "contact Person ");
    let contactDetailsId = "";

    contactDetailsId = contactPersonId && contactPersonId;

    newForm.append("tradeCompanyId", tradeCompanyId._id);
    newForm.append("contactPersonId", contactDetailsId);
    newForm.append("timeIn", timeIn);
    newForm.append("timeOut", timeOut);
    newForm.append("phoneNumber", phoneNumber);
    newForm.append("regNumber", regNumber);
    newForm.append("reasonForVisit", reasonForVisit);
    newForm.append("ticketNumber", ticketNumber);
    newForm.append("status", status);
    newForm.append("email", email);
    newForm.append("companyId", user.companyId);

    //extra info for registering the new company
    if (isAddNewCustomerButtonSelected) {
      newForm.append("tin", tin);
      newForm.append("tradeName", tradeName);
    }

    const companyId = user.companyId;

    if (
      isAddNewCustomerButtonSelected ||
      (tradeCompanyId !== "" && timeIn !== "")
    ) {
      if (isAddButton === true && isEditButton === false) {
        dispatch(createVisit(newForm))
          .then(() => {
            socketId.emit("update-visit");
            socketId.on("update-complete", (message) => {
              console.log("message from the backend", message);
              dispatch(
                getAllVisitsPage(page, pageSize, JSON.stringify(sort), search)
              );
              dispatch(getAllCurrentClientsDeliverer());

              handleClose();
              dispatch({ type: "clearMessages" });
              setDisable(false);
              setAddContactDetailsSelected(false);
            });
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
      }
      if (isAddButton === false && isEditButton === true) {
        if (addContactDetailsSelected) {
          await axios
            .put(
              `${server}/contractor/update-contact-person`,
              {
                contactName,
                phoneNumber,
                email,
                tradeCompanyId,
              },
              { withCredentials: true }
            )
            .then((response) => {
              //dispatch({ type: "clearMessages" });
              contactDetailsId = response.data.contactPersonDetails._id;
              // console.log("contactDetailsId", contactDetailsId);
              console.log("this is the response", response.data);
              console.log(
                "contact person details",
                response.data.contactPersonDetails
              );
              console.log("contact person details id", contactDetailsId);

              dispatch(
                updateVisit(
                  visitId,
                  tradeCompanyId,
                  email,
                  phoneNumber,
                  regNumber,
                  timeIn,
                  timeOut,
                  ticketNumber,
                  reasonForVisit,
                  status,
                  companyId,
                  contactDetailsId
                )
              ).then(() => {
                toast.success("Visit updated successfully");
                socketId.emit("update-visit");
                socketId.on("update-complete", () => {
                  dispatch(
                    getAllVisitsPage(
                      page,
                      pageSize,
                      JSON.stringify(sort),
                      search
                    )
                  );
                  dispatch({ type: "clearMessages" });
                  handleClose();
                  setDisable(true);
                  setAddContactDetailsSelected(false);
                });
              });
              // toast.success("Contact updated successfully");
            })
            .catch((error) => {
              console.log("error occured!!");
              console.log("error is", error);
              toast.error(error);
            });
        } else {
          dispatch(
            updateVisit(
              visitId,
              tradeCompanyId,
              email,
              phoneNumber,
              regNumber,
              timeIn,
              timeOut,
              ticketNumber,
              reasonForVisit,
              status,
              companyId,
              contactDetailsId
            )
          ).then(() => {
            toast.success("Visit updated successfully");
            socketId.emit("update-visit");
            socketId.on("update-complete", () => {
              dispatch(
                getAllVisitsPage(page, pageSize, JSON.stringify(sort), search)
              );
              dispatch({ type: "clearMessages" });
              handleClose();
              setDisable(true);
              setAddContactDetailsSelected(false);
            });
          });
        }

        //edit the Visit
      }
    } else {
      toast.error("Company Name or time is missing");
      setDisable(false);
    }
  };

  /// rendering 100000 intems mui

  const LISTBOX_PADDING = 8; // px

  function renderRow(props) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const contractor = dContractors[index];
    const { tradeName, tin } = contractor;
    console.log(dataSet);
    const inlineStyle = {
      ...style,
      top: style.top + LISTBOX_PADDING,
    };

    if (dataSet.hasOwnProperty("group")) {
      return (
        <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
          {dataSet.group}
        </ListSubheader>
      );
    }

    return (
      <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
        {`#${dataSet[2] + 1} - ${dataSet[1].tradeName} : ${dataSet[1].tin}`}
      </Typography>
    );
  }

  const OuterElementContext = React.createContext({});

  const OuterElementType = React.forwardRef((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
  });

  function useResetCache(data) {
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (ref.current != null) {
        ref.current.resetAfterIndex(0, true);
      }
    }, [data]);
    return ref;
  }

  console.log(dContractors);

  // Adapter for react-window
  const ListboxComponent = React.forwardRef(function ListboxComponent(
    props,
    ref
  ) {
    const { children, ...other } = props;
    const itemData = [];
    children.forEach((item) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    });

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
      noSsr: true,
    });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child) => {
      if (child.hasOwnProperty("group")) {
        return 48;
      }

      return itemSize;
    };

    const getHeight = () => {
      if (itemCount > 8) {
        return 8 * itemSize;
      }
      return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={getHeight() + 2 * LISTBOX_PADDING}
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={(index) => getChildSize(itemData[index])}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  });

  ListboxComponent.propTypes = {
    children: PropTypes.node,
  };

  function random(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return result;
  }

  const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
      boxSizing: "border-box",
      "& ul": {
        padding: 0,
        margin: 0,
      },
    },
  });

  //getting the user roles so that I can check what the user has access to

  //dealing with autopopulating the contact details for the client START

  //dealing with the autopopulating the contact details for the client END

  ///end of the first code

  const [selectedContactPerson, setSelectedContactPerson] = useState(null);

  const handleAddContactDetails = () => {
    setAddContactDetailsSelected(!addContactDetailsSelected);
    setPhoneNumber("");
    setEmail("");
    setContactPersonId("");
    setSelectedContactPerson(null);
  };

  //dealing with selecting a particular contact person start
  // Function to handle contact person selection

  //dealing with selecting a particular contact person end
  return (
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
            Walk In
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
        <DialogContent sx={{ overflow: "hidden" }}>
          <form onSubmit={handleSubmit}>
            <Box
              sx={{ mt: "0rem" }}
              display="flex"
              maxWidth={"400px"}
              margin={"auto"}
              flexDirection="column"
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Box display={"flex"} flexDirection={"column"}>
                <Box display={"flex"}>
                  {!isAddNewCustomerButtonSelected ? (
                    <FormControl sx={{ mt: 0.7, ml: 1, mr: 1, width: 385 }}>
                      <Autocomplete
                        disabled={disableSelect}
                        id="virtualize-demo"
                        sx={{ width: 385, color: "success" }}
                        disableListWrap
                        value={tradeCompanyId === "" ? "" : tradeCompanyId}
                        onChange={(event, selectedCompany) =>
                          handleAutocompleteChange(selectedCompany)
                        }
                        isOptionEqualToValue={(option, value) =>
                          option._id === value?._id || value === ""
                        }
                        // autoComplete="off"
                        PopperComponent={StyledPopper}
                        ListboxComponent={ListboxComponent}
                        options={dContractors}
                        //placeholder="Company Name"
                        getOptionLabel={(contractor) =>
                          contractor
                            ? contractor.tradeName + " : " + contractor.tin
                            : ""
                        }
                        // groupBy={(option) => option.toUpperCase()}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Company Name"
                            variant="outlined"
                            color="info"
                          />
                        )}
                        renderOption={(props, option, state) => [
                          props,
                          option,
                          state.index,
                        ]}
                        renderGroup={(params) => params}
                      />
                    </FormControl>
                  ) : (
                    <>
                      <FormControl sx={{ mt: 0.5, ml: 1, mr: 1, width: 250 }}>
                        <TextField
                          disabled={disableSelect}
                          //required
                          variant="outlined"
                          type="text"
                          label="Company Name"
                          color="info"
                          value={tradeName}
                          onChange={(e) => setTradeName(e.target.value)}
                        />
                      </FormControl>

                      <FormControl
                        sx={{ mt: 0.5, ml: 1, mr: 1, minWidth: 120 }}
                      >
                        <TextField
                          disabled={disableSelect}
                          //required
                          variant="outlined"
                          type="text"
                          label="TIN No."
                          color="info"
                          value={tin}
                          onChange={(e) => setTin(e.target.value)}
                        />
                      </FormControl>
                    </>
                  )}
                </Box>
                {user.role !== "Guard Admin" ? (
                  <>
                    <Box display={"flex"}>
                      <FormControl sx={{ mt: 0.7, ml: 1, mr: 1, width: 300 }}>
                        {addContactDetailsSelected ||
                        (tradeCompanyId &&
                          (!tradeCompanyId.contactPersons ||
                            tradeCompanyId.contactPersons.length === 0)) ? (
                          <>
                            <TextField
                              disabled={disableSelect}
                              //required
                              variant="outlined"
                              type="text"
                              label="Contact Name"
                              color="info"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                            />
                          </>
                        ) : (
                          <>
                            <Autocomplete
                              disabled={disableSelect}
                              id="virtualize-demo"
                              sx={{ width: 300, color: "success" }}
                              value={
                                contactPersonId === ""
                                  ? null
                                  : contactPersonsArray.find(
                                      (contact) =>
                                        contact._id === contactPersonId
                                    )
                              }
                              onChange={(event, selectedContact) =>
                                handleAutocompleteChangeContact(
                                  event,
                                  selectedContact
                                )
                              }
                              isOptionEqualToValue={(option, value) =>
                               value &&option._id === value._id || value === ""
                              }
                              options={contactPersonsArray}
                              getOptionLabel={(contact) =>
                                contact ? contact.contactName : ""
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Contact Name"
                                  variant="outlined"
                                  color="info"
                                />
                              )}
                              renderOption={(props, option, state) => (
                                <li {...props}>{option.contactName}</li>
                              )}
                              renderGroup={(params) => <li {...params} />}
                            />
                          </>
                        )}
                      </FormControl>
                      <Box>
                        <FormControl sx={{ mt: 1, ml: 1, mr: 1, width: 70 }}>
                          <Button
                            variant="contained"
                            color={!addContactDetailsSelected?"success":"info"}
                            size="small"
                            sx={{ flexDirection: "column" }}
                            onClick={handleAddContactDetails}
                            disabled={disableSelect}
                          
                          >
                            <Add />
                            {!addContactDetailsSelected
                              ? "Contact"
                              : "Existing"}
                          </Button>
                        </FormControl>
                      </Box>
                    </Box>
                    <Box display={"flex"}>
                      <FormControl sx={{ mt: 0.5, ml: 1, mr: 1, width: 250 }}>
                        <TextField
                          disabled={disableSelect}
                          required
                          variant="outlined"
                          type="text"
                          label="Email"
                          color="info"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </FormControl>

                      <FormControl
                        sx={{ mt: 0.5, ml: 1, mr: 1, minWidth: 120 }}
                      >
                        <TextField
                          disabled={disableSelect}
                          required
                          variant="outlined"
                          type="text"
                          label="Phone No."
                          color="info"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </FormControl>
                    </Box>

                    <Box display={"flex"}>
                      <FormControl sx={{ mt: 0.5, ml: 1, mr: 1, width: 250 }}>
                        <InputLabel id="demo-simple-select-autowidth-label">
                          Status
                        </InputLabel>
                        <Select
                          disabled={disableSelect}
                          labelId="simple-select-autowidth-label"
                          id="demo-simple-select-autowidth"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          autoWidth
                          label="Status"
                          defaultValue="Pending Assistance"
                        >
                          <MenuItem value="pending" selected={true}>
                            Pending Assistance
                          </MenuItem>
                          <MenuItem value="assisted">
                            Client was assisted
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl
                        sx={{ mt: 0.5, ml: 1, mr: 1, minWidth: 120 }}
                      >
                        <TextField
                          disabled={disableSelect}
                          //required
                          variant="outlined"
                          type="text"
                          label="Reg No."
                          color="info"
                          value={regNumber}
                          onChange={(e) => setRegNumber(e.target.value)}
                        />
                      </FormControl>
                    </Box>

                    <Box display={"flex"}>
                      <FormControl sx={{ m: 1, width: 200 }}>
                        <BasicDateTimePicker
                          isDisabled={isTimeInButtonDisabled}
                          value={timeIn}
                          labelName="Time In"
                          onChange={(value) => setTimeIn(value)}
                          //  defaultTime="now"
                        />
                      </FormControl>

                      <FormControl sx={{ m: 1, width: 170 }}>
                        <TextField
                          disabled={disableSelect}
                          //required
                          variant="outlined"
                          type="text"
                          label="Ticket No."
                          color="info"
                          value={ticketNumber}
                          onChange={(e) => setTicketNumber(e.target.value)}
                        />
                      </FormControl>
                    </Box>

                    <Box display={"flex"}>
                      <Box display={"flex"} flexDirection={"column"}>
                        <FormControl
                          sx={{ ml: 1, mr: 1, mb: 0.2, mt: 0.2, minWidth: 185 }}
                        >
                          <BasicDateTimePicker
                            isDisabled={isTimeOutButtonDisabled}
                            value={timeOut}
                            labelName="Time Out"
                            onChange={(value) => setTimeOut(value)}
                            //  defaultTime="now"
                          />
                        </FormControl>

                        <Typography ml={"1"} align="center" fontWeight={"bold"}>
                          Thank you for visiting!
                        </Typography>
                      </Box>

                      <FormControl
                        sx={{ mt: 0.2, ml: 1, mr: 1, minWidth: 170 }}
                      >
                        <TextField
                          disabled={disableSelect}
                          //required
                          variant="outlined"
                          type="text"
                          multiline
                          rows={2}
                          label="Reason for visit"
                          color="info"
                          value={reasonForVisit}
                          onChange={(e) => setReasonForVisit(e.target.value)}
                        />
                      </FormControl>
                    </Box>
                  </>
                ) : (
                  <>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                      <TextField
                        disabled={disableSelect}
                        //required
                        variant="outlined"
                        type="text"
                        label="Reg No."
                        color="info"
                        inputProps={{ maxLength: 7 }}
                        value={regNumber}
                        onChange={(e) =>
                          setRegNumber(
                            e.target.value.replace(/ /g, "").toUpperCase()
                          )
                        }
                      />
                    </FormControl>
                  </>
                )}

                <Box
                  display={"flex"}
                  sx={{
                    m: "-0.8rem 5rem ",

                    cursor: disable ? "not-allowed" : "pointer",
                  }}
                >
                  <Button
                    disabled={disable}
                    onClick={handleClose}
                    variant="contained"
                    size="large"
                    sx={{
                      color: theme.palette.secondary[300],

                      margin: "0.8rem",
                      border: "solid 1px",
                      ":hover": {
                        backgroundColor: theme.palette.secondary[900],
                      },
                      ":disabled": {
                        backgroundColor: theme.palette.secondary[900],
                      },
                    }}
                  >
                    Close
                  </Button>
                  {(isAddButton || isEditButton) && (
                    <Button
                      disabled={disable}
                      type="submit"
                      variant="outlined"
                      fontWeight="bold"
                      sx={{
                        color: theme.palette.secondary[100],
                        //backgroundColor: theme.palette.secondary[300],
                        margin: "0.8rem  ",
                        border: "solid 0.5px",
                        ":hover": {
                          //700 looks nicest for the dark theme and 300 best for light mode fix//
                          backgroundColor: theme.palette.secondary[300],
                        },
                        ":disabled": {
                          backgroundColor: theme.palette.secondary[300],
                        },
                      }}
                    >
                      {isAddButton && !isEditButton && <>Add </>}
                      {!isAddButton && isEditButton && <>Edit Visit</>}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </form>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </div>
  );
};

export default AddVisitPopup;
