import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
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
import * as notificationApi from "./notificationQueries";
import { hasPermissionToDoAction } from "../../utils/CrudPermission";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

const Notifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [filtering, setFiltering] = useState("");
  const queryClient = useQueryClient();
  const [openForbiddenModal, setOpenForbiddenModal] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState("");

  // Columns
  const columns = useMemo(
    () => [
      {
        header: "Title",
        accessorKey: "title",
        footer: "Title",
        width: 150,
        maxWidth: 200,
        isEllipsis: true,
      },
      {
        header: "Message",
        accessorKey: "message",
        footer: "Message",
        width: 200,
        maxWidth: 300,
        isEllipsis: true,
      },
      {
        header: "Recipient Identifiers",
        accessorKey: "recipientIdentifiers",
        footer: "Recipient Identifiers",
        width: 180,
        maxWidth: 250,
        isEllipsis: true,
      },
      {
        header: "Recipient Type",
        accessorKey: "recipientType",
        footer: "Recipient Type",
        width: 100,
        maxWidth: 150,
        align: "center",
      },
      {
        header: "Send Date/Time",
        accessorKey: "sendDateTime",
        footer: "Send Date/Time",
        width: 200,
        maxWidth: 250,
        isEllipsis: true,
        align: "center",
        cell: (info) =>
          new Date(info.getValue()).toLocaleString(),
      },
      {
        header: "Action",
        accessorKey: "action",
        footer: "Action",
        width: 120,
        maxWidth: 250,
        align: "center",
        cell: (info) => {
          return (
            <Box>
              <CustomToolTip title="Edit" placement="top">
                <IconButton
                  onClick={() => {
                    handleOpenUpdateForm(info.row.original.id);
                  }}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </CustomToolTip>
              <CustomToolTip title="Delete" placement="top">
                <IconButton
                  onClick={() => {
                    handleOpenDeleteForm(info.row.original.id);
                  }}
                >
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </CustomToolTip>
            </Box>
          );
        },
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

  // Get page of Notifications
  const { data } = useQuery({
    queryKey: ["notifications", pagination],
    queryFn: () => {
      setSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      return notificationApi.getPageOfNotification(
        pagination.pageIndex,
        pagination.pageSize
      );
    },
    keepPreviousData: true,
  });

  const handleOpenAddNewForm = () => {
    navigate("new");
  };

  const handleOpenUpdateForm = (selectedRow) => {
    navigate(`${selectedRow}`);
  };

  const handleOpenDeleteForm = (selectedRow) => {
    setSelectedRow(selectedRow);
    setOpenModal(!openModal);
  };

  const deleteMutation = useMutation({
    mutationFn: (notificationId) => notificationApi.deleteNotification(notificationId),
  });

  // Handle delete Notification
  const handleDeleteNotification = (notificationId) => {
    deleteMutation.mutate(notificationId, {
      onSuccess: () => {
        setOpenModal(!openModal);
        queryClient.invalidateQueries({ queryKey: ["notifications", pagination] });
        handleToast("success", "Notification deleted successfully");
      },
      onError: (error) => {
        handleToast("error", error.response?.data.message);
      },
    });
  };

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
        <Header title="NOTIFICATIONS" subTitle="Notification management" />

        {/*Table search input */}
        <Box
          width="350px"
          height="40px"
          display="flex"
          bgcolor={colors.primary[400]}
          borderRadius="3px"
        >
          <InputBase
            sx={{ ml: 2, flex: 1 }}
            placeholder="Search"
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
          Add new
        </Button>
      </Box>

      {/* Table */}
      <CustomDataTable
        table={table}
        colors={colors}
        totalElements={data?.totalElements}
      />

      {/* MODAL */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(!openModal)}
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
            <WarningRoundedIcon sx={{ color: "#fbc02a", fontSize: "2.5rem", marginRight: "4px" }} />
            Delete Notification&nbsp;
            <span style={{ fontStyle: "italic" }}>{selectedRow} ?</span>
          </Typography>
          <Box sx={{ mt: 3 }} display="flex" justifyContent="space-around">
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={() => handleDeleteNotification(selectedRow)}
            >
              Confirm
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CheckIcon />}
              onClick={() => setOpenModal(!openModal)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Notifications;
