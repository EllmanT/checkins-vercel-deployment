import axios from "axios";
import { server } from "server";

export const createVisit = (newForm) => async (dispatch) => {
  try {
    dispatch({
      type: "loadVisitCreateRequest",
    });

    const config = { Headers: { "Content-Type": "multipart/formdata" } };

    const { data } = await axios.post(
      `${server}/visit/create-visit`,
      newForm,
      config
    );
    dispatch({
      type: "loadVisitCreateSuccess",
      payload: data.visit,
    });
  } catch (error) {
    dispatch({
      type: "loadVisitCreateFailed",
      payload: error.response.data.message,
    });
  }
};

// get All Visits for a deliverer
export const getAllVisitsDeliverer = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllVisitsDelivererRequest",
    });

    const { data } = await axios.get(`${server}/visit/get-all-visits-company`, {
      withCredentials: true,
    });
    dispatch({
      type: "getAllVisitsDelivererSuccess",
      payload: data.delivererWithVisits,
    });
  } catch (error) {
    dispatch({
      type: "getAllVisitsDelivererFailed",
      payload: error.response.data.message,
    });
  }
};

// get All Visits for a deliverer
export const getAllVisitsPage =
  (page, pageSize, sort, search) => async (dispatch) => {
    try {
      dispatch({
        type: "getAllVisitsPageRequest",
      });

      const { data } = await axios.get(`${server}/visit/get-all-visits-page`, {
        withCredentials: true,
        params: {
          page,
          pageSize,
          sort,
          search,
        },
      });

      dispatch({
        type: "getAllVisitsPageSuccess",
        payload: data.pageVisits,
      });
      dispatch({
        type: "setTotalCount",
        payload: data.totalCount,
      });
    } catch (error) {
      dispatch({
        type: "getAllVisitsPageFailed",
        payload: error.response.data.message,
      });
    }
  };

//get the latest visits for the deliverere

export const getLatestVisitsDeliverer =
  (page, pageSize, searcha, sort, sorta, contractor, visitsearch) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "getLatestVisitsDelivererRequest",
      });

      const { data } = await axios.get(
        `${server}/visit/get-latest-visits-deliverer`,
        {
          withCredentials: true,
          params: {
            page,
            pageSize,
            searcha,
            sort,
            sorta,
            contractor,
            visitsearch,
          },
        }
      );
      dispatch({
        type: "getLatestVisitsDelivererSuccess",
        payload: data.latestDelivererVisits,
      });
    } catch (error) {
      dispatch({
        type: "getLatestVisitsDelivererFailed",
        payload: error.response.data.message,
      });
    }
  };

export const updateVisit =
  (
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
    contactPersonId
  ) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "updateVisitRequest",
      });

      const { data } = await axios.put(
        `${server}/visit/update-visit`,
        {
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
          contactPersonId,
        },
        { withCredentials: true }
      );

      dispatch({
        type: "updateVisitSuccess",
        payload: data.visit,
      });
    } catch (error) {
      dispatch({
        type: "updateVisitFailed",
        payload: error.response.data.message,
      });
    }
  };

// delete Visit of
export const deleteVisit = (visitId) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteVisitRequest",
    });

    const { data } = await axios.delete(
      `${server}/visit/delete-visit/${visitId}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteVisitSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteVisitFailed",
      payload: error.response.data.message,
    });
  }
};
