import SquareIcon from "@mui/icons-material/Square";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React, { memo, useCallback, useMemo, useState } from "react";
import Bed_Limousine_Seat_Data from "../SeatModels/Bed_Limousine_Seat_Data";
import SeatModel from "../SeatModels/SeatModel";
import * as bookingApi from "../../../ticket/ticketQueries";
import { useTranslation } from "react-i18next";

const MAX_SEAT_SELECT = 5;

const getBookingPrice = (trip) => {
  let finalPrice = trip.price;
  if (!isNaN(trip?.discount?.amount)) {
    finalPrice -= trip.discount.amount;
  }
  return finalPrice;
};

const CoachModel = (props) => {
  const { field, setActiveStep, bookingData, setBookingData } = props;
  const { setFieldValue } = field;
  
  // Quản lý trạng thái ghế đã chọn và số ghế
  const [selectedSeats, setSelectedSeats] = useState(bookingData.seatNumber);
  const [numberOfSelectedSeats, setNumberOfSelectedSeats] = useState(
    bookingData.seatNumber.length
  );

  // Loại xe và sức chứa động
  const coachType = bookingData.trip.coach.coachType;
  const capacity = bookingData.trip.coach.capacity; // Sức chứa của xe

  // Giá vé cuối cùng
  const price = getBookingPrice(bookingData.trip);
  const { t } = useTranslation();

  // Lấy dữ liệu ghế ngồi động từ `Bed_Limousine_Seat_Data`
  const seatData = useMemo(() => {
    if (Bed_Limousine_Seat_Data[coachType]) {
      return Bed_Limousine_Seat_Data[coachType](capacity); // Dữ liệu ghế ngồi động dựa trên sức chứa
    }
    return {};
  }, [coachType, capacity]);

  // Lấy thông tin ghế đã đặt
  const seatBookingQuery = useQuery({
    queryKey: ["bookings", bookingData.trip.id, bookingData.bookingDateTime],
    queryFn: () =>
      bookingApi.getSeatBooking(
        bookingData.trip.id,
        bookingData.bookingDateTime
      ),
  });

  const handleSeatOrdered = (orderedBookings) => {
    const orderedSeats = [];
    if (orderedBookings?.length === 0) return orderedSeats;
    orderedBookings.forEach((ordered) => {
      orderedSeats.push(ordered.seatNumber);
    });
    return orderedSeats;
  };

  const orderedSeats = handleSeatOrdered(seatBookingQuery?.data ?? []);

  // Cập nhật trạng thái khi ghế được chọn hoặc bỏ chọn
  const handleSeatChoose = useCallback(
    (seatNumber, STAIR, isSelected, isOrdered) => {
      if (isOrdered) return; // Nếu ghế đã đặt thì không thể chọn
      if (isSelected && numberOfSelectedSeats === MAX_SEAT_SELECT) return; // Giới hạn số ghế

      let newSelectedSeats = [...selectedSeats];

      if (isSelected) {
        newSelectedSeats.push(seatNumber);
        setSelectedSeats(newSelectedSeats);
        setNumberOfSelectedSeats(numberOfSelectedSeats + 1);
      } else {
        newSelectedSeats = newSelectedSeats.filter(
          (seat) => seat !== seatNumber
        );
        setSelectedSeats(newSelectedSeats);
        setNumberOfSelectedSeats(numberOfSelectedSeats - 1);
      }

      // Cập nhật trạng thái ghế trong seatData
      const newValues = {
        ...seatData,
        [STAIR]: {
          ...seatData[STAIR],
          [seatNumber]: {
            ...seatData[STAIR][seatNumber],
            choose: isSelected,
          },
        },
      };
      setFieldValue("seatNumber", newSelectedSeats);
      setFieldValue("totalPayment", newSelectedSeats.length * price);
    },
    [seatData, selectedSeats, numberOfSelectedSeats, price, setFieldValue]
  );

  const memoizedHandleSeatChoose = useMemo(
    () => handleSeatChoose,
    [handleSeatChoose]
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="space-evenly"
      alignItems="center"
      height="400px"
    >
      {/* Render trạng thái ghế */}
      <Box
        mt="30px"
        gap="35px"
        display="flex"
        justifyContent="center"
        flexDirection="column"
      >
        <Box textAlign="center">
          <SquareIcon
            sx={{
              borderRadius: "20px",
              width: "35px",
              height: "35px",
              color: "#000",
            }}
          />
          <Typography fontWeight="bold">{t("Ordered")}</Typography>
        </Box>
        <Box textAlign="center">
          <SquareIcon
            sx={{
              borderRadius: "20px",
              width: "35px",
              height: "35px",
              color: "#979797",
            }}
          />
          <Typography fontWeight="bold">{t("Empty")}</Typography>
        </Box>
        <Box textAlign="center">
          <SquareIcon
            sx={{
              borderRadius: "20px",
              width: "35px",
              height: "35px",
              color: "#ff4138",
            }}
          />
          <Typography fontWeight="bold">{t("Choosing")}</Typography>
        </Box>
      </Box>

      {/* Render ghế ngồi */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="100px"
      >
        {Object.keys(seatData).map((stair, index) => (
          <Box
            key={index}
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))" // Hiển thị 3 ghế trên mỗi hàng
          >
            {Object.entries(seatData[stair]).map(([seatNumber, seat]) => (
              <SeatModel
                key={seatNumber}
                handleSeatChoose={memoizedHandleSeatChoose}
                seat={seat}
                selectedSeats={selectedSeats}
                orderedSeats={orderedSeats}
                coachType={coachType}
              />
            ))}
          </Box>
        ))}
      </Box>

      {/* Render thông tin bổ sung */}
      <Box
        gap="35px"
        display="flex"
        justifyContent="center"
        flexDirection="column"
      >
        <Typography variant="h5">
          <span style={{ fontWeight: "bold" }}>
            Selected: {numberOfSelectedSeats} / {MAX_SEAT_SELECT} seats
          </span>
        </Typography>
        <Typography variant="h5">
          <span style={{ fontWeight: "bold" }}>
            {t("Total")}: {formatCurrency(price * numberOfSelectedSeats)}
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(CoachModel);
