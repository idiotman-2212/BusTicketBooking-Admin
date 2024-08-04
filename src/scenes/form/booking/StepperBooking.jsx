import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { LoadingButton } from "@mui/lab";
import { Box, Button, Typography } from "@mui/material";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { format } from "date-fns";
import { Formik } from "formik";
import React, { useState } from "react";
import { useMatch } from "react-router-dom";
import Header from "../../../components/Header";
import PaymentForm from "./stepContentForm/PaymentForm";
import SeatForm from "./stepContentForm/SeatForm";
import TripForm from "./stepContentForm/TripForm";
import validationSchema from "./validationSchema";
import * as bookingApi from "../../ticket/ticketQueries";
import { useMutation } from "@tanstack/react-query";
import { handleToast } from "../../../utils/helpers";

const initialValues = {
  id: -1,
  user: null,
  trip: null,
  source: null, // remove when submit
  destination: null, // remove when submit
  from: format(new Date(), "yyyy-MM-dd"), // remove when submit
  to: format(new Date(), "yyyy-MM-dd"), // remove when submit
  bookingDateTime: format(new Date(), "yyyy-MM-dd HH:mm"),
  seatNumber: [], // user can choose max 5 seat, in that case: create 5 tickets
  bookingType: "ONEWAY",
  pickUpAddress: "",
  firstName: "", // used for create user
  lastName: "", // used for create user
  phone: "", // used for create user
  email: "", // used for create user
  totalPayment: 0,
  paymentDateTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
  paymentMethod: "CASH",
  paymentStatus: "UNPAID",
  nameOnCard: "", // used to validate when paymentMethod is CARD, remove when submit
  cardNumber: "", // used to validate when paymentMethod is CARD, remove when submit
  expiredDate: format(new Date(), "MM/yy"), // used to validate when paymentMethod is CARD, remove when submit
  cvv: "", // used to validate when paymentMethod is CARD, remove when submit
  isEditMode: false, // remove this field when submit
};

const renderStepContent = (
  step,
  field,
  setActiveStep,
  bookingData,
  setBookingData
) => {
  switch (step) {
    case 0:
      return (
        <TripForm
          field={field}
          setActiveStep={setActiveStep}
          bookingData={bookingData}
          setBookingData={setBookingData}
        />
      );
    case 1:
      return (
        <SeatForm
          field={field}
          setActiveStep={setActiveStep}
          bookingData={bookingData}
          setBookingData={setBookingData}
        />
      );
    case 2:
      return (
        <PaymentForm
          field={field}
          setActiveStep={setActiveStep}
          bookingData={bookingData}
          setBookingData={setBookingData}
        />
      );
    default:
      return <Typography variant="h4"> Not found</Typography>;
  }
};

const steps = ["Choose Trip", "Choose Seat", "Payment"];

const StepperBooking = () => {
  const addNewMatch = useMatch("/tickets/new");
  const isAddMode = !!addNewMatch;
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState(initialValues);
  const currentValidationSchema = validationSchema[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // create new Bookings
  const createMutation = useMutation({
    mutationFn: (newBookings) => bookingApi.createNewBookings(newBookings),
  });

  // main process submit form
  const submitForm = (values, actions) => {
    const {
      user,
      source,
      destination,
      nameOnCard,
      cardNumber,
      expiredDate,
      cvv,
      isEditMode,
      ...newValues
    } = values;

    actions.setSubmitting(false);

    if (isAddMode) {
      createMutation.mutate(newValues, {
        onSuccess: () => {
          actions.resetForm();
          handleToast("success", "Add new Bookings successfully");
        },
        onError: (error) => {
          console.log(error);
          handleToast("error", error.response?.data?.message);
        },
      });
    } else {
    }
    setActiveStep(0);
    // handleNext();  // khi nao thanh cong thi chuyen trang success
  };

  // handle submit
  const handleFormSubmit = (values, actions) => {
    if (isLastStep) {
      submitForm(values, actions);
    } else {
      handleNext();
      actions.setSubmitting(false);
      setBookingData(values);
    }
  };

  return (
    <Box m="20px">
      <Header title={undefined} subTitle={"CREATE BOOKING"} />

      <Box m="0 30px">
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length ? (
          <Typography>All steps are finished</Typography>
        ) : (
          <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={currentValidationSchema}
            enableReinitialize={true}
          >
            {({ isSubmitting, handleSubmit, ...rest }) => (
              <form onSubmit={handleSubmit}>
                <Box m="20px 0">
                  {renderStepContent(
                    activeStep,
                    rest,
                    setActiveStep,
                    bookingData,
                    setBookingData
                  )}
                </Box>
                <Box mt="20px" display="flex" justifyContent="center">
                  {activeStep !== 0 && (
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}
                  <LoadingButton
                    sx={{ marginLeft: "auto" }}
                    color="secondary"
                    type="submit"
                    variant="contained"
                    loadingPosition="start"
                    loading={isSubmitting}
                    startIcon={<SaveAsOutlinedIcon />}
                  >
                    {!isLastStep ? "NEXT" : isAddMode ? "CREATE" : "SAVE"}
                  </LoadingButton>
                </Box>
              </form>
            )}
          </Formik>
        )}
      </Box>
    </Box>
  );
};

export default StepperBooking;
