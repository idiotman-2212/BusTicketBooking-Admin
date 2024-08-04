import SquareIcon from "@mui/icons-material/Square";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React, { memo, useCallback, useMemo, useState } from "react";
import Bed_Limousine_Seat_Data from "../SeatModels/Bed_Limousine_Seat_Data";
import SeatModel from "../SeatModels/SeatModel";
import * as bookingApi from "../../../ticket/ticketQueries";

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
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    field;
  const [seatData, setSeatData] = useState(Bed_Limousine_Seat_Data);
  const [selectedSeats, setSelectedSeats] = useState(bookingData.seatNumber);
  const [numberOfSelectedSeats, setNumberOfSelectedSeats] = useState(
    bookingData.seatNumber.length
  );
  const coachType = bookingData.trip.coach.coachType;
  const price = getBookingPrice(bookingData.trip);

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

  const handleSeatChoose = useCallback(
    (seatNumber, STAIR, isSelected, isOrdered) => {
      // if chosen seat is ordered then do nothing
      if (isOrdered) return;

      // max seat select
      if (isSelected && numberOfSelectedSeats === MAX_SEAT_SELECT) return;

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

      // mapping and update state
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
      setSeatData(newValues);
      setFieldValue("seatNumber", newSelectedSeats);
      setFieldValue("totalPayment", newSelectedSeats.length * price);
    },
    [seatData]
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
      overflow="auto"
      height="400px"
    >
      {/* render seat tip */}
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
          <Typography fontWeight="bold">Ordered</Typography>
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
          <Typography fontWeight="bold">Empty</Typography>
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
          <Typography fontWeight="bold">Choosing</Typography>
        </Box>
      </Box>

      {/* Render seats */}
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
            // gap="4px"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
          >
            {Object.entries(seatData[stair]).map((values) => {
              return (
                <SeatModel
                  key={values[0]}
                  handleSeatChoose={memoizedHandleSeatChoose}
                  seat={values[1]}
                  selectedSeats={selectedSeats}
                  orderedSeats={orderedSeats}
                  coachType={coachType}
                />
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Render additional information */}
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
            Total: {formatCurrency(price * numberOfSelectedSeats)}
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(CoachModel);
