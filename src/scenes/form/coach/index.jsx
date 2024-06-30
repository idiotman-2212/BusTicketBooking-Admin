import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import React from "react";
import { useMatch, useParams } from "react-router-dom";
import * as yup from "yup";
import Header from "../../../components/Header";
import { debounce } from "../../../utils/debounce";
import { handleToast } from "../../../utils/helpers";
import * as coachApi from "../../bus/coachQueries";

const initialValues = {
  id: 0,
  name: "",
  capacity: 0,
  licensePlate: "",
  coachType: "BED",
  isEditMode: false, // remove this field when submit
};

const checkDuplicateNameDebounced = debounce(
  coachApi.checkDuplicateCoachInfo,
  500
);
const checkDuplicateLicensePlateDebounced = debounce(
  coachApi.checkDuplicateCoachInfo,
  500
);

const coachScheme = yup.object().shape({
  id: yup.number().notRequired(),
  name: yup
    .string()
    .required("Required")
    .test("name", "Name is already used", async (value, ctx) => {
      const isAvailable = await checkDuplicateNameDebounced(
        ctx.parent.isEditMode ? "EDIT" : "ADD",
        ctx.parent.id,
        "name",
        value
      );
      return isAvailable;
    }),
  capacity: yup.number().positive("Capacity must be positive"),
  licensePlate: yup
    .string()
    .required("Required")
    .test(
      "licensePlate",
      "License plate is already used",
      async (value, ctx) => {
        const isAvailable = await checkDuplicateLicensePlateDebounced(
          ctx.parent.isEditMode ? "EDIT" : "ADD",
          ctx.parent.id,
          "licensePlate",
          value
        );
        return isAvailable;
      }
    ),
  coachType: yup.string().required("Required").default("BED"),
  isEditMode: yup.boolean().default(true),
});

const CoachForm = () => {
  const addNewMatch = useMatch("/coaches/new");
  const isAddMode = !!addNewMatch;
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const { coachId } = useParams();
  const queryClient = useQueryClient();

  // Load coach data when mode is EDIT
  const { data } = useQuery({
    queryKey: ["coaches", coachId],
    queryFn: () => coachApi.getCoach(coachId),
    enabled: coachId !== undefined && !isAddMode, // only query when coachId is available
  });

  const mutation = useMutation({
    mutationFn: (newCoach) => coachApi.createNewCoach(newCoach),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedCoach) => coachApi.updateCoach(updatedCoach),
  });

  // HANDLE FORM SUBMIT
  const handleFormSubmit = (values, { resetForm }) => {
    let { isEditMode, ...newValues } = values;
    if (isAddMode) {
      mutation.mutate(newValues, {
        onSuccess: () => {
          resetForm();
          handleToast("success", "Add new coach successfully");
        },
        onError: (error) => {
          console.log(error);
          handleToast("error", error.response?.data?.message);
        },
      });
    } else {
      updateMutation.mutate(newValues, {
        onSuccess: (data) => {
          queryClient.setQueryData(["coaches", coachId], data);
          handleToast("success", "Update coach successfully");
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
        title={isAddMode ? "CREATE COACH" : "EDIT COACH"}
        subTitle={isAddMode ? "Create coach profile" : "Edit coach profile"}
      />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={data ? { ...data, isEditMode: true } : initialValues}
        validationSchema={coachScheme}
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
                label="Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="License Plate"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.licensePlate}
                name="licensePlate"
                error={!!touched.licensePlate && !!errors.licensePlate}
                helperText={touched.licensePlate && errors.licensePlate}
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
                label="Capacity"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.capacity}
                name="capacity"
                error={!!touched.capacity && !!errors.capacity}
                helperText={touched.capacity && errors.capacity}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <FormControl
                fullWidth
                color="warning"
                size="small"
                sx={{
                  gridColumn: "span 2",
                }}
              >
                <InputLabel id="coach-type-select">Coach Type</InputLabel>
                <Select
                  labelId="coach-type-select"
                  id="coach-type-select-demo"
                  value={values.coachType}
                  label="Coach Type"
                  onChange={(e) => setFieldValue("coachType", e.target.value)}
                >
                  <MenuItem value={"BED"}>BED</MenuItem>
                  <MenuItem value={"CHAIR"}>CHAIR</MenuItem>
                  <MenuItem value={"LIMOUSINE"}>LIMOUSINE</MenuItem>
                </Select>
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
                {isAddMode ? "CREATE" : "SAVE"}
              </LoadingButton>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default CoachForm;
