import { createReducer } from "@reduxjs/toolkit";
const initialState = {
  isLoading: true,
};

export const visitReducer = createReducer(initialState, {
  //request
  loadVisitCreateRequest: (state) => {
    state.isLoading = true;
  },

  //load Visit success
  loadVisitCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.Visit = action.payload;
    state.success = true;
  },

  //load Visit failed
  loadVisitCreateFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  //load the Visits for the deliverer
  getAllVisitsDelivererRequest: (state) => {
    state.isDelCustLoading = true;
  },
  getAllVisitsDelivererSuccess: (state, action) => {
    state.isDelCustLoading = false;
    state.delVisits = action.payload;
  },
  getAllVisitsDelivererFailed: (state, action) => {
    state.isDelCustLoading = false;
    state.error = action.payload;
  },

  //load the Visits for the deliverer
  getAllVisitsPageRequest: (state) => {
    state.isPageCustLoading = true;
  },
  getAllVisitsPageSuccess: (state, action) => {
    state.visitsPage = action.payload;
    state.isPageCustLoading = false;

  },
  setTotalCount: (state, action) => { // Add this new reducer case
    state.totalCount = action.payload;
  },
  getAllVisitsPageFailed: (state, action) => {
    state.isPageCustLoading = false;
    state.error = action.payload;
  },

  //updating the Visit

  updateVisitRequest: (state) => {
    state.isUpdateVisit = true;
  },
  updateVisitSuccess: (state, action) => {
    state.isUpdateVisit = false;
    state.visit = action.payload;
  },
  updateVisitFailed: (state, action) => {
    state.isUpdateVisit = false;
    state.error = action.payload;
  },

    // delete Visit of a shop
    deleteVisitRequest: (state) => {
      state.isLoading = true;
    },
    deleteVisitSuccess: (state, action) => {
      state.isLoading = false;
      state.message = action.payload;
    },
    deleteVisitFailed: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  //clear errors


  getLatestVisitsDelivererRequest: (state) => {
    state.latestVisitsDelivererLoading = true;
  },
  getLatestVisitsDelivererSuccess: (state, action) => {
    state.latestVisitsDelivererLoading = false;
    state.latestVisitsDeliverer = action.payload;
  },
  getLatestVisitsDelivererFailed: (state, action) => {
    state.latestVisitsDelivererLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
  //clea success messagess

  clearMessages: (state) => {
    state.success = null;
  },
});
