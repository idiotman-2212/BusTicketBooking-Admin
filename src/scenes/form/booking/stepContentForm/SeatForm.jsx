import { Box, Typography } from "@mui/material";
import { format, parse } from "date-fns";
import React from "react";
import CoachModel from "../SeatModels/CoachModel";
import { useTranslation } from "react-i18next";

const SeatForm = ({ field, setActiveStep, bookingData, setBookingData }) => {
  const { bookingDateTime, trip } = bookingData;
  const { t } = useTranslation();

  // Hàm tính giá vé cuối cùng (có áp dụng mã giảm giá nếu có)
  const getBookingPriceString = (trip) => {
    let finalPrice = trip.price;
    if (!isNaN(trip?.discount?.amount)) {
      finalPrice -= trip.discount.amount;
    }
    // Định dạng tiền tệ
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(finalPrice);
  };

  return (
    <>
      {/* Thông tin tóm tắt về chuyến đi */}
      <Box mt="10px" textAlign="center">
        <Typography component="span" variant="h5">
          <span style={{ fontWeight: "bold" }}>{t("Route")}: </span>
          {`${trip.source.name} ${
            bookingData.bookingType === "ONEWAY" ? `\u21D2` : `\u21CB`
          } ${trip.destination.name}`}
        </Typography>
        <Typography component="span" variant="h5">
          , <span style={{ fontWeight: "bold" }}>{t("Datetime")}: </span>{" "}
          {format(
            parse(trip.departureDateTime, "yyyy-MM-dd HH:mm", new Date()),
            "HH:mm dd-MM-yyyy"
          )}
        </Typography>
        <Typography component="span" variant="h5">
          , <span style={{ fontWeight: "bold" }}>{t("Coach")}: </span>
          {`${trip.coach.name}, Type: ${trip.coach.coachType}`}
        </Typography>
        <Typography component="span" variant="h5">
          , <span style={{ fontWeight: "bold" }}>{t("Price")}: </span>
          {getBookingPriceString(trip)}
        </Typography>
      </Box>

      {/* Chọn ghế */}
      <Box mt="30px">
        <CoachModel
          field={field}
          setActiveStep={setActiveStep}
          bookingData={bookingData}
          setBookingData={setBookingData}
        />
      </Box>
    </>
  );
};

export default SeatForm;
