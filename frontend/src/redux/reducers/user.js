import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loading: true,
};

export const userReducer = createReducer(initialState, {
  //load user Request
  loadUserRequest: (state) => {
    state.loading = true;
  },
  //load userSuccess
  loadUserSuccess: (state, action) => {
    state.user = action.payload;
    state.isAuthenticated = true;
    state.loading = false;
  },
  // load the companyName
  loadCompanyName: (state, action) => {
    state.delivererName = action.payload;
    state.loading = false;

  },
  //load user failed

  loadUserFailed: (state, action) => {
    state.error = action.payload;
    state.isAuthenticated = false;
    state.loading = false;

  },

  //getAllAdminsPageRequest

  getAllAdminsPageRequest: (state) => {
    state.isPageAdminsLoading = true;
  },
  getAllAdminsPageSuccess: (state, action) => {
    state.adminsPage = action.payload;
    state.isPageAdminsLoading = false;

  },
  setTotalCount: (state, action) => {
    // Add this new reducer case
    state.totalCount = action.payload;
  },

  getAllAdminsPageFailed: (state, action) => {
    state.error = action.payload;
    state.isPageAdminsLoading = false;

  },

  //updating the admin

  updateAdminRequest: (state) => {
    state.isUpdateAdmin = true;
  },
  updateAdminSuccess: (state, action) => {
    state.admin = action.payload;
    state.isUpdateAdmin = false;

  },
  updateAdminFailed: (state, action) => {
    state.error = action.payload;
    state.isUpdateAdmin = false;

  },

  // delete Admin of a shop
  deleteAdminRequest: (state) => {
    state.isLoading = true;
  },
  deleteAdminSuccess: (state, action) => {
    state.message = action.payload;
    state.isLoading = false;

  },
  deleteAdminFailed: (state, action) => {
    state.error = action.payload;
    state.isLoading = false;

  },

  //clear Errors
  clearErrors: (state) => {
    state.error = null;
  },
});
