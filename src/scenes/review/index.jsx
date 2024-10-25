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
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQueryString } from "../../utils/useQueryString"; // Import useQueryString

const Review = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedRow, setSelectedRow] = useState("");
  const [filtering, setFiltering] = useState("");
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openTripModal, setOpenTripModal] = useState(false);

  const [queryObj, setSearchParams] = useQueryString();
  const page = Number(queryObj?.page) || 1; // Trang mặc định là 1
  const limit = Number(queryObj?.limit) || 5; // Số mục mặc định là 5

  const [pagination, setPagination] = useState({
    pageIndex: page - 1,
    pageSize: limit,
  });

  // Fetch all reviews
  const { data } = useQuery({
    queryKey: ["reviews", pagination],
    queryFn: () => {
      setSearchParams({ page: pagination.pageIndex + 1, limit: pagination.pageSize });
      return reviewApi.getPageOfReviews(pagination.pageIndex, pagination.pageSize);
    },
    keepPreviousData: true, // Giữ dữ liệu trước đó trong khi tải dữ liệu mới
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

  const formatLocation = (location) => {
    if (!location) return t("Chưa xác định");

    const { address, ward, district, province } = location;
    return `${address || ""}${ward ? ", " + ward : ""}${district ? ", " + district : ""}${province?.name ? ", " + province.name : ""}`;
  };

  // Define columns for reviews
  const columns = useMemo(
    () => [
      {
        header: t("Customer"),
        accessorKey: "user.username",
        footer: "User",
        width: 100,
        maxWidth: 100,
        cell: (info) => {
          const { user } = info.row.original;
          return (
            <Box display="flex" alignItems="center" justifyContent="space-around">
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
            <Box display="flex" alignItems="center" justifyContent="space-around">
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

  // Khai báo userDetail và tripDetail
  const userDetail = selectedRow
    ? data?.dataList?.find((r) => r.id === selectedRow)?.user
    : null;

  const tripDetail = selectedRow
    ? data?.dataList?.find((r) => r.id === selectedRow)?.trip
    : null;

  // Set up react-table with data and columns
  const table = useReactTable({
    data: data?.dataList ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    pageCount: data?.pageCount ?? -1,
    state: {
      pagination,
      globalFilter: filtering,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setFiltering,
    manualPagination: true,
  });

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t("Reviews")} subTitle={t("Manage all reviews")} />

        {/* Search input */}
        <Box width="350px" display="flex" bgcolor={colors.primary[400]} borderRadius="3px">
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
      </Box>

      {/* Review Table */}
      <CustomDataTable table={table} colors={colors} />

      {/* User Modal */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor: theme.palette.mode === "dark" ? colors.primary[400] : "#fff",
          },
        }}
        open={openUserModal}
        onClose={handleCloseUserModal}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography textAlign="center" variant="h4">
            {t("USER DETAIL")}
          </Typography>
          {userDetail && (
            <>
              <TextField
                label={t("First Name")}
                value={userDetail.firstName || ""}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("Last Name")}
                value={userDetail.lastName || ""}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                value={userDetail.email || ""}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("Phone")}
                value={userDetail.phone || ""}
                fullWidth
                margin="normal"
              />
            </>
          )}
        </Box>
      </Modal>

      {/* Trip Modal */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor: theme.palette.mode === "dark" ? colors.primary[400] : "#fff",
          },
        }}
        open={openTripModal}
        onClose={handleCloseTripModal}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            border: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h5">{t("TRIP DETAIL")}</Typography>
          {tripDetail && (
            <>
              <TextField
                label={t("From")}
                value={formatLocation(tripDetail?.pickUpLocation) || ""}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("To")}
                value={formatLocation(tripDetail?.dropOffLocation) || ""}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("Driver Name")}
                value={`${tripDetail?.driver?.firstName || ""} ${tripDetail?.driver?.lastName || ""}`}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("Coach Name")}
                value={tripDetail?.coach?.name || ""}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("Departure DateTime")}
                value={tripDetail?.departure_date_time || ""}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("Completed")}
                value={tripDetail?.completed ? "Yes" : "No"}
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
