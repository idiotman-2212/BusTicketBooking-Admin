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
import { useTranslation } from "react-i18next";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const BookingForm = () => {
  const { bookingId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
        handleToast("success", t("Update Booking successfully"));
      },
      onError: (error) => {
        console.log(error);
        handleToast("error", error.response?.data?.message);
      },
    });
  };

  const formatLocation = (location) => {
    if (!location) return t("Chưa xác định");

    const { address, ward, district, province } = location;
    return `${address || ""}${ward ? ", " + ward : ""}${
      district ? ", " + district : ""
    }${province?.name ? ", " + province.name : ""}`;
  };

  const handleCancelBooking = () => {
    deleteMutation.mutate();
  };

  return (
    <Box m="20px">
      <Header title={t("EDIT BOOKING")} subTitle={t("Edit booking profile")} />
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
          }) => {
            // Kiểm tra trạng thái không cho chỉnh sửa nếu paymentStatus là CANCEL hoặc REFUNDED
            const isEditable =
              values.paymentStatus !== "CANCEL" ||
              (values.paymentStatus === "CANCEL" &&
                values.paymentMethod === "CARD");

            return (
              <form onSubmit={handleSubmit}>
                {/* booking summary */}
                <Box
                  display="flex"
                  flexDirection="column"
                  gap="10px"
                  textAlign="center"
                >
                  <Typography variant="h3" fontWeight="bold" mb="16px">
                    {t("Summary Booking Info")}
                  </Typography>
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>
                      {t("Customer")}:{" "}
                    </span>
                    {`${values.custFirstName} ${values.custLastName}`}
                  </Typography>
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>
                      {t("Contact Phone")}:{" "}
                    </span>
                    {`${values.phone}`}
                  </Typography>
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>
                      {t("Pickup Location")}:{" "}
                    </span>
                    {formatLocation(bookingQuery.data.trip.pickUpLocation)}
                  </Typography>
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>
                      {t("Dropoff Location")}:{" "}
                    </span>
                    {formatLocation(bookingQuery.data.trip.dropOffLocation)}
                  </Typography>
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>{t("Route")}: </span>
                    {`${values.trip.source.name} ${
                      values.bookingType === "ONEWAY" ? `\u21D2` : `\u21CB`
                    } ${values.trip.destination.name}`}
                  </Typography>
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>{t("Coach")}: </span>
                    {`${values.trip.coach.name}, Type: ${values.trip.coach.coachType}`}
                  </Typography>
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>
                      {t("Departure DateTime")}:{" "}
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
                    <span style={{ fontWeight: "bold" }}>{t("Total")}: </span>
                    {`${formatCurrency(values.totalPayment)}`}
                  </Typography>
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>{t("Seats")}: </span>
                    {values.seatNumber}
                  </Typography>
                  <Typography component="span" variant="h5">
                    <span style={{ fontWeight: "bold" }}>{t("Method")}: </span>
                    {values.paymentMethod}
                  </Typography>
                  {values.paymentStatus === "CANCEL" && (
                    <Typography component="span" variant="h5">
                      <span style={{ fontWeight: "bold" }}>
                        {t("Payment Status")}:{" "}
                      </span>
                      {values.paymentStatus}ED
                    </Typography>
                  )}
                </Box>

                {/* payment status */}
                {isEditable ||
                (values.paymentMethod === "CARD" &&
                  values.paymentStatus === "CANCEL") ? (
                  <FormControl sx={{ gridColumn: "span 2" }}>
                    <FormLabel color="warning" id="paymentStatus">
                      {t("Payment Status")}
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
                      {/* Chỉ hiển thị UNPAID và PAID nếu không thanh toán bằng card hoặc chưa bị hủy */}
                      {!(
                        values.paymentMethod === "CARD" &&
                        (values.paymentStatus === "CANCEL" ||
                          values.paymentStatus === "REFUNDED")
                      ) && (
                        <>
                          <FormControlLabel
                            value="UNPAID"
                            control={<Radio />}
                            label={t("UNPAID")}
                          />
                          <FormControlLabel
                            value="PAID"
                            control={<Radio />}
                            label={t("PAID")}
                          />
                        </>
                      )}
                      {/* Chỉ hiển thị REFUNDED nếu thanh toán bằng thẻ và đã hủy */}
                      {values.paymentMethod === "CARD" &&
                        (values.paymentStatus === "CANCEL" ||
                          values.paymentStatus === "REFUNDED") && (
                          <FormControlLabel
                            value="REFUNDED"
                            control={<Radio />}
                            label={t("REFUNDED")}
                          />
                        )}
                    </RadioGroup>
                  </FormControl>
                ) : null}

                <Box mt="20px" display="flex" justifyContent="center">
                  <LoadingButton
                    disabled={!isEditable}
                    color="secondary"
                    type="submit"
                    variant="contained"
                    loadingPosition="start"
                    loading={updateMutation.isLoading}
                    startIcon={<SaveAsOutlinedIcon />}
                  >
                    {t("SAVE")}
                  </LoadingButton>
                </Box>
                {!isEditable &&
                  !(
                    values.paymentMethod === "CARD" &&
                    values.paymentStatus === "CANCEL"
                  ) && (
                    <Typography mt="20px" textAlign="center" color="error">
                      {t(
                        "You cannot edit this booking as it has been cancelled or refunded."
                      )}
                    </Typography>
                  )}
              </form>
            );
          }}
        </Formik>
      )}
    </Box>
  );
};

export default BookingForm;
