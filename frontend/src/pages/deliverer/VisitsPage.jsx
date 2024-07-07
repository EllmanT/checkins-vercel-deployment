import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridDeleteIcon,
  GridVisibilityOffIcon,
} from "@mui/x-data-grid";
import {
  Autorenew,
  Close,
  Done,
  DoneAll,
  EditNotifications,
  EditSharp,
  Group,
  GroupAdd,
  TrendingUpOutlined,
  Visibility,
} from "@mui/icons-material";
import FlexBetween from "component/deliverer/FlexBetween";
import Header from "component/deliverer/Header";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  createVisit,
  deleteVisit,
  getAllVisitsPage,
} from "redux/actions/visit";
import AddVisitPopup from "component/addVisitPopup";
import Store from "redux/store";
import DataGridCustomToolbar from "component/deliverer/DataGridCustomToolbar";
import dayjs from "dayjs";
import { io } from "socket.io-client";
import  socketIO  from "socket.io-client";

const VisitsPage = () => {
  const { user, loading } = useSelector((state) => state.user);
  const socket = io("http://localhost:3005"); // Replace with your Socket.IO server URL
  const ENDPOINT = "http://localhost:3005";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });


  socket.on("connect", () => {
    console.log("connected on", socket.id);

  });
  const theme = useTheme();
  const dispatch = useDispatch();

  const [pagee, setPagee] = useState(0);
  const [pageSizee, setPageSizee] = useState(25);
  const [sort, setSort] = useState({});
  const [search, setJobSearch] = useState("");
  const [results, setResults] = useState("");
  const [totalVisits, setTotalVisits] = useState(0);
  const [searchInput, setSearchInput] = useState("");
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

  if (!isPageVisitsLoading && !loading) {
    console.log(visitsPage);
    console.log(start);
    console.log(user);
  }

  const [disable, setDisable] = useState(false);
  const [open, setOpen] = useState(false);

  const [addedVisit, setAddedVisit] = useState("");
  const [chosenVisit, setChosenVisit] = useState({});
  const [isView, setIsView] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isAddButtonn, setIsAddButtonn] = useState(false);
  const [isEditButtonn, setIsEditButtonn] = useState(false);
  const [name, setName] = useState(false);
  const [visitId, setVisitId] = useState("");
  const [visitToDeleteName, setVisitToDeleteName] = useState("");
  const [isAddNewCustomerButtonSelected, setIsAddNewCustomerButtonSelected] =
    useState(false);


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

  const isReset = () => {};

  //THis function jusst closes the dialogue box

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };

  //this function handles the viewing of the user information dialogue
  const handleView = (visitId) => {
    const selectedVisit =
      visitsPage && visitsPage.find((visit) => visit._id === visitId);
    setChosenVisit(selectedVisit);
    setIsView(true);
    setIsEdit(false);
    setIsAddButtonn(false);
    setIsEditButtonn(false);
    setOpen(true);
  };

  //This function handles with the editing of the user information dialogue
  const handleEdit = (visitId) => {
    const selectedVisit =
      visitsPage && visitsPage.find((visit) => visit._id === visitId);
    setChosenVisit(selectedVisit);
    setIsEditButtonn(true);
    setIsAddButtonn(false);
    setIsView(false);
    setIsEdit(true);
    setOpen(true);
  };

  //deleting a visit
  const [isDelete, setIsDelete] = useState(false);
  //this function handles the deleting of the visits information
  const handleDelete = (visitId) => {
    dispatch(deleteVisit(visitId))
      .then(() => {
        // The deleteVisit action has successfully executed
        toast.success("Visit deleted successfully");
        dispatch(
          getAllVisitsPage(page, pageSize, JSON.stringify(sort), search)
        );
        handleDeleteDialogueClose();
      })
      .catch((error) => {
        // An error occurred during the deleteVisit action
        toast.error(error.response.data.message);
      });
  };

  const handleDeleteDialogue = (visitId) => {
    const selectedVisit =
      visitsPage && visitsPage.find((visit) => visit._id === visitId);

    setVisitId(visitId);
    setVisitToDeleteName(selectedVisit.contractorId.tradeName);
    setIsDelete(true);
  };

  //This function handles the  closing of the delete dialogue box
  const handleDeleteDialogueClose = () => {
    setIsDelete(false);
  };

  //functions for dealing with the popover start
  const [isPopupSelected, setIsPopupSelected] = useState(false);
  const [typeId, setTypeId]= useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const id = isPopupSelected ? "simple-popover" : undefined;
  const authenticateUser = (event,delivererId) => {
    setTypeId(delivererId);
    setIsPopupSelected(true);
    console.log(delivererId)
    console.log(isPopupSelected, "ispopuselected")
    setAnchorEl(event.currentTarget);

    console.log("anchor El", anchorEl)
  
  }

  const handleCloseAuthenticationPopup = (event, delivererId) => {
    console.log(delivererId, "this is the id")
    if (delivererId === undefined || delivererId==="backdropClick") {
      setIsPopupSelected(false);
      setAnchorEl(null);
      console.log("close done", isPopupSelected)
    }else{
      setIsPopupSelected(false)
      handleEdit(delivererId)
      console.log(delivererId)
    }
  };
  

  //functions for dealing with the popover end



  const columns = [
    {
      field: "contractorId",
      headerName: "Trade Name",
      flex: 1,
      renderCell: (params) => <>{params.row.contractorId.tradeName}</>,
    },
    {
      field: "ticketNumber",
      headerName: "Ticket No",
      flex: 1,
    },
    {
      field: "timeIn",
      headerName: "Time In",
      flex: 1,
      valueGetter: (params) =>
        dayjs(params.row.timeIn).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      field: "timeOut",
      headerName: "Time Out",
      flex: 1,
      valueGetter: (params) => {
        const timeOut = params.row.timeOut;
        if (timeOut) {
          return dayjs(timeOut).format("YYYY-MM-DD HH:mm:ss");
        } else {
          return "";
        }
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) =>
        params.value ? (
          params.value === "pending" ? (
            <Button size="small" variant="contained" color="warning">
              <Autorenew />
              {params.value}
            </Button>
          ) : (
            <Button size="small" variant="contained" color="success">
              <Done />
              {params.value}
            </Button>
          )
        ) : null,
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

          {params.row.timeOut === null ? (
            <IconButton
              color="info"
              aria-label="Edit"
              onClick={() => handleEdit(params.row._id)}
            >
              <EditSharp />
            </IconButton>
          ) : (
            <IconButton disabled>
              <EditSharp style={{ visibility: "hidden" }} />
            </IconButton>
          )}

          <IconButton
            color="error"
            aria-label="Delete"
            onClick={() => handleDeleteDialogue(params.row._id)}
          >
            <GridDeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Walk-ins" subtitle="See all your Walk-ins." />

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

        <Box display={"flex"}>
          <Button
            onClick={handleClickOpenNewClient}
            variant="outlined"
            color="inherit"
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
            variant="outlined"
            color="info"
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
            <TrendingUpOutlined sx={{ mr: "10px" }} />+ walk-in
          </Button>
        </Box>
      </FlexBetween>
      <Dialog
        open={isDelete}
        onClose={handleDeleteDialogueClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" fontWeight={"bold"}>
          {`Delete Visit Id : ${visitId}?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove visit by{" "}
            <b> {visitToDeleteName} </b> from the system ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="info"
            onClick={() => handleDeleteDialogueClose()}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={() => handleDelete(visitId)}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/**This is where the add visit dialogue starts */}
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
      {/**This is where the add Visit dialogue ends */}

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
          loading={isPageVisitsLoading || !visitsPage}
          getRowId={(row) => row._id}
          rows={(visitsPage && visitsPage) || []}
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

export default VisitsPage;
