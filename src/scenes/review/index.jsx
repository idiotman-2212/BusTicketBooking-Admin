import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import CommuteOutlinedIcon from "@mui/icons-material/CommuteOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  Box,
  IconButton,
  InputBase,
  Modal,
  TextField,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import CustomDataTable from "../../components/CustomDataTable";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import * as reviewApi from "../review/reviewQueries";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Review = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedRow, setSelectedRow] = useState("");
  const [filtering, setFiltering] = useState("");
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openTripModal, setOpenTripModal] = useState(false);

  // Fetch all reviews
  const { data } = useQuery({
    queryKey: ["reviews"],
    queryFn: reviewApi.getAll, // API to fetch all reviews
  });

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarIcon key={i} sx={{ color: "#FFD700" }} />
        ) : (
          <StarBorderIcon key={i} sx={{ color: "#FFD700" }} />
        )
      );
    }
    return stars;
  };

  // Define columns for reviews
  const columns = useMemo(
    () => [
      {
        header: t("User"),
        accessorKey: "user.username",
        footer: "User",
        width: 100,
        maxWidth: 100,
        cell: (info) => {
          const { user } = info.row.original;
          return (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-around"
            >
              {user?.username || t("Unknown User")}
              <IconButton
                onClick={() => {
                  setSelectedRow(info.row.original.id);
                  setOpenUserModal(true); // Open user modal
                }}
              >
                <PersonIcon />
              </IconButton>
            </Box>
          );
        },
      },
      {
        header: t("Driver Rating"),
        accessorKey: "driverRating",
        footer: "Driver Rating",
        width: 100,
        maxWidth: 100,
        align: "center",
        cell: (info) => (
          <Box display="flex" justifyContent="center">
            {renderStars(info.getValue())} {/* Display driver rating stars */}
          </Box>
        ),
      },
      {
        header: t("Coach Rating"),
        accessorKey: "coachRating",
        footer: "Coach Rating",
        width: 100,
        maxWidth: 100,
        align: "center",
        cell: (info) => (
          <Box display="flex" justifyContent="center">
            {renderStars(info.getValue())} {/* Display coach rating stars */}
          </Box>
        ),
      },
      {
        header: t("Trip Rating"),
        accessorKey: "tripRating",
        footer: "Trip Rating",
        width: 100,
        maxWidth: 100,
        align: "center",
        cell: (info) => (
          <Box display="flex" justifyContent="center">
            {renderStars(info.getValue())} {/* Display trip rating stars */}
          </Box>
        ),
      },
      {
        header: t("Trip"),
        accessorKey: "trip.source.name",
        footer: "Trip",
        width: 200,
        maxWidth: 250,
        cell: (info) => {
          const { trip } = info.row.original;
          return (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-around"
            >
              {trip?.source?.name} ➔ {trip?.destination?.name}
              <IconButton
                onClick={() => {
                  setSelectedRow(info.row.original.id);
                  setOpenTripModal(true); // Open booking modal
                }}
              >
                <CommuteOutlinedIcon />
              </IconButton>
            </Box>
          );
        },
      },
      {
        header: t("Comment"),
        accessorKey: "comment",
        footer: "Comment",
        width: 300,
        maxWidth: 300,
        align: "center",
        cell: (info) => info.getValue(),
      },
      {
        header: t("Review Date"),
        accessorKey: "createdAt",
        footer: "Review Date",
        width: 100,
        maxWidth: 100,
        align: "center",
        cell: (info) => info.getValue(),
      },
    ],
    []
  );

  const handleCloseUserModal = () => setOpenUserModal(false);
  const handleCloseTripModal = () => setOpenTripModal(false);

  // Set up react-table with data and columns
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: filtering },
    onGlobalFilterChange: setFiltering,
  });

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t("Reviews")} subTitle={t("Manage all reviews")} />

        {/* Search input */}
        <Box
          width="350px"
          display="flex"
          bgcolor={colors.primary[400]}
          borderRadius="3px"
        >
          <InputBase
            sx={{ ml: 2, flex: 1 }}
            placeholder={t("Search")}
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
          />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>

        {/* <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("report")}
        >
          Xem báo cáo
        </Button> */}
      </Box>

      {/* Review Table */}
      <CustomDataTable table={table} colors={colors} />

      {/* User Modal */}
      <Modal open={openUserModal} onClose={handleCloseUserModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h5">{t("User Details")}</Typography>
          {selectedRow && (
            <>
              <TextField
                label="First Name"
                value={data.find((r) => r.id === selectedRow)?.user.firstName}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Last Name"
                value={data.find((r) => r.id === selectedRow)?.user.lastName}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                value={data.find((r) => r.id === selectedRow)?.user.email}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Phone"
                value={data.find((r) => r.id === selectedRow)?.user.phone}
                fullWidth
                margin="normal"
              />
            </>
          )}
        </Box>
      </Modal>

      {/* Trip Modal */}
      <Modal open={openTripModal} onClose={handleCloseTripModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h5">{t("Trip Details")}</Typography>
          {selectedRow && (
            <>
              <TextField
                label="Source"
                value={data.find((r) => r.id === selectedRow)?.trip.source.name}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Destination"
                value={
                  data.find((r) => r.id === selectedRow)?.trip.destination.name
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Driver Name"
                value={`${
                  data.find((r) => r.id === selectedRow)?.trip.driver.firstName
                } ${
                  data.find((r) => r.id === selectedRow)?.trip.driver.lastName
                }`}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Coach Name"
                value={data.find((r) => r.id === selectedRow)?.trip.coach.name}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Departure Time"
                value={
                  data.find((r) => r.id === selectedRow)?.trip.departureDateTime
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Completed"
                value={
                  data.find((r) => r.id === selectedRow)?.trip.completed
                    ? "Yes"
                    : "No"
                }
                fullWidth
                margin="normal"
              />
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Review;
