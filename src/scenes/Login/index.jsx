import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import * as yup from "yup";
import * as authApi from "../../scenes/global/authQueries";
import { tokens } from "../../theme";
import { ROLES } from "../../utils/appContants";
import { debounce } from "../../utils/debounce";
import { handleToast } from "../../utils/helpers";
import useLogin from "../../utils/useLogin";
import * as userApi from "../user/userQueries";
import { useTranslation } from 'react-i18next';

const initialValues = {
  username: "",
  password: "",
};

const checkActiveStatusDebounced = debounce(authApi.checkActiveStatus, 500);

const checkExistUsernameDebounced = debounce(authApi.checkExistUsername, 500);

const authSchema = yup.object().shape({
  username: yup
    .string()
    .required("Required")
    .test("username", "Username is not exist or blocked", async (value) => {
      const isAvailable = await checkExistUsernameDebounced(value);
      const isActive = await checkActiveStatusDebounced(value);
      return isAvailable && isActive;
    }),
  password: yup.string().required("Required"),
});

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useLogin();
  const { t } = useTranslation();

  const loginMutation = useMutation({
    mutationFn: (authReq) => authApi.login(authReq),
  });

  //lấy quyền người dùng
  const handleGetUserPermissions = async (username) => {
    const data = await userApi.getUserPermission(username);
    const permissions = data.permission;
    return permissions;
  };

  //kiểm tra quyền người dùng để điều hướng đến trang chính
  const handleAccessAdminPage = (permissions) => {
    const allowedRoles = [ROLES.ROLE_ADMIN, ROLES.ROLE_STAFF];
    const userRoles = Object.keys(permissions);
    const hasAccessPermission = allowedRoles.some((role) =>
      userRoles.includes(role)
    );
    return hasAccessPermission;
  };

  
  const handleFormSubmit = (values, actions) => {
    loginMutation.mutate(values, {
      onSuccess: async (data) => {
        const accessToken = data.token;
        localStorage.setItem("acToken", accessToken);
        localStorage.setItem("loginUser", values.username);
        // get user role list
        const permissions = await handleGetUserPermissions(values.username);
        const isAllowedAccess = handleAccessAdminPage(permissions);
        if (isAllowedAccess) {
          navigate("/dashboard");
          localStorage.setItem("permissions", JSON.stringify(permissions));
          handleToast("success", t("Login successfully"));
        } else {
          navigate("/login");
          localStorage.removeItem("acToken");
          localStorage.removeItem("loginUser");
          handleToast("error", t("You don't have permission to access"));
        }
      },
      onError: (error) => {
        console.log(error);
        if (error.response?.status === 403) {
          handleToast("error", t("Wrong password"));
        } else handleToast("error", error.response?.data?.message);
      },
    });
  };

  return !isLoggedIn ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="500px"
    >
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={authSchema}
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
              width="400px"
              p="20px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              bgcolor={colors.primary[400]}
              borderRadius="8px"
            >
              <Box gridColumn="span 4" textAlign="center" m="20px 0">
                <Typography variant="h2" fontWeight="bold">
                  {t('Login')}
                </Typography>
              </Box>

              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Username *")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.username}
                name="username"
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <FormControl
                color="warning"
                sx={{ gridColumn: "span 4" }}
                variant="outlined"
                size="small"
              >
                <InputLabel
                  error={!!touched.password && !!errors.password}
                  htmlFor="outlined-adornment-password"
                >
                  Mật khẩu *
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPwd ? "text" : "password"}
                  label="Password *"
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

              <Box gridColumn="span 4" textAlign="center" m="10px">
                <Button
                  disableElevation
                  disableRipple
                  variant="contained"
                  color="success"
                  type="submit"
                >
                  {t('Login')}
                </Button>
              </Box>
              <Box
                mb="20px"
                display="flex"
                gridColumn="span 4"
                textAlign="center"
                justifyContent="center"
                flexDirection="column"
                gap="10px"
              >
                <Box>
                  <Typography component="span" variant="h5">
                    {t('Forgot your account ?')}
                    <Link to="/forgot" style={{ textDecoration: "none" }}>
                      <Typography component="span" variant="h5">
                        {" "}
                        {t('Reset Password')}
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  ) : (
    <Navigate to="/not-allowed" />
  );
};

export default Login;
