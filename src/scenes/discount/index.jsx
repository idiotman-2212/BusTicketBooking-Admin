import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
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
import { format, parse } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomDataTable from "../../components/CustomDataTable";
import CustomToolTip from "../../components/CustomToolTip";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { handleToast } from "../../utils/helpers";
import { useQueryString } from "../../utils/useQueryString";
import * as discountApi from "./discountQueries";
import { hasPermissionToDoAction } from "../../utils/CrudPermission";

const Discount = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [filtering, setFiltering] = useState("");
  const [openForbiddenModal, setOpenForbiddenModal] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState("");
  const queryClient = useQueryClient();

  // Columns
  const columns = useMemo(
    () => [
      {
        header: "Code",
        accessorKey: "code",
        footer: "Code",
        width: 150,
        maxWidth: 200,
        isEllipsis: true,
      },
      {
        header: "Amount",
        accessorKey: "amount",
        footer: "Amount",
        width: 100,
        maxWidth: 250,
        align: "center",
      },
      {
        header: "From",
        accessorKey: "startDateTime",
        footer: "From",
        width: 150,
        maxWidth: 300,
        align: "center",
        cell: (info) => {
          return format(
            parse(info.getValue(), "yyyy-MM-dd HH:mm:ss", new Date()),
            "HH:mm dd/MM/yyyy"
          );
        },
      },
      {
        header: "To",
        accessorKey: "endDateTime",
        footer: "To",
        width: 150,
        maxWidth: 300,
        align: "center",
        cell: (info) => {
          return format(
            parse(info.getValue(), "yyyy-MM-dd HH:mm:ss", new Date()),
            "HH:mm dd/MM/yyyy"
          );
        },
      },
      {
        header: "State",
        accessorKey: "state",
        footer: "State",
        width: 150,
        maxWidth: 300,
        align: "center",
        cell: (info) => {
          const formatRemainingTime = (remainingTime) => {
            const days = Math.floor(remainingTime / (24 * 3600));
            const hours = Math.floor((remainingTime % (24 * 3600)) / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            const seconds = remainingTime % 60;

            let formattedTime = "";
            if (days > 0) {
              formattedTime += `${days}d `;
            }
            if (hours > 0) {
              formattedTime += `${hours}h `;
            }
            if (minutes > 0) {
              formattedTime += `${minutes}m `;
            }
            formattedTime += `${seconds}s`;

            return formattedTime;
          };

          const [remainingTime, setRemainingTime] = useState("");
          useEffect(() => {
            const interval = setInterval(() => {
              const currentDateTime = new Date();
              const endDateTime = parse(
                info.row.original.endDateTime,
                "yyyy-MM-dd HH:mm:ss",
                new Date()
              );
              const timeDiff = Math.floor(
                (endDateTime - currentDateTime) / 1000
              );

              if (timeDiff > 0) {
                setRemainingTime(formatRemainingTime(timeDiff));
              } else {
                setRemainingTime("EXPIRED");
                clearInterval(interval);
              }
            }, 1000);

            return () => {
              clearInterval(interval);
            };
          }, [info.row.original.endDateTime]);

          return (
            <div>
              {remainingTime !== "" && (
                <Box
                  bgcolor={remainingTime !== "EXPIRED" ? "#009900" : "#c30014"}
                  padding="6px"
                  borderRadius="15px"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  color={"#fff"}
                >
                  {remainingTime !== "EXPIRED" ? (
                    <>
                      <CheckIcon sx={{ marginRight: "5px" }} />
                      {remainingTime}
                    </>
                  ) : (
                    <>
                      <ClearIcon sx={{ marginRight: "5px" }} />
                      {remainingTime}
                    </>
                  )}
                </Box>
              )}
            </div>
          );
        },
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

  // Get page of Users
  const { data } = useQuery({
    queryKey: ["discounts", pagination],
    queryFn: () => {
      setSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      return discountApi.getPageOfDiscounts(
        pagination.pageIndex,
        pagination.pageSize
      );
    },
    keepPreviousData: true,
  });

  const prefetchAllDiscounts = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["discounts", "all"],
      queryFn: () => discountApi.getAll(),
    });
  };

  const handleOpenAddNewForm = () => {
    const hasAddPermission = hasPermissionToDoAction(
      "CREATE",
      location.pathname
    );
    if (hasAddPermission) navigate("new");
    else {
      setForbiddenMessage("You don't have permission to CREATE");
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
      setForbiddenMessage("You don't have permission to UPDATE");
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
      setForbiddenMessage("You don't have permission to DELETE");
      setOpenForbiddenModal(!openForbiddenModal);
    }
  };

  // create deleteMutation
  const deleteMutation = useMutation({
    mutationFn: (discountId) => discountApi.deleteDiscount(discountId),
  });

  // Handle delete Coach
  const handleDeleteDiscount = (discountId) => {
    deleteMutation.mutate(discountId, {
      onSuccess: (data) => {
        setOpenModal(!openModal);
        queryClient.invalidateQueries({ queryKey: ["discounts", pagination] });
        handleToast("success", data);
      },
      onError: (error) => {
        console.log("Delete Discount ", error);
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
        <Header title="DISCOUNTS" subTitle="Discount management" />
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
            onMouseEnter={async () => await prefetchAllDiscounts()}
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
          Add new
        </Button>
        {/* </Link> */}
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
            Delete Discount&nbsp;
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
              color="error"
              startIcon={<CheckIcon />}
              onClick={() => handleDeleteDiscount(selectedRow)}
            >
              Confirm
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<ClearIcon />}
              onClick={() => setOpenModal(!openModal)}
            >
              Cancel
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

export default Discount;
