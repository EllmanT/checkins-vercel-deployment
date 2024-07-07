import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { themeSettings } from "theme";

//getting the deliverer routes
import {
  DelLoginPage,
  DelDashboardPage,
  GuardDashboardPage,
  DelVisitsPage,
  DelAdminsPage,
  DelContractorsPage,
  DelDeliverersPage,
  ActivationPage,
  DelDailyVisitsPage,
} from "./route/delRoutes";

import ToasterProvider from "providers/ToastProvider";
import Store from "redux/store";
import { loadUser } from "redux/actions/user";

//getting the layouts
import DelLayout from "component/deliverer/DelLayout";
import DelProtectedRoutes from "route/delProtectedRoutes";
import {
  getAllContractorsDeliverer,
  getAllCurrentClientsDeliverer,
} from "redux/actions/contractor";

//the analytics pages
import socketIO from "socket.io-client";
import { endpoint } from "socketIOEndpoint";

const App = () => {
  //dealing with emitting real time changes START
  const socketId = socketIO(endpoint, { transports: ["websocket"] });



  //const dispatch= useDispatch();
  //making the necessary calls the db so that we get only the necessary info when we start the application.
  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(getAllContractorsDeliverer());
    Store.dispatch(getAllCurrentClientsDeliverer());
  }, []);

  const mode = useSelector((state) => state.global.mode);
  const { user, isAuthenticated, loading } = useSelector((state) => state.user);
  //const navigate = useNavigate();
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <Routes>
            <Route element={<DelLayout />}>
              <Route
                path="/"
                element={
                  !loading ? (
                    user && user.role === "Guard Admin" ? (
                      <Navigate to="/del-guard-dashboard" replace />
                    ) : user ? (
                      <Navigate to="/del-dashboard" replace />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              <Route
                path="/del-admins"
                element={
                  user && user.role === "Super Admin" ? (
                    <DelProtectedRoutes>
                      <DelAdminsPage />
                    </DelProtectedRoutes>
                  ) : (
                    <Navigate to="/del-dashboard" replace />
                  )
                }
              />
              <Route
                path="/del-contractors"     
                element={
                  <DelProtectedRoutes>
                    <DelContractorsPage />
                  </DelProtectedRoutes>
                }
              />
              <Route
                path="/del-deliverers"
                  element={
                    user && user.role === "Super Admin" ? (
                  <DelProtectedRoutes>
                    <DelDeliverersPage />
                  </DelProtectedRoutes>
                     ) : (
                      <Navigate to="/del-dashboard" replace />
                    )
                }
              />

              <Route
                path="/del-visits"
                element={
                  <DelProtectedRoutes>
                    <DelVisitsPage />
                  </DelProtectedRoutes>
                }
              />

              <Route
                path="/del-dashboard"
                element={
                  <DelProtectedRoutes>
                    <DelDashboardPage />
                  </DelProtectedRoutes>
                }
              />
              <Route
                path="/del-guard-dashboard"
                element={
                  <DelProtectedRoutes>
                    <GuardDashboardPage />
                  </DelProtectedRoutes>
                }
              />
              <Route
                path="/del-daily-visits"
                element={
                  <DelProtectedRoutes>
                    <DelDailyVisitsPage />
                  </DelProtectedRoutes>
                }
              />

              {/**Analytics routes */}
            </Route>

            <Route path="/login" element={<DelLoginPage />} />
            <Route
              path="/activation/:activation_token"
              element={<ActivationPage />}
            />
          </Routes>
        </ThemeProvider>
        <ToasterProvider />
      </BrowserRouter>
    </div>
  );
};

export default App;
