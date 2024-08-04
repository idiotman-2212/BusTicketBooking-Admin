import { Box, Typography, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";
import BarChart from "../../components/BarChart";
import Header from "../../components/Header";
import PieChart from "../../components/PieChart";
import { tokens } from "../../theme";
import * as reportApi from "../report/reportQueries";
import StatBox from "../../components/StatBox";
import AccessibleIcon from "@mui/icons-material/Accessible";
import BusOutlinedIcon from "@mui/icons-material/AirportShuttleOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import * as driverApi from "../driver/driverQueries";
import * as userApi from "../user/userQueries";
import * as coachApi from "../bus/coachQueries";
import { ROLES, SCREENS } from "../../utils/appContants";

const DashBoard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const weekRevenueQuery = useQuery({
    queryKey: ["reports", "weeks"],
    queryFn: () =>
      reportApi.getTotalWeekRevenue(format(new Date(), "yyyy-MM-dd")),
  });

  const coachUsageQuery = useQuery({
    queryKey: ["reports", "coachUsage"],
    queryFn: () =>
      reportApi.getCoachUsage(
        format(new Date(), "yyyy-MM-dd"),
        format(new Date(), "yyyy-MM-dd"),
        "MONTH"
      ),
  });

  const totalDriverQuery = useQuery({
    queryKey: ["drivers", "all"],
    queryFn: () => driverApi.getAll(),
  });

  const totalCoachQuery = useQuery({
    queryKey: ["coaches", "all"],
    queryFn: () => coachApi.getAll(),
  });

  const totalUserQuery = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => userApi.getAll(),
  });

  const hasMainRoleInPermissionList = (mainRole, permissions) => {
    return permissions.some(
      (permission) => permission.role.roleCode === mainRole
    );
  };

  const getAllAvailableDriver = (originalDriverList) => {
    const allAvailableDriver = originalDriverList.filter(
      (driver) => !driver.quit
    );
    return allAvailableDriver.length;
  };

  const getAllAvailableStaff = (originalUserList) => {
    const totalStaff = originalUserList.filter((staff) =>
      hasMainRoleInPermissionList(ROLES.ROLE_STAFF, staff.permissions)
    );
    return totalStaff.length;
  };

  const getAllAvailableCustomer = (originalUserList) => {
    const totalCust = originalUserList.filter((cust) =>
      hasMainRoleInPermissionList(ROLES.ROLE_CUSTOMER, cust.permissions)
    );
    return totalCust.length;
  };

  return (
    <Box m="20px">
      <Header title="DASHBOARD" subTitle="Welcome to your dashboard" />
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="150px"
        gap="20px"
      >
        <Box
          borderRadius="5px"
          gridColumn="span 3"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: colors.primary[400],
          }}
        >
          {totalDriverQuery?.data ? (
            <StatBox
              icon={
                <AccessibleIcon
                  sx={{
                    width: "60px",
                    height: "60px",
                  }}
                />
              }
              content={"Total Driver"}
              value={getAllAvailableDriver(totalDriverQuery.data)}
            />
          ) : undefined}
        </Box>
        <Box
          borderRadius="5px"
          gridColumn="span 3"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: colors.primary[400],
          }}
        >
          {totalCoachQuery?.data ? (
            <StatBox
              icon={
                <BusOutlinedIcon
                  sx={{
                    width: "60px",
                    height: "60px",
                  }}
                />
              }
              content={"Total Coach"}
              value={totalCoachQuery.data.length}
            />
          ) : undefined}
        </Box>
        <Box
          borderRadius="5px"
          gridColumn="span 3"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: colors.primary[400],
          }}
        >
          {totalUserQuery?.data ? (
            <StatBox
              icon={
                <PeopleAltOutlinedIcon
                  sx={{
                    width: "60px",
                    height: "60px",
                  }}
                />
              }
              content={"Total Staff"}
              value={getAllAvailableStaff(totalUserQuery.data)}
            />
          ) : undefined}
        </Box>
        <Box
          borderRadius="5px"
          gridColumn="span 3"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: colors.primary[400],
          }}
        >
          {totalUserQuery?.data ? (
            <StatBox
              icon={
                <PeopleAltOutlinedIcon
                  sx={{
                    width: "60px",
                    height: "60px",
                  }}
                />
              }
              content={"Total Customer"}
              value={getAllAvailableCustomer(totalUserQuery.data)}
            />
          ) : undefined}
        </Box>

        <Box
          borderRadius="5px"
          gridColumn="span 8"
          gridRow="span 2"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: colors.primary[400],
          }}
        >
          {weekRevenueQuery?.data ? (
            <BarChart
              title="Week Revenue"
              entries={weekRevenueQuery.data.reportData}
            />
          ) : undefined}
        </Box>
        <Box
          borderRadius="5px"
          gridColumn="span 4"
          gridRow="span 2"
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: colors.primary[400],
          }}
        >
          {coachUsageQuery.isSuccess && (
            <PieChart
              title="Coach usage"
              entries={coachUsageQuery?.data.reportData}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashBoard;
