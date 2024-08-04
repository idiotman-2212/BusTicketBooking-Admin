import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { tokens } from "../../theme";
import { handleToast } from "../../utils/helpers";
import * as authApi from "../global/authQueries";

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

const initialValues = {
  username: localStorage.getItem("loginUser"),
  newPassword: "",
  reNewPassword: "",
};

const changePwdSchema = yup.object().shape({
  newPassword: yup.string().required("Required"),
  reNewPassword: yup
    .string()
    .required("Required")
    .test("newPassword", "New password is not match", (value, ctx) => {
      return value === ctx.parent.newPassword;
    }),
});

const ChangePassword = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const changePwdMutation = useMutation({
    mutationFn: (changePwdRequest) => authApi.changePwd(changePwdRequest),
  });

  const handleChangePasswordSubmit = (values, actions) => {
    const { reNewPassword, ...changePwdRequest } = values;
    changePwdMutation.mutate(changePwdRequest, {
      onSuccess: (data) => {
        localStorage.removeItem("loginUser");
        localStorage.removeItem("acToken");
        handleToast("success", data);
        navigate("/login");
      },
      onError: (error) => {
        console.log(error);
        handleToast("error", error.response?.data?.message);
      },
    });
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="500px"
    >
      <Formik
        onSubmit={handleChangePasswordSubmit}
        initialValues={initialValues}
        validationSchema={changePwdSchema}
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
                  Change password
                </Typography>
              </Box>

              <TextField
                disabled={true}
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Username *"
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
                  error={!!touched.newPassword && !!errors.newPassword}
                  htmlFor="outlined-adornment-password"
                >
                  New password *
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPwd ? "text" : "password"}
                  label="Mật khẩu *"
                  fullWidth
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.newPassword}
                  name="newPassword"
                  error={!!touched.newPassword && !!errors.newPassword}
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
                {!!touched.newPassword && !!errors.newPassword && (
                  <FormHelperText error>{errors.newPassword}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                color="warning"
                sx={{ gridColumn: "span 4" }}
                variant="outlined"
                size="small"
              >
                <InputLabel
                  error={!!touched.reNewPassword && !!errors.reNewPassword}
                  htmlFor="outlined-adornment-password"
                >
                  Confirm new password *
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPwd ? "text" : "password"}
                  label="Mật khẩu *"
                  fullWidth
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.reNewPassword}
                  name="reNewPassword"
                  error={!!touched.reNewPassword && !!errors.reNewPassword}
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
                {!!touched.reNewPassword && !!errors.reNewPassword && (
                  <FormHelperText error>{errors.reNewPassword}</FormHelperText>
                )}
              </FormControl>

              <Box gridColumn="span 4" textAlign="center" m="10px">
                <Button
                  disableElevation
                  disableRipple
                  variant="contained"
                  color="secondary"
                  type="submit"
                >
                  Change
                </Button>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default ChangePassword;
