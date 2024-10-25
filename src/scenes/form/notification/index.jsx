import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  Typography,
  FormLabel,
  FormControlLabel,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { Formik } from "formik";
import Header from "../../../components/Header";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as notificationApi from "../../../scenes/notification/notificationQueries";
import { getAllUsers } from "../../user/userQueries";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const NotificationForm = () => {
  const {t} = useTranslation();
  const { notificationId } = useParams();
  const [users, setUsers] = useState([]);
  const [initialValues, setInitialValues] = useState({
    title: "",
    message: "",
    recipientType: "GROUP",
    recipientIdentifiers: [],
  });

  // Fetch users
  const { data: usersData } = useQuery(["users"], getAllUsers, {
    onSuccess: (data) => setUsers(data),
  });

  // Fetch notification data if notificationId is passed (for updating)
  const { data: notificationData, isLoading } = useQuery(
    ["notification", notificationId],
    () => notificationApi.getNotificationById(notificationId),
    {
      enabled: !!notificationId,
      onSuccess: (data) => {
        setInitialValues({
          title: data.title || "",
          message: data.message || "",
          recipientType: data.recipientType || "GROUP",
          recipientIdentifiers: data.recipientIdentifiers ? data.recipientIdentifiers.split(',') : [],
        });
      },
    }
  );

  // Custom validation logic
  const validate = (values) => {
    const errors = {};
    if (!values.title) {
      errors.title = "Title is required";
    }
    if (!values.message) {
      errors.message = "Message is required";
    }
    if (values.recipientType === "GROUP") {
      if (!values.recipientIdentifiers.length) {
        errors.recipientIdentifiers = "At least one recipient must be selected";
      }
    }
    return errors;
  };

  // Handle form submission
  const mutation = useMutation({
    mutationFn: (values) => {
      if (notificationId) {
        // Cập nhật thông báo
        return notificationApi.updateNotification(notificationId, values);
      } else {
        // Tạo mới thông báo
        return notificationApi.createNotification(values);
      }
    },
    onSuccess: () => {
      toast.success(notificationId ? "Notification updated successfully!" : "Notification created successfully!"); 
    },
    onError: (error) => {
      toast.error(error.response?.data.message || "Something went wrong!");
    },
  });

  const handleSubmit = (values, { setSubmitting }) => {
    mutation.mutate(values, {
      onSuccess: () => {
        setSubmitting(false);
        // Xử lý thành công (ví dụ: hiển thị thông báo thành công hoặc điều hướng về danh sách thông báo)
      },
      onError: () => {
        setSubmitting(false);
        // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi)
      },
    });
  };

  return (
    <Box m="20px">
      <Header
        title={notificationId ? t("EDIT NOTIFICATION") : t("CREATE NOTIFICATION")}
        subTitle={notificationId ? t("Edit notification") : t("Create notification")}
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
          handleChange,
          handleBlur,
          setFieldValue,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box display="grid" gap="30px" gridTemplateColumns="repeat(4, 1fr)">
              <FormControl sx={{ gridColumn: "span 4" }}>
                <InputLabel>{t("Title")}</InputLabel>
                <OutlinedInput
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                />
                {!!errors.title && (
                  <FormHelperText error>{errors.title}</FormHelperText>
                )}
              </FormControl>

              <FormControl sx={{ gridColumn: "span 4" }}>
                <InputLabel>{t("Message")}</InputLabel>
                <OutlinedInput
                  name="message"
                  multiline
                  rows={4}
                  value={values.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.message && Boolean(errors.message)}
                />
                {!!errors.message && (
                  <FormHelperText error>{errors.message}</FormHelperText>
                )}
              </FormControl>

              <FormControl sx={{ gridColumn: "span 4" }}>
                <FormLabel>{t("Recipient Type")}</FormLabel>
                <RadioGroup
                  row
                  name="recipientType"
                  value={values.recipientType}
                  onChange={(e) => {
                    setFieldValue("recipientType", e.target.value);
                    if (e.target.value === "ALL") {
                      setFieldValue("recipientIdentifiers", []); // Reset khi chọn ALL
                    }
                  }}
                >
                  <FormControlLabel
                    value="GROUP"
                    control={<Radio />}
                    label={t("Group")}
                  />
                  <FormControlLabel
                    value="ALL"
                    control={<Radio />}
                    label={t("All Users")}
                  />
                </RadioGroup>
              </FormControl>

              {values.recipientType === "GROUP" && (
                <FormControl fullWidth sx={{ gridColumn: "span 4" }}>
                  <InputLabel>{t("Select Users")}</InputLabel>
                  <Select
                    multiple
                    value={Array.isArray(values.recipientIdentifiers) ? values.recipientIdentifiers : []}
                    onChange={(e) => setFieldValue("recipientIdentifiers", e.target.value)}
                    input={<OutlinedInput />}
                    renderValue={(selected) =>
                      Array.isArray(selected)
                        ? selected.join(", ")
                        : ""
                    }
                  >
                    {users?.map((user) => (
                      <MenuItem key={user.username} value={user.username}>
                        <Checkbox
                          checked={values.recipientIdentifiers.includes(user.username)}
                        />
                        <ListItemText primary={user.username} />
                      </MenuItem>
                    ))}
                  </Select>
                  {!!errors.recipientIdentifiers && (
                    <FormHelperText error>
                      {errors.recipientIdentifiers}
                    </FormHelperText>
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
                loading={isSubmitting}
                startIcon={<SaveAsOutlinedIcon />}
              >
                {notificationId ? t("SAVE") : t("CREATE")}
              </LoadingButton>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default NotificationForm;
