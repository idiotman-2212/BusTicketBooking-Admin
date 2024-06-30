import React from "react";
import { useParams } from "react-router-dom";
import * as bookingApi from "../../ticket/ticketQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import Header from "../../../components/Header";
import { Formik } from "formik";
import { LoadingButton } from "@mui/lab";
import { handleToast } from "../../../utils/helpers";
import { parse, format } from "date-fns";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const BookingForm = () => {
  const { bookingId } = useParams();
  const queryClient = useQueryClient();

  const bookingQuery = useQuery({
    queryKey: ["bookings", bookingId],
    queryFn: () => bookingApi.getBooking(bookingId),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedBooking) => bookingApi.updateBooking(updatedBooking),
  });

  const handleFormSubmit = (values, actions) => {
    updateMutation.mutate(values, {
      onSuccess: (data) => {
        queryClient.setQueryData(["bookings", bookingId], data);
        handleToast("success", "Update Booking successfully");
      },
      onError: (error) => {
        console.log(error);
        handleToast("error", error.response?.data?.message);
      },
    });
  };

  return (
    <Box m="20px">
      <Header title={"EDIT BOOKING"} subTitle={"Edit booking profile"} />
      {!bookingQuery.isSuccess ? undefined : (
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={bookingQuery.data}
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
              {/* booking summary */}
              <Box
                display="flex"
                flexDirection="column"
                gap="10px"
                textAlign="center"
              >
                <Typography variant="h3" fontWeight="bold" mb="16px">
                  Summary Booking Info
                </Typography>
                <Typography component="span" variant="h5">
                  <span style={{ fontWeight: "bold" }}>Customer: </span>
                  {`${values.custFirstName} ${values.custLastName}`}
                </Typography>
                <Typography component="span" variant="h5">
                  <span style={{ fontWeight: "bold" }}>Contact Phone: </span>
                  {`${values.phone}`}
                </Typography>
                <Typography component="span" variant="h5">
                  <span style={{ fontWeight: "bold" }}>Pickup Address: </span>
                  {`${values.pickUpAddress}`}
                </Typography>
                <Typography component="span" variant="h5">
                  <span style={{ fontWeight: "bold" }}>Route: </span>
                  {`${values.trip.source.name} ${
                    values.bookingType === "ONEWAY" ? `\u21D2` : `\u21CB`
                  } ${values.trip.destination.name}`}
                </Typography>
                <Typography component="span" variant="h5">
                  <span style={{ fontWeight: "bold" }}>Coach: </span>
                  {`${values.trip.coach.name}, Type: ${values.trip.coach.coachType}`}
                </Typography>
                <Typography component="span" variant="h5">
                  <span style={{ fontWeight: "bold" }}>
                    Departure DateTime:{" "}
                  </span>{" "}
                  {format(
                    parse(
                      values.trip.departureDateTime,
                      "yyyy-MM-dd HH:mm",
                      new Date()
                    ),
                    "HH:mm dd-MM-yyyy"
                  )}
                </Typography>
                <Typography component="span" variant="h5">
                  <span style={{ fontWeight: "bold" }}>Total: </span>
                  {`${formatCurrency(values.totalPayment)}`}
                </Typography>
                <Typography component="span" variant="h5">
                  <span style={{ fontWeight: "bold" }}>Seats: </span>
                  {values.seatNumber}
                </Typography>
                <Typography component="span" variant="h5">
                  <span style={{ fontWeight: "bold" }}>Method: </span>
                  {values.paymentMethod}
                </Typography>
                {values.paymentStatus === "CANCEL" && (
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>Payment Status: </span>
                    {values.paymentStatus}ED
                  </Typography>
                )}
              </Box>
              {/* payment status */}
              {values.paymentStatus !== "CANCEL" && (
                <FormControl
                  sx={{
                    gridColumn: "span 2",
                  }}
                >
                  <FormLabel color="warning" id="paymentStatus">
                    Payment Status
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="paymentStatus"
                    name="row-radio-buttons-group"
                    value={values.paymentStatus}
                    onChange={(e) => {
                      setFieldValue("paymentStatus", e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="UNPAID"
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
                      label="UNPAID"
                    />
                    <FormControlLabel
                      value="PAID"
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
                      label="PAID"
                    />
                  </RadioGroup>
                </FormControl>
              )}

              <Box mt="20px" display="flex" justifyContent="center">
                <LoadingButton
                  disabled={values.paymentStatus === "CANCEL"}
                  color="secondary"
                  type="submit"
                  variant="contained"
                  loadingPosition="start"
                  loading={updateMutation.isLoading}
                  startIcon={<SaveAsOutlinedIcon />}
                >
                  "SAVE"
                </LoadingButton>
              </Box>
            </form>
          )}
        </Formik>
      )}
    </Box>
  );
};

export default BookingForm;
