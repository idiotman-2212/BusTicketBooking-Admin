import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';

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
import { useLocation, useNavigate } from "react-router-dom";
import CustomDataTable from "../../components/CustomDataTable";
import CustomToolTip from "../../components/CustomToolTip";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { handleToast } from "../../utils/helpers";
import { useQueryString } from "../../utils/useQueryString";
import * as locationApi from "./locationQueries";
import { hasPermissionToDoAction } from "../../utils/CrudPermission";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const Location = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [filtering, setFiltering] = useState("");
  const [openForbiddenModal, setOpenForbiddenModal] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState("");
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  // Columns
  const columns = useMemo(
    () => [
      {
        header: (
        <>
          <LocationOnIcon sx={{ verticalAlign: "middle", marginRight: "8px" }} />
          {t("Address")}
        </>
      ),
        accessorKey: "address",
        footer: "Address",
        width: 200,
        maxWidth: 300,
        isEllipsis: true,
        align: "center",
      },
      {
        header: (
        <>
          <MapIcon sx={{ verticalAlign: "middle", marginRight: "8px" }} />
          {t("District")}
        </>
      ),
        accessorKey: "district",
        footer: "District",
        width: 150,
        maxWidth: 200,
        isEllipsis: true,
        align: "center",
      },
      {
        header: (
        <>
          <BusinessIcon sx={{ verticalAlign: "middle", marginRight: "8px" }} />
          {t("Ward")}
        </>
      ),
        accessorKey: "ward",
        footer: "Ward",
        width: 150,
        maxWidth: 200,
        isEllipsis: true,
        align: "center",
      },
      {
        header: (
        <>
          <HomeIcon sx={{ verticalAlign: "middle", marginRight: "8px" }} />
          {t("Province")}
        </>
      ),
        accessorFn: (row) => row.province.name, // Truy cập thuộc tính name trong province
        id: "province",
        footer: "Province",
        width: 150,
        maxWidth: 200,
        align: "center",
      },
      {
        header: t("Active"),
        accessorKey: "isActive",
        footer: "Active",
        width: 100,
        maxWidth: 150,
        align: "center",
        cell: (info) =>
          info.getValue() ? (
            <CheckOutlinedIcon sx={{ color: "#00e330" }} /> // Màu xanh cho dấu tick
          ) : (
            <CloseIcon sx={{ color: "#eb0014" }} /> // Màu đỏ cho dấu x
          ),
      },
      {
        header: t("Action"),
        accessorKey: "action",
        footer: "Action",
        width: 120,
        maxWidth: 250,
        align: "center",
        cell: (info) => {
          return (
            <Box>
              <CustomToolTip title={t("Edit")} placement="top">
                <IconButton
                  onClick={() => {
                    handleOpenUpdateForm(info.row.original.id);
                  }}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </CustomToolTip>
              <CustomToolTip title={t("Delete")} placement="top">
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

  // Get page of Locations
  const { data } = useQuery({
    queryKey: ["locations", pagination],
    queryFn: () => {
      setSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      return locationApi.getPageOfLocations(pagination.pageIndex, pagination.pageSize);
    },
    keepPreviousData: true,
  });

  const prefetchAllLocations = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["locations", "all"],
      queryFn: () => locationApi.getAll(),
    });
  };

  const handleOpenAddNewForm = () => {
    const hasAddPermission = hasPermissionToDoAction(
      "CREATE",
      location.pathname
    );
    if (hasAddPermission) navigate("new");
    else {
      setForbiddenMessage(t("You don't have permission to CREATE"));
      setOpenForbiddenModal(!openForbiddenModal);
    }
  };

  const handleOpenUpdateForm = (selectedRow) => {
    const hasUpdatePermission = hasPermissionToDoAction(
      "UPDATE",
      location.pathname
    );

    if (hasUpdatePermission) navigate(`${selectedRow}`);
    else {
      setForbiddenMessage(t("You don't have permission to UPDATE"));
      setOpenForbiddenModal(!openForbiddenModal);
    }
  };

  const handleOpenDeleteForm = (selectedRow) => {
    const hasDeletePermission = hasPermissionToDoAction(
      "DELETE",
      location.pathname
    );
    if (hasDeletePermission) {
      setSelectedRow(selectedRow);
      setOpenModal(!openModal);
    } else {
      setForbiddenMessage(t("You don't have permission to DELETE"));
      setOpenForbiddenModal(!openForbiddenModal);
    }
  };

  // create deleteMutation chưa hiển thị toast(thành công/thất bại)
  const deleteMutation = useMutation({
    mutationFn: (locationId) => locationApi.deleteLocation(locationId),
  });

  // Handle delete Location
  const handleDeleteLocation = (locationId) => {
    deleteMutation.mutate(locationId, {
      onSuccess: (data) => {
        setOpenModal(!openModal);
        queryClient.invalidateQueries({ queryKey: ["locations", pagination] });
        queryClient.removeQueries({ queryKey: ["locations"], type: "inactive" });
        handleToast("success", data);
      },
      onError: (error) => {
        console.log("Delete Location ", error);
        handleToast("error", error.response?.data.message);
      },
    });
  };

  const table = useReactTable({
    data: data?.dataList ?? [], // if data is not available, provide empty dataList []
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
        <Header title={t("LOCATIONS")} subTitle={t("Location management")} />
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
            placeholder={t("Search")}
            value={filtering}
            onMouseEnter={async () => await prefetchAllLocations()}
            onClick={() => {
              table.setPageSize(data?.totalElements);
            }}
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

      {/* Table */}
      <CustomDataTable
        table={table}
        colors={colors}
        totalElements={data?.totalElements}
      />

      {/* MODAL */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.blueAccent[700] : "#fff",
          },
        }}
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
            <WarningRoundedIcon
              sx={{ color: "#fbc02a", fontSize: "2.5rem", marginRight: "4px" }}
            />{" "}
            {t("Delete Location")}&nbsp;
            <span
              style={{
                fontStyle: "italic",
              }}
            >
              {selectedRow} ?
            </span>
          </Typography>
          <Box
            id="modal-modal-description"
            sx={{ mt: 3 }}
            display="flex"
            justifyContent="space-around"
          >
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={() => handleDeleteLocation(selectedRow)}
            >
              {t("Confirm")}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<ClearIcon />}
              onClick={() => setOpenModal(!openModal)}
            >
              {t("Cancel")}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* FORBIDDEN MODAL */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.blueAccent[700] : "#fff",
          },
        }}
        open={openForbiddenModal}
        onClose={() => setOpenForbiddenModal(!openForbiddenModal)}
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
            variant="h4"
            textAlign="center"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <WarningRoundedIcon
              sx={{ color: "#fbc02a", fontSize: "2.5rem", marginRight: "4px" }}
            />
            {forbiddenMessage}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default Location;
