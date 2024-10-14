import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format, parse } from "date-fns";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import { getAllCargos } from "../../../cargo/cargoQueries";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getBookingPrice = (trip) => {
  if (!trip || !trip.price) return 0;
  let finalPrice = trip.price;
  if (trip.discount && !isNaN(trip.discount.amount)) {
    finalPrice -= trip.discount.amount;
  }
  return finalPrice;
};

const PaymentForm = ({ field, setActiveStep, bookingData, setBookingData }) => {
  const { trip, bookingDateTime, seatNumber, totalPayment } = bookingData;
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    field;
  const { t } = useTranslation();
  const [cardPaymentSelect, setCardPaymentSelect] = useState(
    bookingData.paymentMethod === "CARD"
  );
  const [services, setServices] = useState([]);
  const {
    data: cargoList = [],
    isLoading,
    error,
  } = useQuery(["cargoList"], getAllCargos);

  const handleServiceChange = (cargoId, quantity) => {
    setServices((prevServices) => {
      const updatedServices = prevServices.filter(
        (service) => service.cargoId !== cargoId
      );
      if (quantity > 0) {
        updatedServices.push({ cargoId, quantity });
      }
      return updatedServices;
    });
  };

  useEffect(() => {
    const additionalCost = services.reduce((sum, service) => {
      const cargo = cargoList.find((c) => c.id === service.cargoId);
      return sum + (cargo ? cargo.basePrice * service.quantity : 0);
    }, 0);

    setBookingData((prevData) => ({
      ...prevData,
      totalPayment: getBookingPrice(trip) * seatNumber.length + additionalCost,
      cargoRequests: services.map((service) => ({
        cargoId: service.cargoId,
        quantity: service.quantity,
      })),
    }));
  }, [services, setBookingData, trip, seatNumber.length, cargoList]);

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
      <Paper elevation={3} sx={{ width: "45%", p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {t("Summary Booking Info")}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            <strong>{t("Route")}:</strong>{" "}
            {`${trip.source.name} ${
              bookingData.bookingType === "ONEWAY" ? `\u21D2` : `\u21CB`
            } ${trip.destination.name}`}
          </Typography>
          <Typography variant="body1">
            <strong>{t("Coach")}:</strong>{" "}
            {`${trip.coach.name}, Type: ${trip.coach.coachType}`}
          </Typography>
          <Typography variant="body1">
            <strong>{t("Datetime")}:</strong>{" "}
            {format(
              parse(trip.departureDateTime, "yyyy-MM-dd HH:mm", new Date()),
              "HH:mm dd-MM-yyyy"
            )}
          </Typography>
          <Typography variant="body1">
            <strong>{t("Total")}:</strong>{" "}
            {`${formatCurrency(totalPayment)} (${
              seatNumber.length
            } x ${formatCurrency(getBookingPrice(trip))})`}
          </Typography>
          <Typography variant="body1">
            <strong>{t("Seats")}:</strong> {seatNumber.join(", ")}
          </Typography>
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {t("Choose Additional Services")}
        </Typography>
        <Box sx={{ maxHeight: 200, overflow: "auto", mb: 2 }}>
          {cargoList.map((cargo) => (
            <Card key={cargo.id} variant="outlined" sx={{ mb: 1 }}>
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                }}
              >
                <Typography variant="body2">
                  {cargo.name} - {formatCurrency(cargo.basePrice)}
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={
                    services.find((service) => service.cargoId === cargo.id)
                      ?.quantity || 0
                  }
                  onChange={(e) =>
                    handleServiceChange(cargo.id, Number(e.target.value))
                  }
                  inputProps={{ min: 0 }}
                  sx={{ width: "30%" }}
                />
              </CardContent>
            </Card>
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight="bold">
          {t("Total Payment")}: {formatCurrency(totalPayment)}
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ width: "50%", p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {t("Personal Information")}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t("First Name *")}
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.firstName && Boolean(errors.firstName)}
              helperText={touched.firstName && errors.firstName}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t("Last Name *")}
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lastName && Boolean(errors.lastName)}
              helperText={touched.lastName && errors.lastName}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t("Phone *")}
              name="phone"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone && Boolean(errors.phone)}
              helperText={touched.phone && errors.phone}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Email *"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("Pickup Address *")}
              name="pickUpAddress"
              value={values.pickUpAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.pickUpAddress && Boolean(errors.pickUpAddress)}
              helperText={touched.pickUpAddress && errors.pickUpAddress}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">{t("Payment Method")}</FormLabel>
            <RadioGroup
              row
              name="paymentMethod"
              value={values.paymentMethod}
              onChange={(e) => {
                const paymentMethod = e.target.value;
                setCardPaymentSelect(paymentMethod === "CARD");
                setFieldValue("paymentMethod", paymentMethod);
                setFieldValue("paymentStatus", "PAID");
              }}
            >
              <FormControlLabel
                value="CASH"
                control={<Radio />}
                label={t("CASH")}
              />
              {/* <FormControlLabel
                value="CARD"
                control={<Radio />}
                label={t("CARD")}
              /> */}
            </RadioGroup>
          </FormControl>
        </Box>

        {!cardPaymentSelect && (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">{t("Payment Status")}</FormLabel>
              <RadioGroup
                row
                name="paymentStatus"
                value={values.paymentStatus}
                onChange={(e) => setFieldValue("paymentStatus", e.target.value)}
              >
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
              </RadioGroup>
            </FormControl>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentForm;
