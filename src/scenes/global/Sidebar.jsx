import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {
  Box,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { Menu, MenuItem, ProSidebar } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { Link, Navigate } from "react-router-dom";
import { tokens } from "../../theme";
import { sidebarItems } from "./sidebarItems";
import useLogin from "../../utils/useLogin";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import PasswordIcon from "@mui/icons-material/Password";
import SettingsIcon from "@mui/icons-material/Settings";
import * as authApi from "./authQueries";
import { useNavigate } from "react-router-dom";

const Item = (props) => {
  const { title, to, icon, selected, setSelected } = props;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      onClick={() => setSelected(title)}
      icon={icon}
      style={{
        color: colors.grey[100],
      }}
    >
      <Typography fontWeight="bold">{title}</Typography>
      <Link to={to}></Link>
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const navigate = useNavigate();

  const isLoggedIn = useLogin();
  const loginUser = localStorage.getItem("loginUser");

  const handleLogout = () => {
    if (!isLoggedIn) navigate("/login");
    else {
      authApi.logout();
      localStorage.removeItem("acToken");
      localStorage.removeItem("loginUser");
      localStorage.removeItem("permissions");
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                {/* Có thể thay greeting, username ở đây */}
                <Typography variant="h4" color={colors.grey[100]}>
                  ADMINS
                </Typography>
                <IconButton>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>
          {!isCollapsed && (
            <Box mb="25px">
              {/* <Box display="flex" justifyContent="center" alignContent="center">
                <img
                  src="../../src/assets/narutooo.jpg"
                  alt="avatar"
                  width="100px"
                  height="100px"
                  style={{ borderRadius: "50%", cursor: "pointer" }}
                />
              </Box> */}
              {isLoggedIn && loginUser !== null && (
                <Box textAlign="center">
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color={colors.grey[100]}
                    margin="10px 0 0 0"
                  >
                    Hello
                  </Typography>
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    {loginUser}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Menu Items */}
          <Box paddingLeft={!isCollapsed ? "10%" : undefined}>
            {sidebarItems.map((item, index) => {
              return (
                <Box key={index}>
                  {index % 3 === 0 && (
                    <Divider
                      sx={{ marginRight: !isCollapsed ? "10%" : undefined }}
                    />
                  )}
                  <Item
                    title={item.title}
                    to={item.to}
                    icon={<item.icon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                </Box>
              );
            })}
            <Box
              display="flex"
              justifyContent="center"
              mt="20px"
              gap="20px"
              flexDirection={isCollapsed ? "column" : "row"}
            >
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout}>
                  <ExitToAppOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="User's Profile">
                <IconButton onClick={() => navigate("/settings")}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Change Password">
                <IconButton onClick={() => navigate("/change-password")}>
                  <PasswordIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
