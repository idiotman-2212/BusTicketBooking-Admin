import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CommuteOutlinedIcon from "@mui/icons-material/CommuteOutlined";
import PersonIcon from "@mui/icons-material/Person";

import {
  Box,
  Button,
  IconButton,
  InputBase,
  Modal,
  Typography,
  useTheme,
  Backdrop,
  Fade,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomDataTable from "../../components/CustomDataTable";
import CustomToolTip from "../../components/CustomToolTip";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { handleToast } from "../../utils/helpers";
import { useQueryString } from "../../utils/useQueryString";

import * as userApi from "../user/userQueries";
import * as tripApi from "../trip/tripQueries";
import * as tripLogApi from "./tripLogQueries";

const TripLog = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");

  const [openTripDetailModal, setOpenTripDetailModal] = useState(false);
  const [tripDetails, setTripDetails] = useState(null);

  const [openUserDetailModal, setOpenUserDetailModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const [filtering, setFiltering] = useState("");

  const columns = useMemo(
    () => [
      {
        header: "Trip ID",
        accessorKey: "trip.id",
        footer: "Trip ID",
        width: 100,
        maxWidth: 150,
        isEllipsis: true,
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
        header: "Log Type",
        accessorKey: "logType",
        footer: "Log Type",
        width: 150,
        maxWidth: 200,
        isEllipsis: true,
      },
      {
        header: "Log Time",
        accessorKey: "logTime",
        footer: "Log Time",
        width: 200,
        maxWidth: 250,
        align: "center",
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      },
      {
        header: "Description",
        accessorKey: "description",
        footer: "Description",
        width: 200,
        maxWidth: 300,
        isEllipsis: true,
      },
      {
        header: "Created By",
        accessorKey: "createdBy.username",  // Sử dụng createdBy.username để lấy tên người dùng
        footer: "Created By",
        width: 200,
        maxWidth: 250,
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
        header: "Action",
        accessorKey: "action",
        footer: "Action",
        width: 120,
        maxWidth: 250,
        align: "center",
        cell: (info) => (
          <Box>
            <CustomToolTip title="Edit" placement="top">
              <IconButton onClick={() => handleOpenUpdateForm(info.row.original.id)}>
                <EditOutlinedIcon />
              </IconButton>
            </CustomToolTip>
            <CustomToolTip title="Delete" placement="top">
              <IconButton onClick={() => handleOpenDeleteForm(info.row.original.id)}>
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </CustomToolTip>
          </Box>
        ),
      },
    ],
    []
  );

  const handleOpenTripDetailModal = async (tripId) => {
    try {
      const data = await tripApi.getTrip(tripId);
      setTripDetails(data);
      setOpenTripDetailModal(true);
    } catch (error) {
      console.error("Error fetching trip details:", error);
      handleToast("error", "Không thể tải thông tin chuyến đi.");
    }
  };

  const handleCloseTripDetailModal = () => {
    setOpenTripDetailModal(false);
    setTripDetails(null);
  };

  const handleOpenUserDetailModal = async (username) => {
    try {
      const data = await userApi.getUser(username);
      setUserDetails(data);
      setOpenUserDetailModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      handleToast("error", "Không thể tải thông tin người dùng.");
    }
  };

  const handleCloseUserDetailModal = () => {
    setOpenUserDetailModal(false);
    setUserDetails(null);
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
      handleToast("success", "Xóa nhật ký hành trình thành công");
    },
    onError: (error) => {
      handleToast("error", error.response?.data.message || "Xóa thất bại");
    },
  });

  const handleDeleteTripLog = () => {
    if (!selectedRow) {
      handleToast("error", "Không có nhật ký nào được chọn để xóa");
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tripLogs", pagination],
    queryFn: async () => {
      setSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      return tripLogApi.getPageOfTripLogs(pagination.pageIndex, pagination.pageSize);
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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="TRIP LOGS" subTitle="Quản lý nhật ký hành trình" />

        <Box
          width="350px"
          height="40px"
          display="flex"
          bgcolor={colors.primary[400]}
          borderRadius="3px"
        >
          <InputBase
            sx={{ ml: 2, flex: 1 }}
            placeholder="Tìm kiếm"
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
          />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>

        <Button
          onClick={handleOpenAddNewForm}
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          size="large"
        >
          Thêm mới
        </Button>
      </Box>

      {isLoading ? (
        <Typography>Đang tải dữ liệu...</Typography>
      ) : isError ? (
        <Typography color="error">Có lỗi xảy ra khi tải dữ liệu</Typography>
      ) : (
        <CustomDataTable
          table={table}
          colors={colors}
          totalElements={data?.totalElements}
        />
      )}

      {/* Modal chi tiết Trip */}
      <Modal
        open={openTripDetailModal}
        onClose={handleCloseTripDetailModal}
        aria-labelledby="trip-modal-title"
        aria-describedby="trip-modal-description"
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openTripDetailModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: "10px",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="trip-modal-title" variant="h4" textAlign="center" gutterBottom>
              Chi tiết Trip
            </Typography>
            {tripDetails ? (
              <>
                <Typography>
                  <strong>Điểm nguồn:</strong> {tripDetails.source?.name || "N/A"}
                </Typography>
                <Typography>
                  <strong>Điểm đích:</strong> {tripDetails.destination?.name || "N/A"}
                </Typography>
                <Typography>
                  <strong>Thời gian khởi hành:</strong> {new Date(tripDetails.departureDateTime).toLocaleString()}
                </Typography>
              </>
            ) : (
              <Typography>Không có dữ liệu</Typography>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Modal chi tiết User */}
      <Modal
        open={openUserDetailModal}
        onClose={handleCloseUserDetailModal}
        aria-labelledby="user-modal-title"
        aria-describedby="user-modal-description"
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openUserDetailModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: "10px",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="user-modal-title" variant="h4" textAlign="center" gutterBottom>
              Chi tiết Người Dùng
            </Typography>
            {userDetails ? (
              <>
                <Typography>
                  <strong>Username:</strong> {userDetails.username}
                </Typography>
                <Typography>
                  <strong>First Name:</strong> {userDetails.firstName}
                </Typography>
                <Typography>
                  <strong>Last Name:</strong> {userDetails.lastName}
                </Typography>
              </>
            ) : (
              <Typography>Không có dữ liệu</Typography>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Modal xóa nhật ký hành trình */}
      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openDeleteModal}>
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
              bgcolor: "background.paper",
            }}
          >
            <Typography
              id="delete-modal-title"
              variant="h5"
              textAlign="center"
              display="flex"
              justifyContent="center"
              alignItems="center"
              gutterBottom
            >
              <WarningRoundedIcon
                sx={{ color: "#fbc02a", fontSize: "2.5rem", marginRight: "8px" }}
              />
              Xóa nhật ký hành trình
            </Typography>
            <Typography id="delete-modal-description" sx={{ mt: 2 }} textAlign="center">
              Bạn có chắc chắn muốn xóa nhật ký hành trình với ID: <strong>{selectedRow}</strong>?
            </Typography>
            <Box sx={{ mt: 3 }} display="flex" justifyContent="space-around">
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={handleDeleteTripLog}
              >
                Xác nhận
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseDeleteModal}
              >
                Hủy
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default TripLog;
