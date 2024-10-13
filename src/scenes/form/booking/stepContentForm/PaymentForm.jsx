import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  CircularProgress,
  Card,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, parse } from "date-fns";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getAllCargos } from "../../../cargo/cargoQueries";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getBookingPrice = (trip) => {
  if (!trip || !trip.price) {
    return 0; // Giá trị mặc định nếu trip hoặc price không tồn tại
  }

  // Tính giá sau khi áp dụng chiết khấu
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

    const {t}  = useTranslation();
  const [cardPaymentSelect, setCardPaymentSelect] = useState(
    bookingData.paymentMethod === "CARD" ? true : false
  );
  const [services, setServices] = useState([]);
  const { data: cargoList = [], isLoading, error } = useQuery(["cargoList"], getAllCargos);


  const bookingDate = format(
    parse(bookingDateTime, "yyyy-MM-dd HH:mm", new Date()),
    "dd/MM/yyyy"
  );

  const handleServiceChange = (cargoId, quantity) => {
    setServices(prevServices => {
        const updatedServices = prevServices.filter(service => service.cargoId !== cargoId);
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

  setBookingData((prevData) => {
    const updatedData = {
      ...prevData,
      totalPayment: getBookingPrice(trip) * seatNumber.length + additionalCost,
      cargoRequests: services.map((service) => ({
        cargoId: service.cargoId,
        quantity: service.quantity,
      })),
    };

    console.log("Updated bookingData: ", updatedData); // Kiểm tra dữ liệu cập nhật
    return updatedData;
  });
}, [services, setBookingData, trip, seatNumber.length]);



  return (
    <>
      <Box
        mt="40px"
        display="flex"
        justifyContent="center"
        alignItems="start"
        // gap="20px"
        // maxHeight="500px"
        // overflow="auto"
      >
        {/* booking summary */}
        <Box display="flex" flexDirection="column" gap="10px" width="40%">
          <Typography variant="h3" fontWeight="bold" mb="16px">
            {t("Summary Booking Info")}
          </Typography>
          <Typography component="span" variant="h5">
            <span style={{ fontWeight: "bold" }}>{t("Route")}: </span>
            {`${trip.source.name} ${
              bookingData.bookingType === "ONEWAY" ? `\u21D2` : `\u21CB`
            } ${trip.destination.name}`}
          </Typography>
          <Typography component="span" variant="h5">
            <span style={{ fontWeight: "bold" }}>{t("Coach")}: </span>
            {`${trip.coach.name}, Type: ${trip.coach.coachType}`}
          </Typography>
          <Typography component="span" variant="h5">
            <span style={{ fontWeight: "bold" }}>{t("Datetime")}: </span>{" "}
            {format(
              parse(trip.departureDateTime, "yyyy-MM-dd HH:mm", new Date()),
              "HH:mm dd-MM-yyyy"
            )}
          </Typography>
          <Typography component="span" variant="h5">
            <span style={{ fontWeight: "bold" }}>{t("Total")}: </span>
            {`${formatCurrency(totalPayment)} (${
              seatNumber.length
            } x ${formatCurrency(getBookingPrice(trip))})`}
          </Typography>
          <Typography component="span" variant="h5">
            <span style={{ fontWeight: "bold" }}>{t("Seats")}: </span>
            {seatNumber.join(", ")}
          </Typography>
        </Box>

        {/* Choose Additional Services */}
        <Box width="50%">
          <Typography variant="h5" fontWeight="bold" mb="10px">
            {t("Choose Additional Services")}
          </Typography>

          {/* Dịch vụ hiển thị dưới dạng danh sách có thể cuộn */}
          <Box
            maxHeight="200px"
            overflow="auto"
            display="flex"
            flexDirection="column"
            gap="10px"
            mb="20px"
          >
            {cargoList.map((cargo) => (
    <Card key={cargo.id} variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <Typography style={{ width: "60%" }}>{cargo.name} - {formatCurrency(cargo.basePrice)}</Typography>
        <TextField
            type="number"
            size="small"
            value={services.find(service => service.cargoId === cargo.id)?.quantity || 0}
            onChange={(e) => handleServiceChange(cargo.id, Number(e.target.value))}
            inputProps={{ min: 0 }}
            sx={{ width: "30%" }}
        />
    </Card>
))}

          </Box>

          {/* Tổng tiền thanh toán */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" fontWeight="bold">
            {t("Total Payment")}: {formatCurrency(totalPayment)}
          </Typography>
        </Box>

        <Box
          width="40%"
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        >
          {/* first name */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label={t("Fist Name *")}
            onBlur={handleBlur}
            onChange={(e) => setFieldValue("firstName", e.target.value)}
            value={values.firstName}
            name="firstName"
            error={!!touched.firstName && !!errors.firstName}
            helperText={touched.firstName && errors.firstName}
            sx={{
              gridColumn: "span 2",
            }}
          />

          {/* last name */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label={t("Last Name *")}
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.lastName}
            name="lastName"
            error={!!touched.lastName && !!errors.lastName}
            helperText={touched.lastName && errors.lastName}
            sx={{
              gridColumn: "span 2",
            }}
          />

          {/* phone */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label={t("Phone *")}
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.phone}
            name="phone"
            error={!!touched.phone && !!errors.phone}
            helperText={touched.phone && errors.phone}
            sx={{
              gridColumn: "span 2",
            }}
          />

          {/* email*/}
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
              gridColumn: "span 2",
            }}
          />

          {/* pickup address */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label={t("Pickup Address *")}
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.pickUpAddress}
            name="pickUpAddress"
            error={!!touched.pickUpAddress && !!errors.pickUpAddress}
            helperText={touched.pickUpAddress && errors.pickUpAddress}
            sx={{
              gridColumn: "span 4",
            }}
          />

          {/* payment method */}
          <FormControl
            sx={{
              gridColumn: cardPaymentSelect ? "span 4" : "span 2",
            }}
          >
            <FormLabel color="warning" id="paymentMethod">
              {t("Payment Method")}
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="paymentMethod"
              name="row-radio-buttons-group"
              value={values.paymentMethod}
              onChange={(e) => {
                const paymentMethod = e.target.value;
                setCardPaymentSelect(paymentMethod === "CARD" ? true : false);
                setFieldValue("paymentMethod", paymentMethod);
                setFieldValue("paymentStatus", "PAID");
              }}
            >
              <FormControlLabel
                value="CASH"
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
                label={t("CASH")}
              />
            </RadioGroup>
          </FormControl>

          {/* payment status */}
          <FormControl
            sx={{
              gridColumn: "span 2",
              display: cardPaymentSelect ? "none" : "initial",
            }}
          >
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
                label={t("UNPAID")}
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
                label={t("PAID")}
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </Box>
    </>
  );
};

export default PaymentForm;
