import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Modal,
  Typography,
  useTheme,
  Divider,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CustomDataTable from "../../components/CustomDataTable";
import CustomToolTip from "../../components/CustomToolTip";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { handleToast } from "../../utils/helpers";
import { useQueryString } from "../../utils/useQueryString";
import * as tripApi from "./tripQueries";
import { hasPermissionToDoAction } from "../../utils/CrudPermission";
import { parse, format } from "date-fns";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const Trip = () => {
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

  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationType, setLocationType] = useState("");

  const queryClient = useQueryClient();

  const formatLocation = (location) => {
    if (!location) return t("Chưa xác định");

    const { address, ward, district, province } = location;
    return `${address || ""}${ward ? ", " + ward : ""}${
      district ? ", " + district : ""
    }${province?.name ? ", " + province.name : ""}`;
  };

   const handleOpenLocationModal = (type, info) => {
    const location = type === "source" ? info.pickUpLocation : info.dropOffLocation;
    setSelectedLocation(location);
    setLocationType(type);
    setOpenLocationModal(true);
  };

  // Columns
  const columns = useMemo(
    () => [
      {
        header: t("Coach"),
        accessorKey: "coach",
        footer: "Coach",
        width: 120,
        maxWidth: 150,
        isEllipsis: true,
        align: "center",
        cell: (info) => {
          const { name, coachType } = info.getValue();
          return `${name} (${coachType})`;
        },
      },
      {
        header: t("Source"),
        accessorKey: "source",
        footer: "Source",
        width: 200,
        maxWidth: 150,
        isEllipsis: true,
        align: "center",
        cell: (info) => {
          const { name } = info.getValue();
          return (
            <>
              {name}
              <IconButton
                onClick={() => handleOpenLocationModal("source", info.row.original)}
                aria-label="source location"
              >
                <LocationOnIcon color="primary" />
              </IconButton>
            </>
          );
        },
      },
      {
        header: t("Destination"),
        accessorKey: "destination",
        footer: "Destination",
        width: 150,
        maxWidth: 150,
        isEllipsis: true,
        align: "center",
        cell: (info) => {
          const { name } = info.getValue();
          return (
            <>
              {name}
              <IconButton
                onClick={() => handleOpenLocationModal("destination", info.row.original)}
                aria-label="destination location"
              >
                <LocationOnIcon color="primary" />
              </IconButton>
            </>
          );
        },
      },
      {
        header: t("Price"),
        accessorKey: "price",
        footer: "Price",
        width: 70,
        maxWidth: 150,
        align: "center",
      },
      {
        header: t("Departure DateTime"),
        accessorKey: "departureDateTime",
        footer: "Departure Time",
        width: 150,
        maxWidth: 150,
        align: "center",
        cell: (info) => {
          return format(
            parse(info.getValue(), "yyyy-MM-dd HH:mm", new Date()),
            "HH:mm dd-MM-yyyy"
          );
        },
      },
      {
        header: t("Driver Name"),
        accessorFn: (row) => row.driver.fullName, // Truy cập thuộc tính fullName trong driver
        footer: "Driver Name",
        width: 150,
        maxWidth: 150,
        align: "center",
      },
      {
        header: t("Completed"),
        accessorKey: "completed",
        footer: "Completed",
        width: 50,
        maxWidth: 50,
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
        width: 100,
        maxWidth: 200,
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

  // Get page of Users
  const { data } = useQuery({
    queryKey: ["trips", pagination],
    queryFn: () => {
      setSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      return tripApi.getPageOfTrips(pagination.pageIndex, pagination.pageSize);
    },
    keepPreviousData: true,
  });

  const prefetchAllTrips = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["trips", "all"],
      queryFn: () => tripApi.getAll(),
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
    mutationFn: (tripId) => tripApi.deleteTrip(tripId),
  });

  // Handle delete Coach
  const handleDeleteTrip = (tripId) => {
    deleteMutation.mutate(tripId, {
      onSuccess: (data) => {
        setOpenModal(!openModal);
        queryClient.invalidateQueries({ queryKey: ["trips", pagination] });
        queryClient.removeQueries({ queryKey: ["trips"], type: "inactive" });
        handleToast("success", data);
      },
      onError: (error) => {
        console.log("Delete Trip ", error);
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
        <Header title={t("TRIPS")} subTitle={t("Trip management")} />
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
            onMouseEnter={async () => await prefetchAllTrips()}
            onClick={() => {
              table.setPageSize(data?.totalElements);
            }}
            onChange={(e) => setFiltering(e.target.value)}
          />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>
        {/* <Link to="new" style={{ alignSelf: "end", marginBottom: "30px" }}> */}
        <Button
          onClick={handleOpenAddNewForm}
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          size="large"
        >
          {t("Add new")}
        </Button>
        {/* </Link> */}
      </Box>

      {/* Table */}
      <CustomDataTable
        table={table}
        colors={colors}
        totalElements={data?.totalElements}
      />
      {/* Location Modal */}
      <Modal
      sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.blueAccent[700] : "#fff",
          },
        }}
        open={openLocationModal}
        onClose={() => setOpenLocationModal(false)}
        aria-labelledby="location-modal-title"
        aria-describedby="location-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: theme.palette.mode === "dark" ? colors.blueAccent[700] : "#fff",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography textAlign="center" fontWeight="bold" variant="h5" id="location-modal-title" gutterBottom>
            {locationType === "source" ? t("Pick-up Point") : t("Drop-off Point")}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {selectedLocation ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>{t("Address")}:</strong> {selectedLocation.address}
              </Typography>
              {selectedLocation.ward && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>{t("Ward")}:</strong> {selectedLocation.ward}
                </Typography>
              )}
              {selectedLocation.district && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>{t("District")}:</strong> {selectedLocation.district}
                </Typography>
              )}
              {selectedLocation.province && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>{t("Province")}:</strong> {selectedLocation.province.name}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="subtitle1" color="text.secondary">
              {t("Chưa xác định")}
            </Typography>
          )}
          
          {/* <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={() => setOpenLocationModal(false)}
              color="primary"
            >
              {t("Close")}
            </Button>
          </Box> */}
        </Box>
      </Modal>

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
            {t("Delete Trip")}&nbsp;
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
              onClick={() => handleDeleteTrip(selectedRow)}
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

export default Trip;
