import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Box, Typography } from "@mui/material";
import React, { memo } from "react";

const SeatModel = (props) => {
  const { seat, handleSeatChoose, coachType, selectedSeats, orderedSeats } =
    props;
  const { name, choose } = seat;
  const isOrdered = orderedSeats.includes(name);
  const isChosen = selectedSeats.includes(name);

  const getSeatStateColor = () => {
    if (!isOrdered) {
      if (!isChosen) return "#979797"; // grey
      else return "#ff4138"; // red
    }
  };

  return (
    <Box
      component="div"
      position="relative"
      display={
        (name === "A18" || name === "B18") &&
        (coachType === "LIMOUSINE" || coachType === "BED")
          ? "none"
          : "initial"
      }
      sx={{
        cursor: isOrdered ? "not-allowed" : "pointer",
        color: getSeatStateColor,
        gridColumn:
          (name === "A1" || name === "B1") &&
          (coachType === "LIMOUSINE" || coachType === "BED")
            ? "span 2"
            : undefined,
      }}
      width="60px"
      height="60px"
    >
      <InboxOutlinedIcon
        onClick={() => {
          handleSeatChoose(
            name,
            name.startsWith("A") ? "DOWN_STAIR" : "UP_STAIR",
            !isChosen,
            isOrdered
          );
        }}
        sx={{ width: "100%", height: "100%" }}
      />
      <Typography
        position="absolute"
        top="40%"
        left="50%"
        zIndex={-1}
        fontWeight="bold"
        sx={{
          transform: "translate(-50%, -50%)",
        }}
      >
        {name}
      </Typography>
    </Box>
  );
};

export default memo(SeatModel);
