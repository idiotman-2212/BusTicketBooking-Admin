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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import React, { useState } from "react";
import { useMatch, useParams } from "react-router-dom";
import * as yup from "yup";
import Header from "../../../components/Header";
import { tokens } from "../../../theme";
import { handleToast } from "../../../utils/helpers";
import * as provinceApi from "../../global/provinceQueries";
import * as locationApi from "../../location/locationQueries";
import { useTranslation } from "react-i18next";

const initialValues = {
  id: -1,
  address: "",
  district: "",
  ward: "",
  province: null,
  isActive: true,
  isEditMode: false, // remove this field when submit
};

const locationSchema = yup.object().shape({
  address: yup.string().required("Required"),
  district: yup.string().required("Required"),
  ward: yup.string().required("Required"),
  province: yup.object().required("Required"),
  isActive: yup.boolean().default(true),
});

const LocationForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const addNewMatch = useMatch("/locations/new");
  const isAddMode = !!addNewMatch;
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { locationId } = useParams();
  const queryClient = useQueryClient();
  const [provinceClicked, setProvinceClicked] = useState(false);
  const { t } = useTranslation();

  // prepare data (provinces for autocomplete)
  const provinceQuery = useQuery({
    queryKey: ["provinces", "all"],
    queryFn: () => provinceApi.getAll(),
    enabled: provinceClicked,
  });

  const handleProvinceOpen = () => {
    if (!provinceQuery.data) {
      setProvinceClicked(true);
    }
  };

// Load location data when mode is EDIT
const { data, isLoading: isLocationLoading } = useQuery({
  queryKey: ["locations", locationId],
  queryFn: () => locationApi.getLocationById(locationId), // Updated function name
  enabled: locationId !== undefined && !isAddMode,
});


  const mutation = useMutation({
    mutationFn: (newLocation) => locationApi.createLocation(newLocation),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedLocation) =>
      locationApi.updateLocation(updatedLocation),
  });

  // HANDLE FORM SUBMIT
  const handleFormSubmit = async (values, { resetForm }) => {
    console.log("Submitting with values:", values);
    let { isEditMode, ...newValues } = values;

    try {
      const action = isAddMode
        ? mutation.mutateAsync
        : updateMutation.mutateAsync;
      await action(newValues, {
        onSuccess: () => {
          resetForm();
          handleToast(
            "success",
            isAddMode
              ? t("Add new location successfully")
              : t("Update location successfully")
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

      queryClient.invalidateQueries(["locations"]); // Refresh cache
    } catch (error) {
      console.error("Error:", error);
      //handleToast("error", "An error occurred while processing the location.");
    }
  };

  return (
    <Box m="20px">
      <Header
        title={isAddMode ? t("CREATE LOCATION") : t("EDIT LOCATION")}
        subTitle={
          isAddMode ? t("Create location profile") : t("Edit location profile")
        }
      />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={
          data
            ? {
                id: data.id,
                address: data.address,
                district: data.district,
                ward: data.ward,
                province: data.province,
                isActive: data.isActive,
                isEditMode: true,
              }
            : initialValues
        }
        validationSchema={locationSchema}
        enableReinitialize={true} // Chỉ khởi tạo lại khi initialValues thay đổi
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
                label={t("Address")}
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
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                label={t("District")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.district}
                name="district"
                error={!!touched.district && !!errors.district}
                helperText={touched.district && errors.district}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                label={t("Ward")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.ward}
                name="ward"
                error={!!touched.ward && !!errors.ward}
                helperText={touched.ward && errors.ward}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <Autocomplete
                id="province-autocomplete"
                value={values.province}
                onOpen={handleProvinceOpen}
                onChange={(e, newValue) => setFieldValue("province", newValue)}
                getOptionLabel={(option) => option.name}
                options={provinceQuery.data ?? []}
                loading={provinceClicked && provinceQuery.isLoading}
                sx={{
                  gridColumn: "span 2",
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="province"
                    label={t("Province")}
                    color="warning"
                    size="small"
                    fullWidth
                    variant="outlined"
                    onBlur={handleBlur}
                    error={!!touched.province && !!errors.province}
                    helperText={touched.province && errors.province}
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
              <FormControl>
                <FormLabel color="warning" id="status">
                  {t("Location Status")}
                </FormLabel>
                <RadioGroup
                  row
                  aria-label="isActive"
                  name="isActive"
                  value={values.isActive.toString()}
                  onChange={(e) =>
                    setFieldValue("isActive", e.target.value === "true")
                  }
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio color="primary" />}
                    label={t("Active")}
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label={t("Inactive")}
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

export default LocationForm;
