import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FemaleOutlinedIcon from "@mui/icons-material/FemaleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MaleOutlinedIcon from "@mui/icons-material/MaleOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputBase,
  Modal,
  Skeleton,
  Stack,
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
import * as userApi from "./userQueries";
import { hasPermissionToDoAction } from "../../utils/CrudPermission";
import { ROLES, SCREENS } from "../../utils/appContants";

const User = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [openRoleSetupModal, setOpenRoleSetupModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [filtering, setFiltering] = useState("");
  const queryClient = useQueryClient();
  const [openForbiddenModal, setOpenForbiddenModal] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState("");
  const [permissionOption, setPermissionOption] = useState({});
  const [isCreateChecked, setCreateChecked] = useState(false);
  const [isReadChecked, setReadChecked] = useState(false);
  const [isUpdateChecked, setUpdateChecked] = useState(false);
  const [isDeleteChecked, setDeleteChecked] = useState(false);

  const hasMainRoleInPermissionList = (mainRole, permissions) => {
    return permissions.some(
      (permission) => permission.role.roleCode === mainRole
    );
  };

  const getMainRole = (permissions) => {
    if (hasMainRoleInPermissionList(ROLES.ROLE_ADMIN, permissions))
      return "ADMIN";
    if (hasMainRoleInPermissionList(ROLES.ROLE_STAFF, permissions))
      return "STAFF";
    if (hasMainRoleInPermissionList(ROLES.ROLE_CUSTOMER, permissions))
      return "CUSTOMER";
  };

  const hasRoleAdmin = (savedPermissions) => {
    const roleKeys = Object.keys(savedPermissions);
    return roleKeys.some((role) => role === ROLES.ROLE_ADMIN);
  };

  // Columns
  const columns = useMemo(
    () => [
      {
        header: "First Name",
        accessorKey: "firstName",
        footer: "First Name",
        width: 150,
        maxWidth: 200,
        isEllipsis: true,
      },
      {
        header: "Last Name",
        accessorKey: "lastName",
        footer: "Last Name",
        width: 100,
        maxWidth: 150,
        isEllipsis: true,
        align: "left",
      },
      {
        header: "Email",
        accessorKey: "email",
        footer: "Email",
        width: 180,
        maxWidth: 200,
        isEllipsis: true,
      },
      {
        header: "Phone",
        accessorKey: "phone",
        footer: "Phone",
        width: 100,
        maxWidth: 250,
        isEllipsis: true,
        align: "center",
      },
      {
        header: "Gender",
        accessorKey: "gender",
        footer: "Gender",
        width: 60,
        maxWidth: 150,

        align: "center",
        cell: (info) =>
          info.getValue() ? (
            <FemaleOutlinedIcon sx={{ color: "#f90070" }} />
          ) : (
            <MaleOutlinedIcon sx={{ color: "#00d1ef" }} />
          ),
      },
      {
        header: "Active",
        accessorKey: "active",
        footer: "Active",
        width: 60,
        maxWidth: 150,
        align: "center",
        cell: (info) =>
          info.getValue() ? (
            <CheckOutlinedIcon sx={{ color: "#00e330" }} />
          ) : (
            <LockOutlinedIcon sx={{ color: "#eb0014" }} />
          ),
      },
      {
        header: "Roles",
        accessorKey: "roles",
        footer: "Roles",
        width: 150,
        maxWidth: 300,
        cell: (info) => {
          const mainRole = getMainRole(info.row.original.permissions);
          const isAdmin = hasRoleAdmin(
            JSON.parse(localStorage.getItem("permissions"))
          );
          return (
            <Box display="flex" alignItems="center" justifyContent="center">
              {mainRole}
              {mainRole === "STAFF" && isAdmin && (
                <CustomToolTip title="Role Setup" placement="top">
                  <IconButton
                    onClick={() => {
                      setSelectedRow(info.row.original.username);
                      setOpenRoleSetupModal(!openRoleSetupModal);
                    }}
                  >
                    <AdminPanelSettingsOutlinedIcon />
                  </IconButton>
                </CustomToolTip>
              )}
            </Box>
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
          const mainRole = getMainRole(info.row.original.permissions);
          return (
            <Box>
              {mainRole !== "ADMIN" && (
                <>
                  <CustomToolTip title="Edit" placement="top">
                    <IconButton
                      onClick={() => {
                        handleOpenUpdateForm(info.row.original.username);
                      }}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                  </CustomToolTip>
                  <CustomToolTip title="Delete" placement="top">
                    <IconButton
                      onClick={() => {
                        const loginUser = localStorage.getItem("loginUser");
                        if (loginUser === info.row.original.username) {
                          setForbiddenMessage(
                            "Can't not delete current login user"
                          );
                          setOpenForbiddenModal(!openForbiddenModal);
                        } else if (info.row.original.username === "admin") {
                          setForbiddenMessage("Can't not delete ADMIN");
                          setOpenForbiddenModal(!openForbiddenModal);
                        } else {
                          handleOpenDeleteForm(info.row.original.username);
                        }
                      }}
                    >
                      <DeleteOutlineOutlinedIcon />
                    </IconButton>
                  </CustomToolTip>
                </>
              )}
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
    queryKey: ["users", pagination],
    queryFn: () => {
      setSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      return userApi.getPageOfUser(pagination.pageIndex, pagination.pageSize);
    },
    keepPreviousData: true,
  });

  const prefetchAllUsers = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["users", "all"],
      queryFn: () => userApi.getAll(),
    });
  };

  // get user permission
  const permissionQuery = useQuery({
    queryKey: ["permissions", selectedRow],
    queryFn: () => userApi.getUserPermission(selectedRow),
    enabled: selectedRow !== "" && openRoleSetupModal,
  });

  //
  const transformPermissionObject = (permissions) => {
    // target : {key(screen): value([role1, role2, ...])}
    const CRUD = [
      ROLES.ROLE_CREATE,
      ROLES.ROLE_READ,
      ROLES.ROLE_UPDATE,
      ROLES.ROLE_DELETE,
    ];
    const reversedPermission = {};
    const screens = Object.keys(SCREENS);

    screens.forEach((screen) => (reversedPermission[screen] = []));

    for (const action of CRUD) {
      const allowedScreens = permissions[action];
      if (allowedScreens) {
        allowedScreens.forEach((allowedScreen) => {
          reversedPermission[allowedScreen].push(action);
        });
      }
    }

    const screenKeys = Object.keys(reversedPermission);
    let permissionOptions = [];
    screenKeys.forEach((screenKey) => {
      permissionOptions.push({
        screen: screenKey,
        roles: reversedPermission[screenKey],
      });
    });
    return permissionOptions;
  };

  const getRoleName = (role) => {
    switch (role) {
      case ROLES.ROLE_CREATE:
        return "CREATE";
      case ROLES.ROLE_READ:
        return "READ";
      case ROLES.ROLE_UPDATE:
        return "UPDATE";
      case ROLES.ROLE_DELETE:
        return "DELETE";
    }
  };
  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.ROLE_CREATE:
        return "#00bf0a";
      case ROLES.ROLE_READ:
        return "#129ce4";
      case ROLES.ROLE_UPDATE:
        return "#f06d0c";
      case ROLES.ROLE_DELETE:
        return "#e1000f";
    }
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
    mutationFn: (username) => userApi.deleteUser(username),
  });

  // Handle delete User
  const handleDeleteUser = (username) => {
    deleteMutation.mutate(username, {
      onSuccess: (data) => {
        setOpenModal(!openModal);
        queryClient.invalidateQueries({ queryKey: ["users", pagination] });
        handleToast("success", data);
      },
      onError: (error) => {
        console.log("Delete User ", error);
        handleToast("error", error.response?.data.message);
      },
    });
  };

  // const getAllStaffs = (userList) => {
  //   return userList.filter((user) =>
  //     hasMainRoleInPermissionList(ROLES.ROLE_STAFF, user.permissions)
  //   );
  // };

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

  const handlePermissionOptionSelect = (option) => {
    setPermissionOption(option);
    setCreateChecked(option?.roles?.includes(ROLES.ROLE_CREATE) || false);
    setReadChecked(option?.roles?.includes(ROLES.ROLE_READ) || false);
    setUpdateChecked(option?.roles?.includes(ROLES.ROLE_UPDATE) || false);
    setDeleteChecked(option?.roles?.includes(ROLES.ROLE_DELETE) || false);
  };

  const permissionMutation = useMutation({
    mutationFn: (permissionObject) =>
      userApi.updateUserPermission(permissionObject),
  });

  const handleUpdatePermission = () => {
    const newRoles = [];
    if (isCreateChecked) newRoles.push(ROLES.ROLE_CREATE);
    if (isReadChecked) newRoles.push(ROLES.ROLE_READ);
    if (isUpdateChecked) newRoles.push(ROLES.ROLE_UPDATE);
    if (isDeleteChecked) newRoles.push(ROLES.ROLE_DELETE);

    const newPermissionOption = { ...permissionOption, roles: [...newRoles] };

    const permissionMutateObject = {
      username: selectedRow,
      ...newPermissionOption,
    };

    permissionMutation.mutate(permissionMutateObject, {
      onSuccess: (data) => {
        setOpenRoleSetupModal(!open);
        handleToast("success", "Update Permission successfully!");
      },
      onError: (error) => {
        console.log("Delete User ", error);
        handleToast("error", error.response?.data.message);
      },
    });
  };

  const renderRoleCheckBoxes = () => {
    return (
      <>
        <FormControlLabel
          checked={isCreateChecked}
          onChange={(e) => {
            setCreateChecked(e.target.checked);
          }}
          control={<Checkbox color="success" />}
          label="CREATE"
          color="#00bf0a"
          sx={{ color: "#00bf0a" }}
        />
        <FormControlLabel
          checked={isReadChecked}
          onChange={(e) => {
            setReadChecked(e.target.checked);
          }}
          control={<Checkbox color="info" />}
          label="READ"
          color="#129ce4"
          sx={{ color: "#129ce4" }}
        />
        <FormControlLabel
          checked={isUpdateChecked}
          onChange={(e) => {
            setUpdateChecked(e.target.checked);
          }}
          control={<Checkbox color="warning" />}
          label="UPDATE"
          color="#f06d0c"
          sx={{ color: "#f06d0c" }}
        />
        <FormControlLabel
          checked={isDeleteChecked}
          onChange={(e) => {
            setDeleteChecked(e.target.checked);
          }}
          control={<Checkbox color="error" />}
          label="DELETE"
          sx={{ color: "#e1000f" }}
        />
      </>
    );
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="USERS" subTitle="User management" />
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
            onMouseEnter={async () => await prefetchAllUsers()}
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

      {/* ROLE SETUP MODAL */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor:
              theme.palette.mode === "dark" ? colors.primary[400] : "#fff",
          },
        }}
        open={openRoleSetupModal}
        onClose={() => setOpenRoleSetupModal(!openRoleSetupModal)}
        aria-labelledby="modal-roleSetup-title"
        aria-describedby="modal-roleSetup-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: 700,
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          {/* title */}
          <Box textAlign="center" marginBottom="40px">
            <Typography variant="h4">ROLE SETUP</Typography>
            <Typography mt="5px" variant="h5" fontStyle="italic">
              User: {selectedRow}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center">
            {permissionQuery.isLoading ? (
              <Stack spacing={1}>
                {/* For variant="text", adjust the height via font-size */}
                <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                {/* For other variants, adjust the size with `width` and `height` */}
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={210} height={60} />
                <Skeleton variant="rounded" width={210} height={60} />
              </Stack>
            ) : (
              <Box
                width="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                gap="60px"
              >
                <Autocomplete
                  fullWidth
                  id="permission-autocomplete"
                  onChange={(e, newValue) => {
                    handlePermissionOptionSelect(newValue);
                  }}
                  getOptionLabel={(option) => option.screen}
                  renderOption={(props, option) => {
                    return (
                      <Box component="li" {...props} display="flex" gap="30px">
                        <Typography>{`${option?.screen}`}</Typography>
                        <Box display="flex" gap="10px">
                          {option?.roles &&
                            option.roles.map((role) => (
                              <Typography
                                key={role}
                                component="span"
                                fontWeight="bold"
                                color={getRoleColor(role)}
                              >
                                {getRoleName(role)}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    );
                  }}
                  options={transformPermissionObject(
                    permissionQuery?.data?.permission
                  )}
                  sx={{
                    gridColumn: "span 2",
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="screenPermission"
                      label="Screen Permission"
                      color="warning"
                      size="small"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {permissionQuery.isLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <Box display="flex" justifyContent="center" gap="10px">
                  {renderRoleCheckBoxes()}
                </Box>
                <Button
                  sx={{ mb: "20px" }}
                  disableElevation
                  disableRipple
                  variant="contained"
                  color="info"
                  onClick={handleUpdatePermission}
                >
                  Update Permission
                </Button>
              </Box>
            )}
          </Box>
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
            Delete User&nbsp;
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
              onClick={() => handleDeleteUser(selectedRow)}
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

export default User;
