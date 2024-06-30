import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  FormControl,
  InputAdornment,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { Formik } from "formik";
import React, { useState } from "react";
import { useMatch, useParams } from "react-router-dom";
import * as yup from "yup";
import Header from "../../../components/Header";
import { tokens } from "../../../theme";
import { debounce } from "../../../utils/debounce";
import { handleToast } from "../../../utils/helpers";
import * as discountApi from "../../discount/discountQueries";

const initialValues = {
  id: 0,
  code: "",
  amount: 0,
  startDateTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
  endDateTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
  description: "",
  isEditMode: false, // remove this field when submit
};

const formatRemainingTime = (remainingTime) => {
  if (remainingTime <= 0) return "EXPIRED";

  const days = Math.floor(remainingTime / (24 * 3600));
  const hours = Math.floor((remainingTime % (24 * 3600)) / 3600);
  const minutes = Math.floor((remainingTime % 3600) / 60);
  const seconds = remainingTime % 60;

  let formattedTime = "";
  if (days > 0) {
    formattedTime += `${days}d `;
  }
  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `;
  }
  formattedTime += `${seconds}s`;

  return formattedTime;
};

const checkDuplicateCodeDebounced = debounce(
  discountApi.checkDuplicateDiscountInfo,
  500
);

const discountScheme = yup.object().shape({
  id: yup.number().notRequired(),
  code: yup
    .string()
    .required("Required")
    .test("code", "Code is already used", async (value, ctx) => {
      const isAvailable = await checkDuplicateCodeDebounced(
        ctx.parent.isEditMode ? "EDIT" : "ADD",
        ctx.parent.id,
        "code",
        value
      );
      return isAvailable;
    }),
  amount: yup.number().positive("Amount must be positive"),
  startDateTime: yup.date().required("Required"),
  endDateTime: yup.date().required("Required"),
  description: yup.string().notRequired(),
  isEditMode: yup.boolean().default(true),
});

const DiscountForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const addNewMatch = useMatch("/discounts/new");
  const isAddMode = !!addNewMatch;
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { discountId } = useParams();
  const queryClient = useQueryClient();
  const [remainingTime, setRemainingTime] = useState("");

  // Load coach data when mode is EDIT
  const { data } = useQuery({
    queryKey: ["discounts", discountId],
    queryFn: () => discountApi.getDiscount(discountId),
    enabled: discountId !== undefined && !isAddMode, // only query when coachId is available
  });

  const mutation = useMutation({
    mutationFn: (newDiscount) => discountApi.createNewDiscount(newDiscount),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedDiscount) =>
      discountApi.updateDiscount(updatedDiscount),
  });

  // HANDLE FORM SUBMIT
  const handleFormSubmit = (values, { resetForm }) => {
    let { isEditMode, ...newValues } = values;
    if (isAddMode) {
      mutation.mutate(newValues, {
        onSuccess: () => {
          resetForm();
          handleToast("success", "Add new discount successfully");
        },
        onError: (error) => {
          console.log(error);
          handleToast("error", error.response?.data?.message);
        },
      });
    } else {
      updateMutation.mutate(newValues, {
        onSuccess: (data) => {
          queryClient.setQueryData(["discounts", discountId], data);
          handleToast("success", "Update discount successfully");
        },
        onError: (error) => {
          console.log(error);
          handleToast("error", error.response?.data?.message);
        },
      });
    }
  };

  return (
    <Box m="20px">
      <Header
        title={isAddMode ? "CREATE DISCOUNT" : "EDIT DISCOUNT"}
        subTitle={
          isAddMode ? "Create discount profile" : "Edit discount profile"
        }
      />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={data ? { ...data, isEditMode: true } : initialValues}
        validationSchema={discountScheme}
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
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Code"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.code}
                name="code"
                error={!!touched.code && !!errors.code}
                helperText={touched.code && errors.code}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="number"
                label="Amount"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.amount}
                name="amount"
                error={!!touched.amount && !!errors.amount}
                helperText={touched.amount && errors.amount}
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
                    format="HH:mm dd/MM/yyyy"
                    label="Start datetime"
                    minDateTime={new Date()}
                    value={parse(
                      values.startDateTime,
                      "yyyy-MM-dd HH:mm:ss",
                      new Date()
                    )}
                    onChange={(newDateTime) => {
                      setFieldValue(
                        "startDateTime",
                        format(newDateTime, "yyyy-MM-dd HH:mm:ss")
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
                          !!touched.startDateTime && !!errors.startDateTime,
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
              <FormControl
                sx={{
                  gridColumn: "span 2",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    format="HH:mm dd/MM/yyyy"
                    label="End datetime"
                    minDateTime={parse(
                      values.startDateTime,
                      "yyyy-MM-dd HH:mm:ss",
                      new Date()
                    )}
                    value={parse(
                      values.endDateTime,
                      "yyyy-MM-dd HH:mm:ss",
                      new Date()
                    )}
                    onChange={(newDateTime) => {
                      const currentDateTime = new Date();
                      const timeDiff = Math.floor(
                        (newDateTime - currentDateTime) / 1000
                      );
                      setRemainingTime(formatRemainingTime(timeDiff));
                      setFieldValue(
                        "endDateTime",
                        format(newDateTime, "yyyy-MM-dd HH:mm:ss")
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
                        error: !!touched.endDateTime && !!errors.endDateTime,
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
                type="text"
                label="Remaining Time"
                onBlur={handleBlur}
                name="remainingTime"
                value={
                  remainingTime !== ""
                    ? remainingTime
                    : formatRemainingTime(
                        Math.floor(
                          (parse(
                            values.endDateTime,
                            "yyyy-MM-dd HH:mm:ss",
                            new Date()
                          ) -
                            new Date()) /
                            1000
                        )
                      )
                }
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  gridColumn: "span 4",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Description"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.description}
                name="description"
                error={!!touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                sx={{
                  gridColumn: "span 4",
                }}
              />
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
                {isAddMode ? "CREATE" : "SAVE"}
              </LoadingButton>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default DiscountForm;
