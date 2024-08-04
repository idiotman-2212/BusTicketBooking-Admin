import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { DatePicker } from "@mui/x-date-pickers";
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
import { APP_CONSTANTS } from "../../../utils/appContants";
import { debounce } from "../../../utils/debounce";
import { handleToast } from "../../../utils/helpers";
import * as userApi from "../../user/userQueries";

const initialValues = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: format(new Date(), "yyyy-MM-dd"),
  gender: false,
  address: "",
  active: true,
  isEditMode: false, // remove this field when submit
};

const checkDuplicateUsernameDebounced = debounce(
  userApi.checkDuplicateUserInfo,
  500
);
const checkDuplicateEmailDebounced = debounce(
  userApi.checkDuplicateUserInfo,
  500
);
const checkDuplicatePhoneDebounced = debounce(
  userApi.checkDuplicateUserInfo,
  500
);

const userScheme = yup.object().shape({
  username: yup.string().when("isEditMode", {
    is: false,
    then: () =>
      yup
        .string()
        .required("Required")
        .test("username", "Username is already used", async (value) => {
          const isAvailable = await checkDuplicateUsernameDebounced(
            "ADD",
            value,
            "username",
            value
          );
          return isAvailable;
        }),
    otherwise: () => yup.string().notRequired(),
  }),
  password: yup.string().required("Required"),
  firstName: yup.string().required("Required"),
  lastName: yup.string().required("Required"),
  email: yup
    .string()
    .required("Required")
    .matches(APP_CONSTANTS.EMAIL_REGEX, "Invalid Email")
    .test("email", "Email is already used", async (value, ctx) => {
      const isAvailable = await checkDuplicateEmailDebounced(
        ctx.parent.isEditMode ? "EDIT" : "ADD",
        ctx.parent.username,
        "email",
        value
      );
      return isAvailable;
    }),
  phone: yup
    .string()
    .matches(APP_CONSTANTS.PHONE_REGEX, "Invalid phone number")
    .required("Required")
    .test("phone", "Phone is already used", async (value, ctx) => {
      const isAvailable = await checkDuplicatePhoneDebounced(
        ctx.parent.isEditMode ? "EDIT" : "ADD",
        ctx.parent.username,
        "phone",
        value
      );
      return isAvailable;
    }),
  dob: yup
    .date()
    .max(new Date(), "Your day of birth must be before current date")
    .required("Required")
    .test("dob", "Not old enough to work (age >= 18)", (value) => {
      // nhớ chỉ check tuổi đi làm đổi với nhân viên, khách thì kemeno
      const currentDate = new Date();
      const dob = new Date(value);
      const age = currentDate.getFullYear() - dob.getFullYear();
      return age >= 18;
    }),
  gender: yup.boolean().default(false),
  address: yup.string().default(""),
  active: yup.boolean().default(true),
  isEditMode: yup.boolean().default(true),
});

const UserForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const addNewMatch = useMatch("/users/new");
  const isAddMode = !!addNewMatch;
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showPwd, setShowPwd] = useState(false);
  const { username } = useParams();
  const queryClient = useQueryClient();

  // Load user data when mode is EDIT
  const { data } = useQuery({
    queryKey: ["users", username],
    queryFn: () => userApi.getUser(username),
    enabled: username !== undefined && !isAddMode, // only query when username is available
  });

  const mutation = useMutation({
    mutationFn: (newUser) => userApi.createNewUser(newUser),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedUser) => userApi.updateUser(updatedUser),
  });

  // HANDLE FORM SUBMIT
  const handleFormSubmit = (values, { resetForm }) => {
    let { isEditMode, ...newValues } = values;
    if (isAddMode) {
      mutation.mutate(newValues, {
        onSuccess: () => {
          resetForm();
          handleToast("success", "Add new user successfully");
        },
        onError: (error) => {
          console.log(error);
          handleToast("error", error.response?.data?.message);
        },
      });
    } else {
      updateMutation.mutate(newValues, {
        onSuccess: (data) => {
          queryClient.setQueryData(["users", username], data);
          handleToast("success", "Update user successfully");
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
        title={isAddMode ? "CREATE USER" : "EDIT USER"}
        subTitle={isAddMode ? "Create user profile" : "Edit user profile"}
      />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={data ? { ...data, isEditMode: true } : initialValues}
        validationSchema={userScheme}
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
                disabled={!isAddMode}
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                disabled={!isAddMode}
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                disabled={!isAddMode}
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                disabled={!isAddMode}
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Phone"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phone}
                name="phone"
                error={!!touched.phone && !!errors.phone}
                helperText={touched.phone && errors.phone}
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
                  <DatePicker
                    disabled={!isAddMode}
                    format="dd/MM/yyyy"
                    label="Day of Birth"
                    maxDate={new Date()}
                    value={parse(values.dob, "yyyy-MM-dd", new Date())}
                    onChange={(newDate) => {
                      setFieldValue("dob", format(newDate, "yyyy-MM-dd"));
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
                        error: !!touched.dob && !!errors.dob,
                      },
                      dialog: {
                        sx: {
                          "& .MuiButton-root": {
                            color: colors.grey[100],
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
                {!!touched.dob && !!errors.dob && (
                  <FormHelperText error>{errors.dob}</FormHelperText>
                )}
              </FormControl>

              <TextField
                disabled={!isAddMode}
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Address"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address}
                name="address"
                error={!!touched.address && !!errors.address}
                helperText={touched.address && errors.address}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <FormControl
                disabled={!isAddMode}
                sx={{
                  gridColumn: isAddMode ? "span 4" : "span 2",
                }}
              >
                <FormLabel color="warning" id="gender">
                  Gender
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="gender"
                  name="row-radio-buttons-group"
                  value={values.gender}
                  onChange={(e) => {
                    setFieldValue("gender", e.currentTarget.value);
                  }}
                >
                  <FormControlLabel
                    value="false"
                    label="Male"
                    control={
                      <Radio
                        sx={{
                          color: "#00a0bd",
                          "&.Mui-checked": {
                            color: "#00a0bd",
                          },
                        }}
                      />
                    }
                  />
                  <FormControlLabel
                    value="true"
                    label="Female"
                    control={
                      <Radio
                        sx={{
                          color: "#00a0bd",
                          "&.Mui-checked": {
                            color: "#00a0bd",
                          },
                        }}
                      />
                    }
                  />
                </RadioGroup>
              </FormControl>

              {!isAddMode && (
                <FormControl
                  sx={{
                    gridColumn: "span 2",
                  }}
                >
                  <FormLabel color="warning" id="active">
                    Active
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="active"
                    name="row-radio-buttons-group"
                    value={values.active}
                    onChange={(e) => {
                      setFieldValue("active", e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="false"
                      control={
                        <Radio
                          sx={{
                            color: "#00a0bd",
                            "&.Mui-checked": {
                              color: "#00a0bd",
                            },
                          }}
                        />
                      }
                      label="False"
                    />
                    <FormControlLabel
                      value="true"
                      control={
                        <Radio
                          sx={{
                            color: "#00a0bd",
                            "&.Mui-checked": {
                              color: "#00a0bd",
                            },
                          }}
                        />
                      }
                      label="True"
                    />
                  </RadioGroup>
                </FormControl>
              )}

              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Username"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.username}
                name="username"
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{
                  gridColumn: isAddMode ? "span 2" : "span 4",
                }}
                disabled={!isAddMode}
              />
              {isAddMode && (
                <FormControl
                  color="warning"
                  sx={{ gridColumn: "span 2" }}
                  variant="outlined"
                  size="small"
                >
                  <InputLabel
                    error={!!touched.password && !!errors.password}
                    htmlFor="outlined-adornment-password"
                  >
                    Password
                  </InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPwd ? "text" : "password"}
                    label="Password"
                    fullWidth
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                    name="password"
                    error={!!touched.password && !!errors.password}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPwd(!showPwd)}
                          edge="end"
                        >
                          {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {!!touched.password && !!errors.password && (
                    <FormHelperText error>{errors.password}</FormHelperText>
                  )}
                </FormControl>
              )}
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

export default UserForm;
