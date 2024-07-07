import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "../state/index";
import { userReducer } from "./reducers/user";
import { contractorReducer } from "./reducers/contractor";
import { delivererReducer } from "./reducers/deliverer";
import { visitReducer } from "./reducers/visit";
import { overallStatsReducer } from "./reducers/overallStats";

import { contractorStatsReducer } from "./reducers/contractorStats";

const Store = configureStore({
  reducer: {
    global: globalReducer,
    user: userReducer,
    contractors: contractorReducer,
    deliverers: delivererReducer,
    visits:visitReducer,
    overallStats: overallStatsReducer,
    contractorStats: contractorStatsReducer,
  },
});

export default Store;
