import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FemaleOutlinedIcon from "@mui/icons-material/FemaleOutlined";
import MaleOutlinedIcon from "@mui/icons-material/MaleOutlined";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  FormControl,
  InputAdornment,
  TextField,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { Formik } from "formik";
import React, { useState } from "react";
import { useMatch, useParams } from "react-router-dom";
import * as yup from "yup";
import Header from "../../../components/Header";
import { tokens } from "../../../theme";
import { handleToast } from "../../../utils/helpers";
import * as coachApi from "../../bus/coachQueries";
import * as discountApi from "../../discount/discountQueries";
import * as driverApi from "../../driver/driverQueries";
import * as provinceApi from "../../global/provinceQueries";
import * as tripApi from "../../trip/tripQueries";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const initialValues = {
  id: -1,
  driver: null,
  coach: null,
  source: null,
  destination: null,
  discount: null,
  price: 0,
  departureDateTime: format(new Date(), "yyyy-MM-dd HH:mm"),
  duration: 0,
  isEditMode: false, // remove this field when submit
  completed: false, // Trạng thái hoàn thành chuyến đi
};

const tripSchema = yup.object().shape({
  id: yup.number().notRequired(),
  driver: yup.object().required("Required"),
  coach: yup.object().required("Required"),
  source: yup
    .object()
    .required("Required")
    .test("source", "Source is the same as Destination", (value, ctx) => {
      return value.id !== ctx.parent.destination.id;
    }),
  destination: yup
    .object()
    .required("Required")
    .test("destination", "Destination is the same as Source", (value, ctx) => {
      return value.id !== ctx.parent.source.id;
    }),
  discount: yup.object().notRequired(),
  price: yup.number().positive("Price must be positive").default(1),
  departureDateTime: yup.string().required("Required"),
  duration: yup.number().notRequired(),
  isEditMode: yup.boolean().default(true),
  completed: yup.boolean().default(false), // Xác định trạng thái hoàn thành
});

const TripForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const addNewMatch = useMatch("/trips/new");
  const isAddMode = !!addNewMatch;
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { tripId } = useParams();
  const queryClient = useQueryClient();
  const [driverClicked, setDriverClicked] = useState(false);
  const [coachClicked, setCoachClicked] = useState(false);
  const [provinceClicked, setProvinceClicked] = useState(false);
  const [discountClicked, setDiscountClicked] = useState(false);
  const { t } = useTranslation();

  // prepare data (driver, coach, source, destination, ...) for autocomplete combobox
  const driverQuery = useQuery({
    queryKey: ["drivers", "all"],
    queryFn: () => driverApi.getAll(),
    enabled: driverClicked,
  });
  const coachQuery = useQuery({
    queryKey: ["coaches", "all"],
    queryFn: () => coachApi.getAll(),
    enabled: coachClicked,
  });
  const provinceQuery = useQuery({
    queryKey: ["provinces", "all"],
    queryFn: () => provinceApi.getAll(),
    enabled: provinceClicked,
  });
  const disCountQuery = useQuery({
    queryKey: ["discounts", "all", "available"],
    queryFn: () => discountApi.getAllAvailable(),
    enabled: discountClicked,
  });

  const handleDriverOpen = () => {
    if (!driverQuery.data) {
      setDriverClicked(true);
    }
  };
  const handleCoachOpen = () => {
    if (!coachQuery.data) {
      setCoachClicked(true);
    }
  };
  const handleProvinceOpen = () => {
    if (!provinceQuery.data) {
      setProvinceClicked(true);
    }
  };
  const handleDiscountOpen = () => {
    if (!disCountQuery.data) {
      setDiscountClicked(true);
    }
  };

  const getAllAvailableDriver = (originalDriverList) => {
    const availableDrivers = originalDriverList.filter(
      (driver) => !driver.quit
    );
    return availableDrivers;
  };

  // Load trip data when mode is EDIT
  const { data } = useQuery({
    queryKey: ["trips", tripId],
    queryFn: () => tripApi.getTrip(tripId),
    enabled: tripId !== undefined && !isAddMode, // only query when tripId is available
  });

  const mutation = useMutation({
    mutationFn: (newTrip) => tripApi.createNewTrip(newTrip),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedTrip) => tripApi.updateTrip(updatedTrip),
  });

  // HANDLE FORM SUBMIT
  const handleFormSubmit = async (values, { resetForm }) => {
    console.log("Submitting with values:", values); // Kiểm tra toàn bộ dữ liệu gửi đi, đặc biệt là trường completed

    let { isEditMode, ...newValues } = values;

    try {
      // Kiểm tra chuyến đi gần đây của tài xế
      if (isAddMode) {
        const response = await tripApi.checkRecentTrips(
          newValues.driver.id,
          newValues.departureDateTime
        );

        if (response.length > 0) {
          handleToast(
            "error",
            t("Driver must wait for 2 days before creating a new trip.")
          );
          return;
        }
      }

      // Thực hiện thao tác tạo hoặc chỉnh sửa
      const action = isAddMode ? mutation.mutateAsync : updateMutation.mutateAsync;
      await action(newValues, {
        onSuccess: () => {
          resetForm();
          handleToast(
            "success",
            isAddMode ? t("Add new trip successfully") : t("Update trip successfully")
          );
        },
        onError: (error) => {
          console.error(error);
          handleToast(
            "error",
            error.response?.data?.message || "An error occurred"
          );
        },
      });

      queryClient.invalidateQueries(["trips"]); // Refresh cache
    } catch (error) {
      console.error("Error:", error);
      handleToast("error", "An error occurred while processing the trip.");
    }
  };

  return (
    <Box m="20px">
      <Header
        title={isAddMode ? t("CREATE TRIP") : t("EDIT TRIP")}
        subTitle={isAddMode ? t("Create trip profile") : t("Edit trip profile")}
      />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={
          data
            ? {
                ...data,
                isEditMode: true,
                completed: data.completed ?? false, // Đảm bảo completed không bị null
              }
            : initialValues
        }
        validationSchema={tripSchema}
        enableReinitialize={true}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": {
                  gridColumn: isNonMobile ? undefined : "span 4",
                },
              }}
            >
              <Autocomplete
                id="driver-autocomplete"
                value={values.driver}
                onOpen={handleDriverOpen}
                onChange={(e, newValue) => {
                  setFieldValue("driver", newValue);
                }}
                getOptionLabel={(option) => {
                  const { firstName, lastName } = option;
                  return `${firstName} ${lastName}`;
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    {option.gender ? (
                      <FemaleOutlinedIcon sx={{ color: "#f90070" }} />
                    ) : (
                      <MaleOutlinedIcon sx={{ color: "#00d1ef" }} />
                    )}
                    <span style={{ marginLeft: "5px" }}>
                      {option.firstName} {option.lastName}, Phone:
                      {option.phone}
                    </span>
                  </Box>
                )}
                options={getAllAvailableDriver(driverQuery.data ?? [])}
                loading={driverClicked && driverQuery.isLoading}
                sx={{
                  gridColumn: "span 2",
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="driver"
                    label={t("Driver")}
                    color="warning"
                    size="small"
                    fullWidth
                    variant="outlined"
                    onBlur={handleBlur}
                    error={!!touched.driver && !!errors.driver}
                    helperText={touched.driver && errors.driver}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {driverClicked && driverQuery.isLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Autocomplete
                id="coach-autocomplete"
                value={values.coach}
                onOpen={handleCoachOpen}
                onChange={(e, newValue) => setFieldValue("coach", newValue)}
                getOptionLabel={(option) =>
                  `${option?.name} ${option?.coachType}`
                }
                options={coachQuery.data ?? []}
                loading={coachClicked && coachQuery.isLoading}
                sx={{
                  gridColumn: "span 2",
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="coach"
                    label={t("Coach")}
                    color="warning"
                    size="small"
                    fullWidth
                    variant="outlined"
                    onBlur={handleBlur}
                    error={!!touched.coach && !!errors.coach}
                    helperText={touched.coach && errors.coach}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {coachClicked && coachQuery.isLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Autocomplete
                id="source-province-autocomplete"
                value={values.source}
                onOpen={handleProvinceOpen}
                onChange={(e, newValue) => setFieldValue("source", newValue)}
                getOptionLabel={(option) => option.name}
                options={provinceQuery.data ?? []}
                loading={provinceClicked && provinceQuery.isLoading}
                sx={{
                  gridColumn: "span 2",
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="source"
                    label={t("From")}
                    color="warning"
                    size="small"
                    fullWidth
                    variant="outlined"
                    onBlur={handleBlur}
                    error={!!touched.source && !!errors.source}
                    helperText={touched.source && errors.source}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {provinceClicked && provinceQuery.isLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Autocomplete
                id="dest-province-autocomplete"
                value={values.destination}
                onOpen={handleProvinceOpen}
                onChange={(e, newValue) =>
                  setFieldValue("destination", newValue)
                }
                getOptionLabel={(option) => option.name}
                options={provinceQuery.data ?? []}
                loading={provinceClicked && provinceQuery.isLoading}
                sx={{
                  gridColumn: "span 2",
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="destination"
                    label={t("To")}
                    color="warning"
                    size="small"
                    fullWidth
                    variant="outlined"
                    onBlur={handleBlur}
                    error={!!touched.destination && !!errors.destination}
                    helperText={touched.destination && errors.destination}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {provinceClicked && provinceQuery.isLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Autocomplete
                id="discount-autocomplete"
                value={values.discount}
                onOpen={handleDiscountOpen}
                onChange={(e, newValue) => setFieldValue("discount", newValue)}
                getOptionLabel={(option) =>
                  `${option.code}, Amount: ${formatCurrency(option.amount)}`
                }
                options={disCountQuery.data ?? []}
                loading={discountClicked && disCountQuery.isLoading}
                sx={{
                  gridColumn: "span 2",
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="discount"
                    label={t("Available Discount")}
                    color="warning"
                    size="small"
                    fullWidth
                    variant="outlined"
                    onBlur={handleBlur}
                    error={!!touched.discount && !!errors.discount}
                    helperText={touched.discount && errors.discount}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {discountClicked && disCountQuery.isLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="number"
                label={t("Price")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.price}
                name="price"
                error={!!touched.price && !!errors.price}
                helperText={touched.price && errors.price}
                sx={{
                  gridColumn: "span 2",
                }}
              />

              <FormControl
                sx={{
                  gridColumn: "span 2",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    format="HH:mm dd-MM-yyyy"
                    label={t("Departure DateTime")}
                    value={parse(
                      values.departureDateTime,
                      "yyyy-MM-dd HH:mm",
                      new Date()
                    )}
                    onChange={(newTime) => {
                      setFieldValue(
                        "departureDateTime",
                        format(newTime, "yyyy-MM-dd HH:mm")
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
                        error:
                          !!touched.departureDateTime &&
                          !!errors.departureDateTime,
                        helperText:
                          touched.departureDateTime && errors.departureDateTime,
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

              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="number"
                label={t("Duration (hour)")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.duration}
                name="duration"
                error={!!touched.duration && !!errors.duration}
                helperText={touched.duration && errors.duration}
                sx={{
                  gridColumn: "span 2",
                }}
              />

              <FormControl>
                <FormLabel color="warning" id="status">
                  {t("Trip Status")}
                </FormLabel>
                <RadioGroup
                  row
                  aria-label="completed"
                  name="completed"
                  value={values.completed.toString()}
                  onChange={(e) => setFieldValue("completed", e.target.value === "true")}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio color="primary" />}
                    label={t("Complete")}
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label={t("Incomplete")}
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <Box mt="20px" display="flex" justifyContent="center">
              <LoadingButton
                color="secondary"
                type="submit"
                variant="contained"
                loadingPosition="start"
                loading={mutation.isLoading || updateMutation.isLoading}
                startIcon={<SaveAsOutlinedIcon />}
              >
                {isAddMode ? t("CREATE") : t("SAVE")}
              </LoadingButton>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default TripForm;
