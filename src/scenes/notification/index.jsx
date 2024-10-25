import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Modal,
  Typography,
  useTheme,
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
import * as notificationApi from "./notificationQueries";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { useTranslation } from "react-i18next";

const Notifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [filtering, setFiltering] = useState("");
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Cấu trúc cột cho bảng thông báo
  const columns = useMemo(
    () => [
      {
        header: t("Title"),
        accessorKey: "title",
        footer: "Title",
        width: 150,
        maxWidth: 200,
        isEllipsis: true,
        align: "center",
      },
      {
        header: t("Message"),
        accessorKey: "message",
        footer: "Message",
        width: 200,
        maxWidth: 300,
        isEllipsis: true,
        align: "center",
      },
      {
        header: t("Recipient Identifiers"),
        accessorKey: "recipientIdentifiers",
        footer: "Recipient Identifiers",
        width: 180,
        maxWidth: 250,
        isEllipsis: true,
        align: "center",
        filterFn: (row, columnId, filterValue) => {
          const recipientIds = Array.isArray(row.original.recipientIdentifiers)
            ? row.original.recipientIdentifiers
            : row.original.recipientIdentifiers.split(',').map(id => id.trim()); // Tách chuỗi và loại bỏ khoảng trắng
          return recipientIds.some(id => id.includes(filterValue));
        },
      },
      {
        header: t("Recipient Type"),
        accessorKey: "recipientType",
        footer: "Recipient Type",
        width: 100,
        maxWidth: 150,
        align: "center",
        filterFn: 'includesString',
        //filterFn: 'equalsString',
      },
      {
        header: t("Send Date/Time"),
        accessorKey: "sendDateTime",
        footer: "Send Date/Time",
        width: 200,
        maxWidth: 250,
        isEllipsis: true,
        align: "center",
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      },
      {
        header: t("Action"),
        accessorKey: "action",
        footer: "Action",
        width: 120,
        maxWidth: 250,
        align: "center",
        cell: (info) => (
          <Box>
            <CustomToolTip title={t("Edit")} placement="top">
              <IconButton onClick={() => handleOpenUpdateForm(info.row.original.id)}>
                <EditOutlinedIcon />
              </IconButton>
            </CustomToolTip>
            <CustomToolTip title={t("Delete")} placement="top">
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

  const [queryObj, setSearchParams] = useQueryString();
  const page = Number(queryObj?.page) || 1;
  const limit = Number(queryObj?.limit) || 5;

  const [pagination, setPagination] = useState({
    pageIndex: page - 1,
    pageSize: limit,
  });

  // Get page of Users
  const { data } = useQuery({
    queryKey: ["notifications", pagination],
    queryFn: () => {
      setSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      return notificationApi.getPageOfNotification(pagination.pageIndex, pagination.pageSize);
    },
    keepPreviousData: true,
  });

  const prefetchAllNotifications = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["notifications", "all"],
      queryFn: () => notificationApi.getAll(),
    });
  };


  // Điều hướng tới form tạo mới thông báo
  const handleOpenAddNewForm = () => {
    navigate("new");
  };

  // Điều hướng tới form chỉnh sửa thông báo
  const handleOpenUpdateForm = (notificationId) => {
    navigate(`/notifications/edit/${notificationId}`);
  };

  // Mở modal xóa thông báo
  const handleOpenDeleteForm = (notificationId) => {
    setSelectedRow(notificationId);
    setOpenModal(true);
  };

  // Mutation xóa thông báo
  const deleteMutation = useMutation({
    mutationFn: (notificationId) => notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      setOpenModal(false);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      handleToast("success", "Notification deleted successfully");
    },
    onError: (error) => {
      handleToast("error", error.response?.data.message || "Delete failed");
    },
  });

  const handleDeleteNotification = () => {
    deleteMutation.mutate(selectedRow);
  };

  // Cấu hình bảng thông báo
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
        <Header title={t("Notifications")} subTitle={t("Notification management")} />

        {/* Ô tìm kiếm trong bảng */}
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

      {/* Bảng thông báo */}
      <CustomDataTable
        table={table}
        colors={colors}
        totalElements={data?.totalElements}
      />

      {/* Modal xóa thông báo */}
      <Modal
      sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.blueAccent[700] : "#fff",
          },
        }}
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
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
            id="modal-modal-title"
            variant="h3"
            textAlign="center"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <WarningRoundedIcon
              sx={{ color: "#fbc02a", fontSize: "2.5rem", marginRight: "4px" }}
            />
            {t("Delete Notification")}&nbsp;
            <span style={{ fontStyle: "italic" }}>{selectedRow}?</span>
          </Typography>
          <Box sx={{ mt: 3 }} display="flex" justifyContent="space-around">
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleDeleteNotification}
            >
              {t("Confirm")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenModal(false)}
            >
              {t("Cancel")}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Notifications;
