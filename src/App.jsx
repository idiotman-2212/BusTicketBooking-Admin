import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./scenes/Login";
import NotAllowedAccess from "./scenes/NotAllowedAccess";
import UserSettings from "./scenes/UserSettings";
import Bus from "./scenes/bus";
import DashBoard from "./scenes/dashboard";
import Discount from "./scenes/discount";
import Driver from "./scenes/driver";
import BookingForm from "./scenes/form/booking";
import StepperBooking from "./scenes/form/booking/StepperBooking";
import CoachForm from "./scenes/form/coach";
import DiscountForm from "./scenes/form/discount";
import DriverForm from "./scenes/form/driver";
import TripForm from "./scenes/form/trip";
import UserForm from "./scenes/form/user";
import Sidebar from "./scenes/global/Sidebar";
import Topbar from "./scenes/global/Topbar";
import Report from "./scenes/report";
import Ticket from "./scenes/ticket";
import Trip from "./scenes/trip";
import User from "./scenes/user";
import { ColorModeContext, useMode } from "./theme";
import { ROLES, SCREEN_PATH } from "./utils/appContants";
import useLogin from "./utils/useLogin";
import ChangePassword from "./scenes/ChangePassword";
import ForgotPwd from "./scenes/ForgotPwd";
import "./utils/i18n"; // Import cấu hình i18n
import { useEffect } from "react";
import Notification from "./scenes/notification";
import NotificationForm from "./scenes/form/notification";
import Notifications from "./scenes/notification";
import Review from "./scenes/review";
import ReviewForm from "./scenes/form/review";
import Cargo from "./scenes/cargo";
import CargoForm from "./scenes/form/cargo";

//kiểm tra quyền người dùng
const hasReadAccessRoleToScreen = (permissions, pathname) => {
  const roleKeys = Object.keys(permissions);
  // admin is allowed to access all resources
  if (roleKeys.includes(ROLES.ROLE_ADMIN)) return true;

  if (!roleKeys.includes(ROLES.ROLE_READ)) return false;

  // /objects, e.g: /trips, /users, ...
  const commonPathName = "/".concat(pathname.split("/")[1]);

  const allowedScreens = permissions[ROLES.ROLE_READ];
  const currentScreen = SCREEN_PATH[commonPathName];
  return allowedScreens.includes(currentScreen);
};

const ProtectedRoutes = () => {
  const isLoggedIn = useLogin();
  const location = useLocation();
  let hasAccessPermission;
  if (localStorage.getItem("permissions") !== null) {
    const permissions = JSON.parse(
      localStorage.getItem("permissions")?.toString()
    );
    hasAccessPermission = hasReadAccessRoleToScreen(
      permissions,
      location.pathname
    );
  } else hasAccessPermission = false;

  return !isLoggedIn ? (
    <Navigate to="/login" state={{ from: location }} />
  ) : isLoggedIn && location.pathname === "/settings" ? (
    <Outlet />
  ) : isLoggedIn && !hasAccessPermission ? (
    <Navigate to="/not-allowed" />
  ) : (
    <Outlet />
  );
};

const App = () => {
  const [theme, colorMode] = useMode();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  //Tích hợp chat
  // useEffect(() => {
  //   (function(d, m) {
  //     var kommunicateSettings = {
  //       "appId": "291034e15da45c3b1f0f79c535bfe8dda", // Thay YOUR_APP_ID bằng App ID của bạn
  //       "popupWidget": true,
  //       "automaticChatOpenOnNavigation": true
  //     };
  //     var s = document.createElement("script");
  //     s.type = "text/javascript";
  //     s.async = true;
  //     s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
  //     var h = document.getElementsByTagName("head")[0];
  //     h.appendChild(s);
  //     window.kommunicate = m;
  //     m._globals = kommunicateSettings;
  //   })(document, window.kommunicate || {});
  // }, []);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer position="bottom-right" />
        <QueryClientProvider client={queryClient}>
          <div className="app">
            <Sidebar />
            <main className="content">
              <Topbar />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot" element={<ForgotPwd />} />
                <Route path="/not-allowed" element={<NotAllowedAccess />} />
                <Route element={<ProtectedRoutes />}>
                  <Route path="/dashboard" element={<DashBoard />} />
                  <Route path="/settings" element={<UserSettings />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/drivers">
                    <Route index element={<Driver />} />
                    <Route path=":driverId" element={<DriverForm />} />
                    <Route path="new" element={<DriverForm />} />
                  </Route>
                  <Route path="/trips">
                    <Route index element={<Trip />} />
                    <Route path=":tripId" element={<TripForm />} />
                    <Route path="new" element={<TripForm />} />
                  </Route>
                  <Route path="/tickets">
                    <Route index element={<Ticket />} />
                    <Route path=":bookingId" element={<BookingForm />} />
                    <Route path="new" element={<StepperBooking />} />
                  </Route>
                  <Route path="/coaches">
                    <Route index element={<Bus />} />
                    <Route path=":coachId" element={<CoachForm />} />
                    <Route path="new" element={<CoachForm />} />
                  </Route>
                  <Route path="/discounts">
                    <Route index element={<Discount />} />
                    <Route path=":discountId" element={<DiscountForm />} />
                    <Route path="new" element={<DiscountForm />} />
                  </Route>
                  <Route path="/reports" element={<Report />} />
                  <Route path="/users">
                    <Route index element={<User />} />
                    <Route path=":username" element={<UserForm />} />
                    <Route path="new" element={<UserForm />} />
                  </Route>
                  <Route path="/notifications">
                    <Route index element={<Notifications />} />
                    <Route path="new" element={<NotificationForm />} /> 
                    <Route path="edit/:notificationId" element={<NotificationForm />} /> 
                  </Route>
                  <Route path="/reviews">
                    <Route index element={<Review />} /> 
                    <Route path=":reviewId" element={<ReviewForm />} />
                  </Route>
                  <Route path="/cargos">
                    <Route index element={<Cargo />} />
                    <Route path="new" element={<CargoForm />} /> 
                    <Route path=":cargoId" element={<CargoForm />} /> 
                  </Route>
                </Route>
              </Routes>
            </main>
          </div>
          <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
        </QueryClientProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
