import {
  AddTask,
  AnalyticsOutlined,
  Email,
  ExitToAppOutlined,
  ReceiptLongOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FlexBetween from "component/deliverer/FlexBetween";
import Header from "component/deliverer/Header";
import StatBox from "component/deliverer/Statbox";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllDeliverersPage } from "redux/actions/deliverer";
import {
  getAllVisitsPage,
  getLatestVisitsDeliverer,
  updateVisit,
} from "redux/actions/visit";
import { getAllOverallStatsDeliverer } from "redux/actions/overallStats";
import AddVisitPopup from "component/addVisitPopup";

import PropTypes from "prop-types";
import { autocompleteClasses } from "@mui/material/Autocomplete";
import ListSubheader from "@mui/material/ListSubheader";
import Popper from "@mui/material/Popper";
import { styled } from "@mui/material/styles";
import { VariableSizeList } from "react-window";
import { getAllCurrentClientsDeliverer } from "redux/actions/contractor";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import socketIO, { io } from "socket.io-client";
import { endpoint } from "socketIOEndpoint";

const GuardDashboardPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //dealing with emitting real time changes START
  const socketId = socketIO(endpoint, { transports: ["websocket"] });


  //dealing with emitting real time changes END

  const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");
  const { user, delivererName, loading } = useSelector((state) => state.user);
  const { coOverallStats, isCoOverallStatsLoading } = useSelector(
    (state) => state.overallStats
  );
  const { deliverersPage, isPageDeliverersLoading } = useSelector(
    (state) => state.deliverers
  );
  let deliverer;
  let delivererId;

  deliverer =
    deliverersPage &&
    !isPageDeliverersLoading &&
    user &&
    deliverersPage.find((d) => d._id === user.companyId);

  if (deliverer) {
    delivererId = deliverer._id;
  }
  useEffect(() => {
    dispatch(getAllOverallStatsDeliverer());
    dispatch(getLatestVisitsDeliverer());
      dispatch(getAllCurrentClientsDeliverer());
    dispatch(getAllCurrentClientsDeliverer());
    dispatch(getAllDeliverersPage());
  }, [dispatch]);

  let highestRevenue = 0;
  let topContractorRevenue = "";
  let topContractorVisits = "";
  let mostVisits = 0;

  if (
    !isCoOverallStatsLoading &&
    coOverallStats &&
    coOverallStats.visitsByContractor &&
    coOverallStats.revenueByContractor
  ) {
    const visitsByContractor = coOverallStats.visitsByContractor;
    const revenueByContractor = coOverallStats.revenueByContractor;
    //getting the contractor that gives most visits
    for (const contractorId in visitsByContractor) {
      if (visitsByContractor.hasOwnProperty(contractorId)) {
        const visit = visitsByContractor[contractorId];

        if (visit > mostVisits) {
          mostVisits = visit;
          topContractorVisits = contractorId;
        }
      }
    }
    //getting the contractor that gives most revenue
    for (const contractorId in revenueByContractor) {
      if (revenueByContractor.hasOwnProperty(contractorId)) {
        const revenue = revenueByContractor[contractorId];

        if (revenue > highestRevenue) {
          highestRevenue = revenue;
          topContractorRevenue = contractorId;
        }
      }
    }
  }

  //getting the %increase in sales for the
  let percentage = "";
  let latestMonth = "";
  let secondLatestMonth = "";
  let isPercentage = false;
  let latestMonthVisits = 0;
  let textColor = "";

  if (coOverallStats && coOverallStats.monthlyData) {
    let numberofMonths = 0;
    let findSecondLatestMonth = 0;
    let secondLatestMonthVisits = 0;
    let findThirdLatestMonth = 0;
    let thirdLatestMonth = "";
    let thirdLatestMonthVisits = 0;
    let findLatestMonth = 0;
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    }); // Get month name

    const visitsMonthlyData = coOverallStats && coOverallStats.monthlyData;
    findLatestMonth = visitsMonthlyData.length - 1;
    latestMonth = visitsMonthlyData[findLatestMonth].month;
    const latestMonthData = visitsMonthlyData.find(
      (visit) => visit.month === latestMonth
    );
    latestMonthVisits = latestMonthData.totalVisits;

    //we are using this logic because we are saying
    //lets assume that there are 3 months.
    //the last month indicates to us that information for month 2 has been completed assumption
    numberofMonths = visitsMonthlyData.length;

    if (numberofMonths >= 3) {
      isPercentage = true;
    } else {
      isPercentage = false;
    }

    if (isPercentage === true) {
      findSecondLatestMonth = findLatestMonth - 1;
      secondLatestMonth = visitsMonthlyData[findSecondLatestMonth].month;
      const secondLatestMonthData = visitsMonthlyData.find(
        (visit) => visit.month === secondLatestMonth
      );
      secondLatestMonthVisits = secondLatestMonthData.totalVisits;

      findThirdLatestMonth = findLatestMonth - 2;
      thirdLatestMonth = visitsMonthlyData[findThirdLatestMonth].month;
      const thirdLatestMonthData = visitsMonthlyData.find(
        (visit) => visit.month === thirdLatestMonth
      );
      thirdLatestMonthVisits = thirdLatestMonthData.totalVisits;

      const change = secondLatestMonthVisits - thirdLatestMonthVisits;
      percentage = (change / thirdLatestMonthVisits) * 100;

      //  console.log(change);

      if (percentage > 0) {
        percentage = "+" + percentage;
      } else {
        percentage = "-" + percentage;
      }
      textColor = percentage > 0 ? "green" : "red";
    }
  }
  //converting date
  const shortMonth = (month) => {
    var shortMonth = new Date(Date.parse(month + " 1, 2000")).toLocaleString(
      "default",
      { month: "short" }
    );
    return shortMonth;
  };

  const handleAnalytics = (delivererId) => {
    console.log(delivererId);
    navigate(`/visit-analytics/${delivererId}`);
  };

  //variables for viewing adding the visit for the guard
  const [tradeCompanyId, setTradeCompanyId] = useState("");

  const [disable, setDisable] = useState(false);
  const [open, setOpen] = useState(false);
  const [pagee, setPagee] = useState(0);
  const [pageSizee, setPageSizee] = useState(25);
  const [sort, setSort] = useState({});
  const [search, setJobSearch] = useState("");
  const [addedVisit, setAddedVisit] = useState("");
  const [chosenVisit, setChosenVisit] = useState({});
  const [isView, setIsView] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isAddButtonn, setIsAddButtonn] = useState(false);
  const [isEditButtonn, setIsEditButtonn] = useState(false);

  const [isAddNewCustomerButtonSelected, setIsAddNewCustomerButtonSelected] =
    useState(false);

  const isReset = () => {};

  //THis function jusst closes the dialogue box

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };
  const handleClickOpen = () => {
    setIsAddButtonn(true);
    setIsEditButtonn(false);
    setIsView(false);
    setIsEdit(false);
    setOpen(true);
    setIsAddNewCustomerButtonSelected(false);
  };
  const handleClickOpenNewClient = () => {
    setIsAddButtonn(true);
    setIsEditButtonn(false);
    setIsView(false);
    setIsEdit(false);
    setOpen(true);
    setIsAddNewCustomerButtonSelected(true);
  };

  const { delCurrentClients, isCurrentClientsLoading } = useSelector(
    (state) => state.contractors
  );
  let dContractors = [];
  let dVisits = [];
  if (!isCurrentClientsLoading) {
    dContractors = delCurrentClients
      ? delCurrentClients.flatMap((i) => i.contractors)
      : [];
    dVisits = delCurrentClients
      ? delCurrentClients.flatMap((i) => i.currentVisitIds)
      : [];
  }

  const updatedContractors = dContractors.map((contractor, index) => {
    // Check if the corresponding visitId exists
    if (index < dVisits.length) {
      // Add the visitId to the contractor object
      return { ...contractor, visitId: dVisits[index] };
    }
    // If the visitId is missing, return the contractor object as is
    return contractor;
  });

  /// rendering 100000 intems mui

  const LISTBOX_PADDING = 8; // px

  function renderRow(props) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const contractor = dContractors[index];
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

  const { visitsPage, totalCount, isPageVisitsLoading } = useSelector(
    (state) => state.visits
  );

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
      dispatch(getAllVisitsPage(page, pageSize, JSON.stringify(sort), search));
    }
  }, [page, pageSize, sort, search, dispatch]);
  const now = dayjs();
  const [timeIn, setTimeIn] = React.useState(now);
  const [timeOut, setTimeOut] = React.useState("");
  const [isAddButton, setIsAddButton] = useState("");
  const [isEditButton, setIsEditButton] = useState("");

  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [tin, setTin] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [visitId, setVisitId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [isTimeOutButtonDisabled, setIsTimeOutButtonDisabled] = useState(true);
  const [isTimeInButtonDisabled, setIsTimeInButtonDisabled] = useState(false);
  const [status, setStatus] = useState("");
  //getting the user roles so that I can check what the user has access to
  const handleAutocompleteChange = (selectedCompany) => {
    console.log(selectedCompany);
    setTradeCompanyId(selectedCompany);

    const selectedVisit =
      visitsPage &&
      visitsPage.find((visit) => visit._id === selectedCompany.visitId);

    //updating the info for the visit
    setVisitId(selectedVisit._id);
    setTradeCompanyId(selectedVisit.contractorId);
    setTicketNumber(selectedVisit.ticketNumber);
    setName(selectedVisit.name);
    setPhoneNumber(selectedVisit.phoneNumber);
    setEmail(selectedVisit.email);
    setRegNumber(selectedVisit.regNumber);
    setReasonForVisit(selectedVisit.reasonForVisit);
    setStatus(selectedVisit.status);
    const parsedTimeIn = dayjs(selectedVisit.timeIn); // Parse the timeIn value into a dayjs obje

    setTimeIn(parsedTimeIn);

    setIsTimeInButtonDisabled(true);
    if (user.role === "Guard Admin") {
      setIsTimeOutButtonDisabled(false);
      setTimeOut(dayjs());
    }

    setAddress(selectedVisit.address);
  };

  //end of the updating

  const handleSubmit = async (e) => {
    setDisable(true);
    e.preventDefault();

    const newForm = new FormData();

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
          companyId
        )
      )
        .then(() => {
          toast.success("Visit updated successfully");
          //   handleClose();
          socketId.emit("update-visit");
          socketId.on("update-complete", () => {
            dispatch(
              getAllVisitsPage(page, pageSize, JSON.stringify(sort), search)
            );
            setTradeCompanyId("");
            setStatus("");
            dispatch(getAllCurrentClientsDeliverer());
            dispatch({ type: "clearMessages" });
            setDisable(false);
          });
        })
        .catch((error) => {
          toast.error(error.res.data.message);
        });

      //edit the Visit
    } else {
      toast.error("Company Name or time is missing");
      setDisable(false);
    }
  };

  ///end of the first code

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title={delivererName} />
        <Box>
          <Button
            variant="outlined"
            color="info"
            sx={{
              m: "1rem",
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              ":hover": {
                //  backgroundColor: theme.palette.secondary[100],
              },
            }}
          >
            <AnalyticsOutlined sx={{ mr: "10px" }} />
            Current Clients : {dContractors.length}
          </Button>
        </Box>
        <Box>
          <Button
             onClick={handleClickOpen}
            variant="outlined"
            color="success"
            sx={{
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              ":hover": {
                // backgroundColor: theme.palette.secondary[300],
              },
            }}
          >
            <TrendingUpOutlined sx={{ mr: "10px" }} />+ walk-in
          </Button>
        </Box>
      </FlexBetween>

      <Box
        mt="20px"
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="160px"
        gap="20px"
        sx={{
          "& > div": { gridColumn: isNonMediumScreens ? undefined : "span 12" },
        }}
      >
        {/* ROW 1 */}
        <StatBox
          title="Total Visits"
          value={coOverallStats && coOverallStats.yearlyVisits}
          increase={
            !isPercentage
              ? shortMonth(latestMonth)
              : shortMonth(secondLatestMonth)
          }
          description={
            <span style={{ color: textColor }}>
              {!isPercentage ? `${latestMonthVisits} ` : `${percentage}%`}
            </span>
          }
          icon={
            <Email
              sx={{ color: theme.palette.secondary[300], fontSize: "26px" }}
            />
          }
        />

        <Box></Box>

        <Box
          id="print-content-slc"
          position={"relative"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={theme.palette.background.alt}
          p="1rem"
          borderRadius="1rem"
          boxShadow="3px 5px 8px #ccc"
        >
          <Box display={"flex"} flexDirection={"column"}>
            <Typography variant="h5" fontWeight={"bold"}></Typography>

            <Box display={"flex"}>
              <Button
                onClick={handleClickOpenNewClient}
                variant="outlined"
                color="inherit"
                size="large"
                sx={{
                  margin: "1rem",
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  ":hover": {
                    // backgroundColor: theme.palette.secondary[300],
                  },
                }}
              >
                <TrendingUpOutlined sx={{ mr: "10px" }} />+ New-client
              </Button>
              <Button
                onClick={handleClickOpen}
                variant="contained"
                color="success"
                size="large"
                sx={{
                  margin: "1rem",
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  ":hover": {
                    // backgroundColor: theme.palette.secondary[300],
                  },
                }}
              >
                <TrendingUpOutlined sx={{ mr: "10px" }} />+ CHECK-IN
              </Button>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box
                display={"flex"}
                flexDirection={"column"}
                sx={{
                  cursor: disable ? "not-allowed" : "pointer",
                }}
              >
                <FormControl sx={{ ml: 2, mr: 2, mt: 1, width: 360 }}>
                  <Autocomplete
                    disabled={disable}
                    id="virtualize-demo"
                    sx={{ width: 360 }}
                    color="info"
                    disableListWrap
                    value={tradeCompanyId === "" ? "" : tradeCompanyId}
                    onChange={(event, selectedCompany) =>
                      handleAutocompleteChange(selectedCompany)
                    }
                    isOptionEqualToValue={(option, value) =>
                      option._id === value?._id || value === ""
                    }
                    PopperComponent={StyledPopper}
                    ListboxComponent={ListboxComponent}
                    options={updatedContractors}
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

                <FormControl sx={{ ml: 2, mr: 2, mt: 1, width: 360 }}>
                  <InputLabel id="demo-simple-select-autowidth-label">
                    Status
                  </InputLabel>
                  <Select
                    disabled={disable}
                    labelId="simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    autoWidth
                    variant="outlined"
                    color="info"
                    label="Status"
                    defaultValue="Pending Assistance"
                  >
                    <MenuItem value="pending" selected={true}>
                      Pending Assistance
                    </MenuItem>
                    <MenuItem value="assisted">Client was assisted</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  disabled={disable}
                  type="submit"
                  variant="contained"
                  color="warning"
                  size="la"
                  sx={{
                    margin: "1rem",
                    fontSize: "14px",
                    fontWeight: "bold",
                    padding: "10px 20px",
                    ":hover": {
                      // backgroundColor: theme.palette.secondary[300],
                    },
                  }}
                >
                  <ExitToAppOutlined sx={{ mr: "10px" }} />
                  CHECK-OUT
                </Button>
              </Box>
            </form>
            {open && (
              <AddVisitPopup
                open={true}
                search={search}
                sort={sort}
                page={page}
                pageSize={pageSize}
                handleClose={handleClose}
                isReset={isReset}
                selectedVisit={chosenVisit}
                isView={isView}
                isEdit={isEdit}
                isAddButton={isAddButtonn}
                isEditButton={isEditButtonn}
                isAddNewCustomerButtonSelected={isAddNewCustomerButtonSelected}
                name={addedVisit}
                onChange={(e) => setAddedVisit(e.target.value)}
              />
            )}
          </Box>
        </Box>

        <StatBox
          title="Clients"
          value={coOverallStats && coOverallStats.totalContractors}
          increase={topContractorVisits && topContractorVisits}
          description={topContractorVisits && `${mostVisits} `}
          icon={
            <ReceiptLongOutlined
              sx={{ color: theme.palette.secondary[300], fontSize: "26px" }}
            />
          }
        />

        {/* ROW 2 */}
      </Box>
    </Box>
  );
};

export default GuardDashboardPage;
