import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, CircularProgress } from "@mui/material";
import { getDriverCoachTripStats } from "../../review/reviewQueries"; // Assuming reviewQueries.js contains the API call

const ReviewReport = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDriverCoachTripStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography>Error loading review report</Typography>;

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        Driver, Coach, and Trip Rating Report
      </Typography>

      {/* Driver Ratings */}
      <Typography variant="h5" gutterBottom>
        Driver Ratings
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(stats.driverRatings).map(([driverId, avgRating]) => (
          <Grid item xs={12} sm={4} key={driverId}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h6">Driver ID: {driverId}</Typography>
              <Typography variant="h6">Average Rating: {avgRating.toFixed(1)}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Coach Ratings */}
      <Typography variant="h5" gutterBottom>
        Coach Ratings
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(stats.coachRatings).map(([coachId, avgRating]) => (
          <Grid item xs={12} sm={4} key={coachId}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h6">Coach ID: {coachId}</Typography>
              <Typography variant="h6">Average Rating: {avgRating.toFixed(1)}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Trip Ratings */}
      <Typography variant="h5" gutterBottom>
        Trip Ratings
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(stats.tripRatings).map(([tripId, avgRating]) => (
          <Grid item xs={12} sm={4} key={tripId}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h6">Trip ID: {tripId}</Typography>
              <Typography variant="h6">Average Rating: {avgRating.toFixed(1)}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReviewReport;
