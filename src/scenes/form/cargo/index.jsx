import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  useMediaQuery,
  useTheme,
  FormLabel
} from "@mui/material";
import { Formik } from "formik";
import React from "react";
import { useMatch, useParams } from "react-router-dom";
import * as yup from "yup";
import Header from "../../../components/Header";
import { tokens } from "../../../theme";
import { handleToast } from "../../../utils/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as cargoApi from "../../cargo/cargoQueries";
import { useTranslation } from "react-i18next";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Initial form values
const initialValues = {
  id: -1,
  name: "",
  description: "",
  basePrice: 0,
  isDeleted: false,
  isEditMode: false, // Xác định trạng thái edit hay không
};

// Validation schema using Yup
const cargoSchema = yup.object().shape({
  name: yup.string().required("Cargo name is required"),
  description: yup.string().required("Description is required"),
  basePrice: yup
    .number()
    .positive("Base price must be positive")
    .required("Base price is required"),
});

const CargoForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const addNewMatch = useMatch("/cargos/new");
  const isAddMode = !!addNewMatch;
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { cargoId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Load Cargo data when mode is EDIT
  const { data } = useQuery({
    queryKey: ["cargos", cargoId],
    queryFn: () => cargoApi.getCargoById(cargoId),
    enabled: cargoId !== undefined && !isAddMode, // only query when cargoId is available
  });

  // Mutation for creating and updating Cargo
  const mutation = useMutation({
    mutationFn: (newCargo) => cargoApi.createCargo(newCargo),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedCargo) => cargoApi.updateCargo(updatedCargo),
  });

  // Handle form submission
  const handleFormSubmit = async (values, { resetForm }) => {
    let { isEditMode, ...newValues } = values; // Remove isEditMode before submission

    try {
      // Quyết định giữa tạo mới và cập nhật
      const action = isAddMode
        ? mutation.mutateAsync(newValues)  // Tạo mới
        : updateMutation.mutateAsync(newValues); // Cập nhật với body là newValues

      await action;
      resetForm();
      handleToast(
        "success",
        isAddMode ? t("Cargo added successfully") : t("Cargo updated successfully")
      );

      queryClient.invalidateQueries(["cargos"]); // Refresh cache
    } catch (error) {
      console.error("Error:", error);
      handleToast("error", "An error occurred while processing the cargo.");
    }
  };

  return (
    <Box m="20px">
      <Header
        title={isAddMode ? t("CREATE CARGO") : t("EDIT CARGO")}
        subTitle={isAddMode ? t("Create cargo profile") : t("Edit cargo profile")}
      />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={
          data
            ? {
                ...data,
                isEditMode: true,
              }
            : initialValues
        }
        validationSchema={cargoSchema}
        enableReinitialize={true}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
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
              {/* Cargo Name */}
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                label={t("Cargo Name")}
                name="name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{
                  gridColumn: "span 2",
                }}
              />

              {/* Cargo Description */}
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                label={t("Description")}
                name="description"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.description}
                error={!!touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                sx={{
                  gridColumn: "span 2",
                }}
              />

              {/* Base Price */}
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                label={t("Base Price")}
                name="basePrice"
                type="number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.basePrice}
                error={!!touched.basePrice && !!errors.basePrice}
                helperText={touched.basePrice && errors.basePrice}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formatCurrency(values.basePrice)}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  gridColumn: "span 2",
                }}
              />

              {/* Chỉ hiển thị trường isDeleted khi chỉnh sửa */}
              {!isAddMode && (
                <FormControl sx={{ gridColumn: "span 2" }}>
                  <FormLabel>{t("Is Deleted")}</FormLabel>
                  <RadioGroup
                    row
                    name="isDeleted"
                    value={values.isDeleted ? "true" : "false"}
                    onChange={(e) =>
                      setFieldValue("isDeleted", e.target.value === "true")
                    }
                  >
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label={t("Active")}
                    />
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label={t("Deleted")}
                    />
                  </RadioGroup>
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
                {isAddMode ? t("CREATE") : t("SAVE")}
              </LoadingButton>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default CargoForm;
