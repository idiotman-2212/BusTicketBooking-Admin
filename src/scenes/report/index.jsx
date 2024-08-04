import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, parse } from "date-fns";
import React, { useState } from "react";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import * as reportApi from "./reportQueries";
import { useQuery } from "@tanstack/react-query";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";

const Report = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [timeOption, setTimeOption] = useState("WEEK");
  const [reportOption, setReportOption] = useState("revenue");

  const revenueQuery = useQuery({
    queryKey: ["reports", "revenue", startDate, endDate, timeOption],
    queryFn: () =>
      reportApi.getTotalRevenue(
        format(startDate, "yyyy-MM-dd"),
        format(endDate, "yyyy-MM-dd"),
        timeOption
      ),
    keepPreviousData: true,
    enabled: timeOption !== "WEEK",
  });

  const weekRevenueQuery = useQuery({
    queryKey: ["reports", "weeks", startDate],
    queryFn: () =>
      reportApi.getTotalWeekRevenue(format(startDate, "yyyy-MM-dd")),
    keepPreviousData: true,
    enabled: timeOption === "WEEK",
  });

  const coachUsageQuery = useQuery({
    queryKey: ["reports", "coachUsage", startDate, endDate, timeOption],
    queryFn: () =>
      reportApi.getCoachUsage(
        format(new Date(), "yyyy-MM-dd"),
        format(new Date(), "yyyy-MM-dd"),
        "MONTH"
      ),
    keepPreviousData: true,
    enabled: reportOption === "coachUsage",
  });

  const topRouteQuery = useQuery({
    queryKey: ["reports", "topRoute", startDate, endDate, timeOption],
    queryFn: () =>
      reportApi.getTopRoute(
        format(new Date(), "yyyy-MM-dd"),
        format(new Date(), "yyyy-MM-dd"),
        "MONTH"
      ),
    keepPreviousData: true,
    enabled: reportOption === "top5Route",
  });

  const getDatePickerViews = (timeOption) => {
    switch (timeOption) {
      case "WEEK":
        return ["year", "month", "day"];
      case "MONTH":
        return ["year", "month"];
      case "YEAR":
        return ["year"];
      default:
        return ["year", "month", "day"];
    }
  };

  return (
    <Box m="20px">
      <Header title="Report" subTitle="Admin Report" />

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap="20px"
      >
        {/* Report Option */}
        <FormControl size="small" color="warning">
          <InputLabel id="reportOption">Report Option</InputLabel>
          <Select
            labelId="reportOption"
            id="report-option-select"
            value={reportOption}
            label="Report Option"
            onChange={(e) => {
              setReportOption(e.target.value);
            }}
          >
            <MenuItem value={"revenue"}>Revenue</MenuItem>
            <MenuItem value={"coachUsage"}>Coach Usage</MenuItem>
            <MenuItem value={"top5Route"}>Top 5 Route</MenuItem>
          </Select>
        </FormControl>

        {/* Start Date */}
        <FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              format="dd/MM/yyyy"
              views={getDatePickerViews(timeOption)}
              label="From"
              value={startDate}
              maxDate={endDate}
              onChange={(newDateTime) => {
                setStartDate(newDateTime);
              }}
              slotProps={{
                textField: {
                  InputProps: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarMonthIcon />
                      </InputAdornment>
                    ),
                  },
                  size: "small",
                  color: "warning",
                  // error: !!touched.startDateTime && !!errors.startDateTime,
                },
                dialog: {
                  sx: {
                    "& .MuiButtonBase-root": {
                      color: colors.grey[100],
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </FormControl>

        {/* End Date */}
        <FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={getDatePickerViews(timeOption)}
              disabled={timeOption === "WEEK"}
              format="dd/MM/yyyy"
              label="To"
              minDate={startDate}
              maxDate={new Date()}
              value={endDate}
              onChange={(newDateTime) => {
                setEndDate(newDateTime);
              }}
              slotProps={{
                textField: {
                  InputProps: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarMonthIcon />
                      </InputAdornment>
                    ),
                  },
                  size: "small",
                  color: "warning",
                  // error: !!touched.startDateTime && !!errors.startDateTime,
                },
                dialog: {
                  sx: {
                    "& .MuiButtonBase-root": {
                      color: colors.grey[100],
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </FormControl>

        {/* Time Option */}
        <FormControl size="small" color="warning">
          <InputLabel id="timeOption">Time Option</InputLabel>
          <Select
            labelId="timeOption"
            id="time-option-select"
            value={timeOption}
            label="Time Option"
            onChange={(e) => {
              setTimeOption(e.target.value);
            }}
          >
            {/* <MenuItem value={"DAY"}>Day</MenuItem> */}
            <MenuItem value={"WEEK"}>Week</MenuItem>
            <MenuItem value={"MONTH"}>Month</MenuItem>
            <MenuItem value={"YEAR"}>Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Chart */}
      <Box
        mt="20px"
        height="400px"
        borderRadius="5px"
        sx={{
          backgroundColor: colors.primary[400],
        }}
      >
        <Box mt="30px" display="flex" justifyContent="center" height="100%">
          {reportOption === "revenue" && (
            <>
              {timeOption !== "WEEK" && revenueQuery.isSuccess ? (
                <BarChart
                  title="Revenue"
                  entries={revenueQuery?.data.reportData}
                />
              ) : weekRevenueQuery.isSuccess ? (
                <BarChart
                  title="Revenue"
                  entries={weekRevenueQuery?.data.reportData}
                />
              ) : undefined}
            </>
          )}
          {reportOption === "coachUsage" && (
            <>
              {coachUsageQuery.isSuccess && (
                <PieChart
                  title="Coach Usage"
                  entries={coachUsageQuery?.data.reportData}
                />
              )}
            </>
          )}
          {reportOption === "top5Route" && (
            <>
              {topRouteQuery.isSuccess && (
                <BarChart
                  title="Top 5 Route"
                  entries={topRouteQuery?.data.reportData}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Report;
