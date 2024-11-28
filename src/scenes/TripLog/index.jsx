import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CommuteOutlinedIcon from "@mui/icons-material/CommuteOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import {
  Box,
  Button,
  IconButton,
  InputBase,
  Modal,
  Typography,
  useTheme,
  Stack,
  TextField,
  Skeleton,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomDataTable from "../../components/CustomDataTable";
import CustomToolTip from "../../components/CustomToolTip";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { handleToast } from "../../utils/helpers";
import { useQueryString } from "../../utils/useQueryString";
import { useTranslation } from "react-i18next";

import * as userApi from "../user/userQueries";
import * as tripApi from "../trip/tripQueries";
import * as tripLogApi from "./tripLogQueries";

const TripLog = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");

  const [openTripDetailModal, setOpenTripDetailModal] = useState(false);
  const [tripId, setTripId] = useState(null);

  const [openUserDetailModal, setOpenUserDetailModal] = useState(false);
  const [username, setUsername] = useState(null);

  const [filtering, setFiltering] = useState("");

  // Fetch Trip Details
  const tripQuery = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => tripApi.getTrip(tripId),
    enabled: !!tripId,
  });

  // Fetch User Details
  const userQuery = useQuery({
    queryKey: ["user", username],
    queryFn: () => userApi.getUser(username),
    enabled: !!username,
  });

  const formatLocation = (location) => {
    if (!location) return t("Chưa xác định");

    const { address, ward, district, province } = location;
    return `${address || ""}${ward ? ", " + ward : ""}${district ? ", " + district : ""}${province?.name ? ", " + province.name : ""}`;
  };
  
  const columns = useMemo(
    () => [
      {
        header: t("Trip ID"),
        accessorKey: "trip.id",
        footer: t("Trip ID"),
        width: 100,
        maxWidth: 100,
        isEllipsis: true,
        align: "center",
        cell: (info) => (
          <Box display="flex" alignItems="center">
            <Typography>{info.getValue()}</Typography>
            <IconButton
              onClick={() => handleOpenTripDetailModal(info.getValue())}
              size="small"
              color="primary"
            >
              <CommuteOutlinedIcon />
            </IconButton>
          </Box>
        ),
      },
      {
        header: t("Log Type"),
        accessorKey: "logType",
        footer: t("Log Type"),
        width: 150,
        maxWidth: 200,
        isEllipsis: true,
        align: "center",
      },
      {
        header: t("Log Time"),
        accessorKey: "logTime",
        footer: t("Log Time"),
        width: 200,
        maxWidth: 200,
        align: "center",
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      },
      {
        header: t("Description"),
        accessorKey: "description",
        footer: t("Description"),
        width: 200,
        maxWidth: 300,
        isEllipsis: true,
        align: "center",
      },
      {
        header: t("Created By"),
        accessorKey: "createdBy.username",
        footer: t("Created By"),
        width: 100,
        maxWidth: 100,
        align: "center",
        cell: (info) => (
          <Box display="flex" alignItems="center">
            <Typography>{info.getValue()}</Typography>
            <IconButton
              onClick={() => handleOpenUserDetailModal(info.getValue())}
              size="small"
              color="primary"
            >
              <PersonIcon />
            </IconButton>
          </Box>
        ),
      },
      {
        header: t("Action"),
        accessorKey: "action",
        footer: t("Action"),
        width: 120,
        maxWidth: 250,
        align: "center",
        cell: (info) => (
          <Box>
            <CustomToolTip title={t("Edit")} placement="top">
              <IconButton
                onClick={() => handleOpenUpdateForm(info.row.original.id)}
              >
                <EditOutlinedIcon />
              </IconButton>
            </CustomToolTip>
            {/* <CustomToolTip title={t("Delete")} placement="top">
              <IconButton
                onClick={() => handleOpenDeleteForm(info.row.original.id)}
              >
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </CustomToolTip> */}
          </Box>
        ),
      },
    ],
    [t]
  );

  const handleOpenTripDetailModal = (tripId) => {
    setTripId(tripId);
    setOpenTripDetailModal(true);
  };

  const handleCloseTripDetailModal = () => {
    setOpenTripDetailModal(false);
    setTripId(null);
  };

  const handleOpenUserDetailModal = (username) => {
    setUsername(username);
    setOpenUserDetailModal(true);
  };

  const handleCloseUserDetailModal = () => {
    setOpenUserDetailModal(false);
    setUsername(null);
  };

  const handleOpenAddNewForm = () => {
    navigate("new");
  };

  const handleOpenUpdateForm = (tripLogId) => {
    navigate(`/tripLogs/${tripLogId}`);
  };

  const handleOpenDeleteForm = (tripLogId) => {
    setSelectedRow(tripLogId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedRow("");
  };

  const deleteMutation = useMutation({
    mutationFn: (tripLogId) => tripLogApi.deleteTripLog(tripLogId),
    onSuccess: () => {
      setOpenDeleteModal(false);
      queryClient.invalidateQueries({ queryKey: ["tripLogs"] });
      handleToast("success", t("Delete trip log successfully"));
    },
    onError: (error) => {
      handleToast("error", error.response?.data.message || t("Delete failed"));
    },
  });

  const handleDeleteTripLog = () => {
    if (!selectedRow) {
      handleToast("error", t("No trip log selected for deletion"));
      return;
    }
    deleteMutation.mutate(selectedRow);
  };

  const [queryObj, setSearchParams] = useQueryString();
  const page = Number(queryObj?.page) || 1;
  const limit = Number(queryObj?.limit) || 5;

  const [pagination, setPagination] = useState({
    pageIndex: page - 1,
    pageSize: limit,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["tripLogs", pagination],
    queryFn: async () => {
      setSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      return tripLogApi.getPageOfTripLogs(
        pagination.pageIndex,
        pagination.pageSize
      );
    },
    keepPreviousData: true,
  });

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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t("TRIP LOGS")} subTitle={t("Trip log management")} />

        {/* Search Box */}
        <Box
          width="350px"
          height="40px"
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

        {/* Add New Button */}
        <Button
          onClick={handleOpenAddNewForm}
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          size="large"
        >
          {t("Add new")}
        </Button>
      </Box>

      {/* Data Table */}
      <CustomDataTable
        table={table}
        colors={colors}
        totalElements={data?.totalElements}
      />

      {/* Modal chi tiết Trip */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.primary[400] : "#fff",
          },
        }}
        open={openTripDetailModal}
        onClose={handleCloseTripDetailModal}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: 400,
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box textAlign="center" marginBottom="30px">
            <Typography fontWeight="bold" variant="h4">{t("TRIP DETAIL")}</Typography>
          </Box>
          {tripQuery.isLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="rectangular" width={210} height={60} />
            </Stack>
          ) : (
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Source")}
                value={formatLocation(tripQuery.data?.pickUpLocation) || ""}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Destination")}
                value={formatLocation(tripQuery.data?.dropOffLocation) || ""}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Departure DateTime")}
                value={
                  tripQuery.data
                    ? new Date(
                        tripQuery.data.departureDateTime
                      ).toLocaleString()
                    : "N/A"
                }
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Duration (hour)")}
                value={tripQuery.data?.duration || "N/A"}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Price")}
                value={tripQuery.data?.price || "N/A"}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Coach Type")}
                value={tripQuery.data?.coach?.coachType || "N/A"}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Email")}
                value={tripQuery.data?.driver?.email || "N/A"}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Driver")}
                value={
                  tripQuery.data
                    ? `${tripQuery.data.driver?.firstName} ${tripQuery.data.driver?.lastName}`
                    : "N/A"
                }
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Driver Phone")}
                value={tripQuery.data?.driver?.phone || "N/A"}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
          )}
        </Box>
      </Modal>

      {/* Modal chi tiết User */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.primary[400] : "#fff",
          },
        }}
        open={openUserDetailModal}
        onClose={handleCloseUserDetailModal}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: 400,
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box textAlign="center" marginBottom="30px">
            <Typography fontWeight="bold" variant="h4">{t("USER DETAIL")}</Typography>
          </Box>
          {userQuery.isLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="rectangular" width={210} height={60} />
            </Stack>
          ) : (
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Full Name")}
                value={
                  `${userQuery.data?.firstName} ${userQuery.data?.lastName}` ||
                  "N/A"
                }
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Email"
                value={userQuery.data?.email || "N/A"}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Phone")}
                value={userQuery.data?.phone || "N/A"}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Email")}
                value={userQuery.data?.email || "N/A"}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Address")}
                value={userQuery.data?.address || "N/A"}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Date of Birth")}
                value={
                  userQuery.data?.dob
                    ? new Date(userQuery.data?.dob).toLocaleDateString()
                    : "N/A"
                }
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
          )}
        </Box>
      </Modal>

      {/* Modal xóa nhật ký hành trình */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.blueAccent[700] : "#fff",
          },
        }}
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            id="delete-modal-title"
            variant="h3"
            textAlign="center"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <WarningRoundedIcon
              sx={{ color: "#fbc02a", fontSize: "2.5rem", marginRight: "8px" }}
            />
            {t("Delete Trip Log")}
          </Typography>
          <Typography
            id="delete-modal-description"
            variant="body1"
            textAlign="center"
            sx={{ mt: 2 }}
          >
            {t("Are you sure you want to delete trip log with ID")}{" "}
            <strong>{selectedRow}</strong>?
          </Typography>
          <Box mt={3} display="flex" justifyContent="space-around">
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleDeleteTripLog}
              sx={{ borderRadius: "8px" }}
            >
              {t("Confirm")}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<ClearIcon />}
              onClick={handleCloseDeleteModal}
              sx={{ borderRadius: "8px" }}
            >
              {t("Cancel")}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default TripLog;
