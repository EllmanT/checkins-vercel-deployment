import axios from "axios";
import { server } from "server";

export const createContractor = (newForm) => async (dispatch) => {
  try {
    dispatch({
      type: "loadCreateContractorRequest",
    });

    const config = { Headers: { "Content-Type": "multipart/form-data" } };
    const { data } = await axios.post(
      `${server}/contractor/create-contractor`,
      newForm,
      config
    );

    dispatch({
      type: "loadCreateContractorSuccess",
      payload: data.contractor,
    });
  } catch (error) {
    dispatch({
      type: "loadCreateContractorFailed",
      payload: error.response.data.message,
    });
  }
};

export const getAllContractorsDeliverer = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllContrDelReq",
    });
    const { data } = await axios.get(
      `${server}/contractor/get-all-contractors-deliverer`,
      { withCredentials: true }
    );
    dispatch({
      type: "getAllContrDelSuccess",
      payload: data.delivererWithContractors,
    });
  } catch (error) {
    dispatch({
      type: "getAllContrDelFailed",
      payload: error.response.data.message,
    });
  }
};

export const getAllCurrentClientsDeliverer = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllCurrentClientsDelReq",
    });
    const { data } = await axios.get(
      `${server}/contractor/get-all-current-clients-deliverer`,
      { withCredentials: true }
    );
    dispatch({
      type: "getAllCurrentClientsDelSuccess",
      payload: data.delivererWithCurrentClients,
    });
  } catch (error) {
    dispatch({
      type: "getAllCurrentClientsDelFailed",
      payload: error.response.data.message,
    });
  }
};

export const getAllContractorsPage =
  (page, pageSize, sort, search) => async (dispatch) => {
    try {
      dispatch({
        type: "getAllContrPageReq",
      });
      const { data } = await axios.get(
        `${server}/contractor/get-all-contractors-page`,
        {
          withCredentials: true,
          params: {
            page,
            pageSize,
            sort,
            search,
          },
        }
      );
      dispatch({
        type: "getAllContrPageSuccess",
        payload: data.pageContractors,
      });
      dispatch({
        type: "setTotalCount",
        payload: data.totalCount,
      });
    } catch (error) {
      dispatch({
        type: "getAllContrPageFailed",
        payload: error.response.data.message,
      });
    }
  };

export const updateContractor =
  (
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
  ) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "updateContractorRequest",
      });

      const { data } = await axios.put(
        `${server}/contractor/update-contractor`,
        {
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
        },
        {
          withCredentials: true,
        }
      );

      dispatch({
        type: "updateContractorSuccess",
        payload: data.contractor,
      });
    } catch (error) {
      dispatch({
        type: "updateContractorFailed",
        payload: error.response.data.message,
      });
    }
  };

// update user address
export const updateContactPerson =
  (contactName, contactNumber, contactEmail, tradeCompanyId) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "updateContactPersonRequest",
      });

      const { data } = await axios.put(
        `${server}/contractor/update-contact-person`,
        {
          contactName,
          contactNumber,
          contactEmail,
          tradeCompanyId,
        },
        { withCredentials: true }
      );

      // console.log("the contact details", data.contactDetails)

      dispatch({
        type: "updateContactPersonSuccess",
        payload: {
          //  successMessage: "Contact Person details updated succesfully!",
          contactPerson: data.contactPersonDetails,
        },
      });
    
    } catch (error) {
      dispatch({
        type: "updateContactPersonFailed",
        payload: error.response.data.message,
      });
    }
  };

// delete Contractor of
export const deleteContractor = (contractorId) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteContractorRequest",
    });

    const { data } = await axios.delete(
      `${server}/contractor/delete-contractor/${contractorId}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteContractorSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteContractorFailed",
      payload: error.response.data.message,
    });
  }
};
