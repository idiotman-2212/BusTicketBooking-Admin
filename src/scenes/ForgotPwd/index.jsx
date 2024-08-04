import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { tokens } from "../../theme";
import { APP_CONSTANTS } from "../../utils/appContants";
import { debounce } from "../../utils/debounce";
import { handleToast } from "../../utils/helpers";
import * as authApi from "../global/authQueries";

const initialValues = {
  email: "",
};

const checkExistEmailDebounced = debounce(authApi.checkExistEmail, 500);

const forotSchema = yup.object().shape({
  email: yup
    .string()
    .required("Required")
    .matches(APP_CONSTANTS.EMAIL_REGEX, "Invalid Email")
    .test(
      "email",
      "This email has never been used to create any account",
      async (value) => {
        const isAvailable = await checkExistEmailDebounced(value);
        return isAvailable;
      }
    ),
});

const ForgotPwd = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const forgotPwdMutation = useMutation({
    mutationFn: (email) => authApi.forgot(email),
  });

  const handleForgotSubmit = (values) => {
    forgotPwdMutation.mutate(values, {
      onSuccess: (data) => {
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
        onSubmit={handleForgotSubmit}
        initialValues={initialValues}
        validationSchema={forotSchema}
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
                  Reset Password
                </Typography>
              </Box>
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Email *"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <Box gridColumn="span 4" textAlign="center" m="10px">
                <Button
                  disableElevation
                  disableRipple
                  variant="contained"
                  color="secondary"
                  type="submit"
                >
                  Send Email
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
                    Already have an account ?
                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <Typography component="span" variant="h5">
                        {" "}
                        Login
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
  );
};

export default ForgotPwd;
