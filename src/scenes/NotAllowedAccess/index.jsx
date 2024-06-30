import { Box, Typography, useTheme } from "@mui/material";
import React from "react";
import LockPersonOutlinedIcon from "@mui/icons-material/LockPersonOutlined";
import { tokens } from "../../theme";

const NotAllowedAccess = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="500px"
    >
      <Box
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        <LockPersonOutlinedIcon sx={{ width: "150px", height: "150px" }} />
        <Typography mt="20px" variant="h3">
          You don't have permission to READ
        </Typography>
      </Box>
    </Box>
  );
};

export default NotAllowedAccess;
