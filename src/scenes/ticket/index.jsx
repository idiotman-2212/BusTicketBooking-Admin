import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import CommuteOutlinedIcon from "@mui/icons-material/CommuteOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Modal,
  Skeleton,
  Stack,
  Divider,
  TextField,
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
import { Link, useNavigate } from "react-router-dom";
import CustomDataTable from "../../components/CustomDataTable";
import CustomToolTip from "../../components/CustomToolTip";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { handleToast } from "../../utils/helpers";
import { useQueryString } from "../../utils/useQueryString";
import * as tripApi from "../trip/tripQueries";
import * as userApi from "../user/userQueries";
import * as ticketApi from "./ticketQueries";
import { parse, format } from "date-fns";
import { hasPermissionToDoAction } from "../../utils/CrudPermission";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";

const getBookingDateFormat = (bookingDateTime) => {
  return format(
    parse(bookingDateTime, "yyyy-MM-dd HH:mm", new Date()),
    "dd/MM/yyyy"
  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const Ticket = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openTripModal, setOpenTripModal] = useState(false);
  const [openBookingModal, setOpenBookingModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [filtering, setFiltering] = useState("");
  const [openForbiddenModal, setOpenForbiddenModal] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState("");
  const { t } = useTranslation();
  const [selectedPrintTicket, setSelectedPrintTicket] = useState(null);
  const [openPrintModal, setOpenPrintModal] = useState(false);

  const queryClient = useQueryClient();

  const bookingQuery = useQuery({
    queryKey: ["bookings", selectedRow],
    queryFn: () => ticketApi.getBooking(selectedRow),
    enabled: selectedRow !== "",
  });

  const formatLocation = (location) => {
    if (!location) return t("Chưa xác định");

    const { address, ward, district, province } = location;
    return `${address || ""}${ward ? ", " + ward : ""}${
      district ? ", " + district : ""
    }${province?.name ? ", " + province.name : ""}`;
  };

  const handleOpenPrintModal = (ticketId) => {
    setSelectedPrintTicket(ticketId);
    setSelectedRow(ticketId); // Đặt selectedRow để `bookingQuery` tải dữ liệu
    setOpenPrintModal(true);
  };

  const columns = useMemo(
    () => [
      {
        header: t("Customer"),
        accessorKey: "custFirstName",
        footer: "First Name",
        width: 100,
        maxWidth: 250,
        isEllipsis: true,
        filterFn: "includesString", // Áp dụng hàm lọc theo chuỗi
        cell: (info) => {
          const { custFirstName, custLastName } = info.row.original;
          return (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-around"
            >
              {custLastName}
              <CustomToolTip title="Detail" placement="top">
                <IconButton
                  onClick={() => {
                    // setSelectedUser(username);
                    setSelectedRow(info.row.original.id); // get customer's info not logged in user's info
                    setOpenUserModal(!openUserModal);
                  }}
                >
                  <PersonIcon />
                </IconButton>
              </CustomToolTip>
            </Box>
          );
        },
      },
      {
        header: t("Phone"),
        accessorKey: "phone",
        footer: "Phone",
        width: 100,
        maxWidth: 150,
        align: "center",
        cell: (info) => info.getValue(),
        filterFn: "includesString", // Hàm lọc cho cột này
      },
      {
        header: t("Trip"),
        accessorKey: "trip",
        footer: "Trip",
        width: 250,
        maxWidth: 3500,
        isEllipsis: true,
        align: "center",
        cell: (info) => {
          const { id, source, destination, departureTime } = info.getValue();
          return (
            <Box display="flex" alignItems="center" justifyContent="center">
              <Typography fontWeight="bold">[{departureTime}]</Typography>
              {source.name}
              {info.row.original.bookingType === "ONEWAY" ? (
                <span style={{ margin: "0 6px" }}>&rArr;</span>
              ) : (
                <span style={{ margin: "0 6px" }}>&hArr;</span>
              )}
              {destination.name}
              <CustomToolTip title={t("Detail")} placement="top">
                <IconButton
                  onClick={() => {
                    // setSelectedTrip(id);
                    setSelectedRow(info.row.original.id);
                    setOpenTripModal(!openTripModal);
                  }}
                >
                  <CommuteOutlinedIcon />
                </IconButton>
              </CustomToolTip>
            </Box>
          );
        },
      },
      {
        header: t("Seat Number"),
        accessorKey: "seatNumber",
        footer: "Seat Number",
        width: 20,
        maxWidth: 80,
        align: "center",
      },
      {
        header: t("Payment"),
        accessorKey: "payment",
        footer: "Payment",
        width: 70,
        maxWidth: 150,
        align: "center",
        cell: (info) => {
          const { paymentStatus } = info.row.original;
          return (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-around"
            >
              {paymentStatus}
              <CustomToolTip title={t("Detail")} placement="top">
                <IconButton
                  onClick={() => {
                    setSelectedRow(info.row.original.id);
                    setOpenBookingModal(!openBookingModal);
                  }}
                >
                  <PriorityHighOutlinedIcon />
                </IconButton>
              </CustomToolTip>
            </Box>
          );
        },
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
              <CustomToolTip title="Print Ticket" placement="top">
                <IconButton
                  onClick={() => handleOpenPrintModal(info.row.original.id)}
                >
                  <PrintOutlinedIcon />
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

  // Get page of Bookings
  const { data } = useQuery({
    queryKey: ["bookings", pagination],
    queryFn: () => {
      setSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      return ticketApi.getPageOfBookings(
        pagination.pageIndex,
        pagination.pageSize
      );
    },
    keepPreviousData: true,
  });

  const prefetchAllBookings = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["bookings", "all"],
      queryFn: () => ticketApi.getAll(),
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

  const deleteMutation = useMutation({
    mutationFn: (bookingId) => ticketApi.deleteBooking(bookingId),
  });

  const handleDeleteBooking = (bookingId) => {
    deleteMutation.mutate(bookingId, {
      onSuccess: (data) => {
        setOpenModal(!openModal);
        queryClient.invalidateQueries({ queryKey: ["bookings", pagination] });
        handleToast("success", data); // Hiển thị toast thành công
      },
      onError: (error) => {
        console.log("Delete Booking ", error);
        handleToast(
          "error",
          error.response?.data?.message || "Failed to delete booking."
        );
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
      globalFilter: filtering, // Cập nhật globalFilter với giá trị filtering
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setFiltering, // Cập nhật giá trị filtering khi có thay đổi
    manualPagination: true,
  });

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title={t("Bookings")} subTitle={t("Booking management")} />
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
            onMouseEnter={async () => await prefetchAllBookings()}
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

      <CustomDataTable
        table={table}
        colors={colors}
        totalElements={data?.totalElements}
      />

      {/* USER DETAIL MODAL */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.primary[400] : "#fff",
          },
        }}
        open={openUserModal}
        onClose={() => setOpenUserModal(!openUserModal)}
        aria-labelledby="modal-userModal-title"
        aria-describedby="modal-userModal-description"
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
            <Typography variant="h4">{t("CUSTOMER DETAIL")}</Typography>
            <Typography mt="5px" variant="h5" fontStyle="italic">
              {bookingQuery.data?.user !== null
                ? `Buy with Account (${bookingQuery.data?.username})`
                : "Buy without Account"}
            </Typography>
          </Box>
          {bookingQuery.isLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="rectangular" width={210} height={60} />
              <Skeleton variant="rounded" width={210} height={60} />
            </Stack>
          ) : (
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Full Name")}
                name="fullName"
                value={`${bookingQuery?.data?.custFirstName} ${bookingQuery?.data?.custLastName}`}
                sx={{
                  gridColumn: "span 4",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Contact Phone")}
                name="phone"
                value={bookingQuery?.data?.phone}
                sx={{
                  gridColumn: "span 4",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Email"
                name="email"
                value={bookingQuery?.data?.email}
                sx={{
                  gridColumn: "span 4",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Pickup Location")}
                name="pickUpLocation"
                value={formatLocation(bookingQuery?.data?.trip.pickUpLocation)}
                sx={{
                  gridColumn: "span 4",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Dropoff Location")}
                name="dropOffLocation"
                value={formatLocation(bookingQuery?.data?.trip.dropOffLocation)}
                sx={{
                  gridColumn: "span 4",
                }}
              />
            </Box>
          )}
        </Box>
      </Modal>

      {/* TRIP DETAIL MODAL */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.primary[400] : "#fff",
          },
        }}
        open={openTripModal}
        onClose={() => setOpenTripModal(!openTripModal)}
        aria-labelledby="modal-tripModal-title"
        aria-describedby="modal-tripModal-description"
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
            <Typography variant="h4">{t("TRIP DETAIL")}</Typography>
          </Box>
          {bookingQuery.isLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="rectangular" width={210} height={60} />
              <Skeleton variant="rounded" width={210} height={60} />
            </Stack>
          ) : (
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Source")}
                name="source"
                value={bookingQuery?.data?.trip.source.name}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Destination")}
                name="destination"
                value={bookingQuery?.data?.trip.destination.name}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Departure DateTime")}
                name="bookingDateTime"
                value={format(
                  parse(
                    bookingQuery?.data.trip.departureDateTime,
                    "yyyy-MM-dd HH:mm",
                    new Date()
                  ),
                  "HH:mm dd-MM-yyyy"
                )}
                sx={{
                  gridColumn: "span 4",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Driver")}
                name="driver"
                value={`${bookingQuery?.data?.trip.driver.firstName} ${bookingQuery?.data?.trip.driver.lastName}`}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Coach")}
                name="coach"
                value={`${bookingQuery?.data?.trip.coach.name}\t\tTYPE:${bookingQuery?.data?.trip.coach.coachType}`}
                sx={{
                  gridColumn: "span 4",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Price")}
                name="price"
                value={bookingQuery?.data?.trip.price}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Discount")}
                name="discount"
                value={
                  bookingQuery?.data?.trip.discount
                    ? bookingQuery?.data?.trip.discount.amount
                    : "NONE"
                }
                sx={{
                  gridColumn: "span 2",
                }}
              />
            </Box>
          )}
        </Box>
      </Modal>

      {/* PAYMENT MODAL */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.primary[400] : "#fff",
          },
        }}
        open={openBookingModal}
        onClose={() => setOpenBookingModal(!openBookingModal)}
        aria-labelledby="modal-paymentModal-title"
        aria-describedby="modal-paymentModal-description"
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
            <Typography variant="h4" fontWeight="bold">
              {t("PAYMENT DETAIL")}
            </Typography>
          </Box>
          {bookingQuery.isLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="rectangular" width={210} height={60} />
              <Skeleton variant="rounded" width={210} height={60} />
            </Stack>
          ) : (
            <>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              >
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label={t("Total")}
                  name="totalPayment"
                  value={bookingQuery?.data?.totalPayment}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label={t("Date time")}
                  name="paymentDateTime"
                  value={bookingQuery?.data?.paymentDateTime}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label={t("Method")}
                  name="paymentMethod"
                  value={bookingQuery?.data?.paymentMethod}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label={t("Status")}
                  name="paymentStatus"
                  value={bookingQuery?.data?.paymentStatus}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
              </Box>
              <Typography
                m="20px 0"
                variant="h4"
                fontWeight="bold"
                textAlign="center"
              >
                {t("PAYMENT HISTORIES")}
              </Typography>
              {bookingQuery.data.paymentHistories.length === 0 ? undefined : (
                <Box mt="20px" maxHeight="200px" overflow="auto">
                  {bookingQuery.data.paymentHistories
                    .toReversed()
                    .map((history, index) => {
                      const { oldStatus, newStatus, statusChangeDateTime } =
                        history;
                      return (
                        <Box p="5px" textAlign="center" key={index}>
                          <Typography>{`${format(
                            parse(
                              statusChangeDateTime,
                              "yyyy-MM-dd HH:mm:ss",
                              new Date()
                            ),
                            "HH:mm:ss dd/MM/yyyy"
                          )}`}</Typography>
                          <Typography mt="4px" fontWeight="bold" variant="h5">
                            {oldStatus ? oldStatus : t("CREATE")} &rArr;{" "}
                            {newStatus}
                          </Typography>
                        </Box>
                      );
                    })}
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>

      {/* ACTION MODAL */}
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
            {t("Cancel Booking")}&nbsp;
            <span
              style={{
                fontStyle: "italic",
              }}
            >
              {selectedRow} ?
            </span>
          </Typography>
          <Typography textAlign="center" fontStyle="italic">
            {t("* This will turn payment status to CANCEL")}
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
              onClick={() => handleDeleteBooking(selectedRow)}
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

      {/* Print booking */}
      <Modal
        open={openPrintModal}
        onClose={() => setOpenPrintModal(false)}
        aria-labelledby="print-ticket-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            p: 4,
            bgcolor: "white",
            borderRadius: 2,
            width: "500px",
            maxHeight: "90%",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            overflow: "auto",
          }}
        >
          {selectedPrintTicket && bookingQuery?.data ? (
            <Box
              sx={{
                border: "2px solid #1976d2",
                borderRadius: 2,
                p: 3,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  mb: 3,
                  borderBottom: "2px dashed #1976d2",
                  pb: 2,
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: "#1976d2",
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  BOOKING TICKET
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {formatLocation(bookingQuery?.data?.trip.pickUpLocation)}
                  <Box
                  >
                    {"→"}
                  </Box>
                  {formatLocation(bookingQuery?.data?.trip.dropOffLocation)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    <strong>Passenger Name:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {`${bookingQuery.data.custFirstName} ${bookingQuery.data.custLastName}`}
                  </Typography>

                  <Typography variant="h6" color="text.secondary">
                    <strong>Phone:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {bookingQuery.data.phone}
                  </Typography>

                  <Typography variant="h6" color="text.secondary">
                    <strong>Email:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {bookingQuery.data.email ?? "Not provided"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" color="text.secondary">
                    <strong>Departure Date:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {format(
                      parse(
                        bookingQuery.data.trip.departureDateTime,
                        "yyyy-MM-dd HH:mm",
                        new Date()
                      ),
                      "HH:mm dd-MM-yyyy"
                    )}
                  </Typography>

                  <Typography variant="h6" color="text.secondary">
                    <strong>Seat Number:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {bookingQuery.data.seatNumber}
                  </Typography>

                  <Typography variant="h6" color="text.secondary">
                    <strong>Ticket Price:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {/* {bookingQuery.data.totalPayment} VND */}
                    {formatCurrency(bookingQuery.data.totalPayment)}
                  </Typography>
                </Box>
              </Box>

              {/* QR Code */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  width: 100,
                  height: 100,
                  bgcolor: "#f0f0f0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 1,
                }}
              >
                <QRCodeCanvas
                  value={JSON.stringify({
                    ticketId: selectedPrintTicket,
                    passengerName:
                      bookingQuery.data.custFirstName +
                      " " +
                      bookingQuery.data.custLastName,
                    departureDateTime: bookingQuery.data.trip.departureDateTime,
                    seatNumber: bookingQuery.data.seatNumber,
                    totalPayment: bookingQuery.data.totalPayment,
                  })}
                  size={100}
                />
              </Box>

              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  justifyContent: "center",
                  borderTop: "2px dashed #1976d2",
                  pt: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.print()}
                  startIcon={<PrintOutlinedIcon />}
                >
                  Print Ticket
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="h6" color="error" align="center">
              No ticket information available.
            </Typography>
          )}
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

export default Ticket;
