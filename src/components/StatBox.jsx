import { Box, Typography, useTheme } from "@mui/material";
import React from "react";
import { tokens } from "../theme";

const StatBox = ({ icon, value, content }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" gap="40px">
      <Box color={colors.greenAccent[600]}>{icon}</Box>
      <Box>
        <Typography variant="h4" color={colors.greenAccent[600]}>
          {content}
        </Typography>
        <Typography mt="10px" variant="h4" color={colors.grey[100]}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
