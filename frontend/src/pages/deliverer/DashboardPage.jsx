import {
  AddTask,
  AnalyticsOutlined,
  Autorenew,
  Done,
  DownloadOutlined,
  Email,
  Groups,
  MonetizationOn,
  ReceiptLongOutlined,
  RemoveRedEye,
  TrendingDownOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import FlexBetween from "component/deliverer/FlexBetween";
import Header from "component/deliverer/Header";
import OverviewChart from "component/deliverer/OverviewChart";
import StatBox from "component/deliverer/Statbox";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllDeliverersPage } from "redux/actions/deliverer";
import { getLatestVisitsDeliverer, getLatestVisitsPage } from "redux/actions/visit";
import { getAllOverallStatsDeliverer } from "redux/actions/overallStats";
import { loadUser } from "redux/actions/user";
import OverviewVisitsChart from "./chart/OverviewVisitsChart";
import VisitsBarChart from "component/deliverer/displayCharts/VisitsBarChart";
import toast from "react-hot-toast";
//import DailyVisitsChart from "./charts/OverviewVisitsChart";
//import OverviewVisitsChart from "./charts/OverviewVisitsChart";
//import VisitsBarChart from "component/deliverer/charts/VisitsBarChart";

const DashboardPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");
  const { user, delivererName, loading } = useSelector((state) => state.user);
  const { coOverallStats, isCoOverallStatsLoading } = useSelector(
    (state) => state.overallStats
  );
  const { latestVisitsDeliverer, latestVisitsDelivererLoading } = useSelector(
    (state) => state.visits
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
    dispatch(getAllDeliverersPage());
  }, [dispatch]);

    
  console.log(deliverer);
        console.log(user)
    console.log("latest visits" ,latestVisitsDeliverer)
    
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
  let textColor="";

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
      textColor = percentage > 0 ? 'green' : 'red';

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
  //getting the total number of contractors

  const columns = [
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 3,
      valueGetter: (params) => params.row.contractorId.tradeName,
    },
    {
      field: "timeIn",
      headerName: "Time In",
      flex: 1.5,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
const minutes = String(date.getMinutes()).padStart(2, "0");
const currentTime = `${hours}:${minutes}`;
        return `${month}-${day} ${currentTime}`;
      },
    },
  
    {
      field: "status",
      headerName: "Status",
      flex: 1.5,
      renderCell: (params) =>
        params.value ? (
          params.value === "pending" ? (
            <Button    variant="contained" color="warning"  style={{ fontSize: "10px", padding: "4px 8px" }}>
              <Autorenew/>
              {params.value}
            </Button>
          ) : (
            <Button  variant="contained" color="success"  style={{ fontSize: "10px", padding: "4px 8px" }}>
              <Done/>
              {params.value}
            </Button>
          )
        ) : null,
    },
 
  ];
  const addOrder = () => {
   // navigate("/add-visit");
  };

  const handleComingSoon=()=>{
    toast('Coming soon....', {
      icon: '👏',
    });
  }

  const handleAnalytics = (delivererId) => {
    console.log(delivererId);
    navigate(`/visit-analytics/${delivererId}`);
  };
  const handleReports = (delivererId) => {
    console.log(delivererId);
    navigate(`/reports`);
  };

  const handleViewMLC = () => {};
  const handleDownloadSLC = () => {};


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
            onClick={handleComingSoon}
          >
            <AnalyticsOutlined sx={{ mr: "10px" }} />
            Analytics
          </Button>
          <Button
            variant="outlined"
            color="info"
            sx={{
              m: "1rem",
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              ":hover": {
                //     backgroundColor: theme.palette.secondary[100],
              },
            }}
            onClick={handleComingSoon}
          >
            <DownloadOutlined sx={{ mr: "10px" }} />
            Reports
          </Button>
        </Box>
        <Box>
          <Button
            onClick={()=>{
              navigate("/del-visits");
            }}
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
          increase={!isPercentage ? shortMonth(latestMonth) : shortMonth(secondLatestMonth)}
          description={
            <span style={{ color: textColor }}>
           { !isPercentage ? `${latestMonthVisits} ` : `${percentage}%`}
            </span>
          }
          icon={
            <Email
              sx={{ color: theme.palette.secondary[300], fontSize: "26px" }}
            />
          }
        />
      
        <Box
          id="print-content-slc"
          position={"relative"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          gridColumn="span 10"
          gridRow="span 2"
          backgroundColor={theme.palette.background.alt}
          p="1rem"
          borderRadius="0.55rem"
          boxShadow="3px 5px 8px #ccc"

        >
          <Box display={"flex"} >
            <Typography variant="h5" fontWeight={"bold"}>
              Monthly Analysis
            </Typography>

            <IconButton
              sx={{ ml: "8rem" }}
              onClick={() => handleViewMLC(delivererId)}
            >
              <RemoveRedEye />
            </IconButton>
            <IconButton
              sx={{ ml: "0.5rem" }}
              onClick={() => handleDownloadSLC()}
            >
              <DownloadOutlined />
            </IconButton>
          </Box>
          <OverviewVisitsChart view={"visit"} isDashboard={true} />

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

        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          gridColumn="span 6"
          gridRow="span 3"
          backgroundColor={theme.palette.background.alt}
          p="1.5rem"
          borderRadius="0.55rem"
          boxShadow="3px 5px 8px #ccc"
        >
          <Typography variant="h6" fontWeight="bold">
            Yearly Analysis
          </Typography>
          <Typography
            p="0 0.6rem"
            fontSize="0.8rem"
            sx={{ color: theme.palette.secondary[200] }}
          >
            Breakdown of all time visits for the year
          </Typography>
          <VisitsBarChart view="visits" isDashboard={true} />

        </Box>

        <Box
          p="2rem"
          gridColumn="span 6"
          gridRow="span 3"
          boxShadow="3px 5px 8px #ccc"
          backgroundColor={theme.palette.background.alt}
          //alignItems="center"
          display="flex"
          flexDirection="column"
          sx={{
            "& .MuiDataGrid-root": {
              border: "solid , 0.1rem",
              //borderWidth:"10px",
             // borderRadius: "5rem",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.background.alt,
              color: theme.palette.secondary[100],
              //borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: theme.palette.background.alt,
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: theme.palette.background.alt,
              color: theme.palette.secondary[100],
              // borderTop: "none",
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${theme.palette.secondary[200]} !important`,
            },
          }}
        >
          <Typography fontWeight="bold">Latest Visits </Typography>
          <DataGrid
            loading={latestVisitsDelivererLoading || !latestVisitsDeliverer}
            getRowId={(row) => row._id}
            rows={(latestVisitsDeliverer && latestVisitsDeliverer) || []}
            columns={columns}
            pageSizeOptions={5}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
