import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  MenuItem,
  Select,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { Formik } from "formik";
import Header from "../../../components/Header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import * as tripLogApi from "../../TripLog/tripLogQueries";
import * as tripApi from "../../trip/tripQueries.js";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { format, parse } from "date-fns";
import InputAdornment from "@mui/material/InputAdornment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const TripLogForm = () => {
  const { t } = useTranslation();
  const { tripLogId } = useParams();

  // Fetch danh sách chuyến đi (trip)
  const { data: trips, isLoading: isLoadingTrips } = useQuery(
    ["trips"],
    tripApi.getAll
  );

  const [initialValues, setInitialValues] = useState({
    logType: "OTHER",
    description: "",
    logTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"), // Định dạng bao gồm giây
    tripId: "", // Liên kết với chuyến đi
    location: "",
  });

  // Fetch trip log data if tripLogId is passed (for updating)
  const { data: tripLogData, isLoading: isLoadingLog } = useQuery(
    ["tripLog", tripLogId],
    () => tripLogApi.getTripLogById(tripLogId),
    {
      enabled: !!tripLogId,
      onSuccess: (data) => {
        setInitialValues({
          logType: data.logType || "OTHER",
          description: data.description || "",
          logTime: data.logTime
            ? format(new Date(data.logTime), "yyyy-MM-dd HH:mm:ss") // Bao gồm giây
            : format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          tripId: data.trip.id || "",
          location: data.location || "",
        });
      },
    }
  );

  // Custom validation logic
  const validate = (values) => {
    const errors = {};
    if (!values.tripId) {
      errors.tripId = "Trip is required";
    }
    if (!values.logType) {
      errors.logType = "Log type is required";
    }
    if (!values.description) {
      errors.description = "Description is required";
    }
    if (!values.logTime) {
      errors.logTime = "Log time is required";
    }
    return errors;
  };

  // Handle form submission
  const mutation = useMutation({
    mutationFn: (values) => {
      if (tripLogId) {
        return tripLogApi.updateTripLog({ ...values, id: tripLogId });
      } else {
        return tripLogApi.createNewTripLog(values);
      }
    },
    onSuccess: () => {
      toast.success(
        tripLogId
          ? "Trip log updated successfully!"
          : "Trip log created successfully!"
      );
    },
    onError: (error) => {
      toast.error(error.response?.data.message || "Something went wrong!");
    },
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      ...values,
      trip: { id: values.tripId },
      tripId: undefined  // Loại bỏ trường tripId riêng biệt
    };
    console.log("Payload being sent:", payload);
    mutation.mutate(payload, {
      onSuccess: () => {
        setSubmitting(false);
      },
      onError: (error) => {
        console.error("Error creating/updating trip log:", error);
        setSubmitting(false);
      },
    });
  };
  

  return (
    <Box m="20px">
      <Header
        title={tripLogId ? t("EDIT TRIP LOG") : t("CREATE TRIP LOG")}
        subTitle={
          tripLogId ? t("Edit trip log") : t("Create a new trip log")
        }
      />

      <Formik
        initialValues={initialValues}
        validate={validate}
        enableReinitialize={true}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box display="grid" gap="30px" gridTemplateColumns="repeat(4, 1fr)">
              {/* Select Trip (TripId) */}
              <FormControl sx={{ gridColumn: "span 2" }}>
                <InputLabel>{t("Trip")}</InputLabel>
                <Select
                  name="tripId"
                  value={values.tripId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.tripId && Boolean(errors.tripId)}
                  disabled={isLoadingTrips}
                >
                  {trips?.map((trip) => (
                    <MenuItem key={trip.id} value={trip.id}>
                      [{trip.id}] {trip.source.name} {"=>"}{" "}
                      {trip.destination.name} ({trip.departureDateTime})
                    </MenuItem>
                  ))}
                </Select>
                {!!errors.tripId && (
                  <FormHelperText error>{errors.tripId}</FormHelperText>
                )}
              </FormControl>

              {/* Select log type */}
              <FormControl sx={{ gridColumn: "span 2" }}>
                <InputLabel>{t("Log Type")}</InputLabel>
                <Select
                  name="logType"
                  value={values.logType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.logType && Boolean(errors.logType)}
                >
                  <MenuItem value="INCIDENT">{t("Incident")}</MenuItem>
                  <MenuItem value="BREAKDOWN">{t("Breakdown")}</MenuItem>
                  <MenuItem value="MAINTENANCE">{t("Maintenance")}</MenuItem>
                  <MenuItem value="COMPLETED">{t("Completed")}</MenuItem>
                  <MenuItem value="OTHER">{t("Other")}</MenuItem>
                </Select>
                {!!errors.logType && (
                  <FormHelperText error>{errors.logType}</FormHelperText>
                )}
              </FormControl>

              {/* Log time with DateTimePicker */}
              <FormControl sx={{ gridColumn: "span 2" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label={t("Log Time")}
                    value={parse(
                      values.logTime,
                      "yyyy-MM-dd HH:mm:ss",
                      new Date()
                    )}
                    onChange={(newTime) => {
                      setFieldValue(
                        "logTime",
                        format(newTime, "yyyy-MM-dd HH:mm:ss") // Định dạng lại đúng theo yêu cầu
                      );
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
                        error: !!touched.logTime && !!errors.logTime,
                        helperText: touched.logTime && errors.logTime,
                      },
                    }}
                  />
                </LocalizationProvider>
              </FormControl>

              {/* Location */}
              <FormControl sx={{ gridColumn: "span 2" }}>
                <InputLabel>{t("Location")}</InputLabel>
                <OutlinedInput
                  name="location"
                  value={values.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </FormControl>

              {/* Description */}
              <FormControl sx={{ gridColumn: "span 4" }}>
                <InputLabel>{t("Description")}</InputLabel>
                <OutlinedInput
                  name="description"
                  multiline
                  rows={4}
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.description && Boolean(errors.description)}
                />
                {!!errors.description && (
                  <FormHelperText error>{errors.description}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <Box mt="20px" display="flex" justifyContent="center">
              <LoadingButton
                color="secondary"
                type="submit"
                variant="contained"
                loadingPosition="start"
                loading={isSubmitting}
                startIcon={<SaveAsOutlinedIcon />}
              >
                {tripLogId ? t("SAVE") : t("CREATE")}
              </LoadingButton>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default TripLogForm;
