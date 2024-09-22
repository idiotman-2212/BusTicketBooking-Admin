import { React, useContext, useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  useTheme,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { FaFlagUsa } from "react-icons/fa";
import { FaFlag } from "react-icons/fa";
import { initReactI18next, useTranslation } from "react-i18next";
import vietnamFlag from "../../assets/vietnam.png";
import usaFlag from "../../assets/uk.png";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("en"); // Ngôn ngữ hiện tại

  const changeLanguage = (lgn) => {
    i18n.changeLanguage(lgn);
    console.log("change language", lgn);
  };

  // Xử lý thay đổi ngôn ngữ
  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    changeLanguage(selectedLanguage);
  };

  return (
    <Box display="flex" justifyContent="end" p={2}>
      {/* SearchBar */}
      {/* <Box display="flex" bgcolor={colors.primary[400]} borderRadius="3px">
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box> */}

      {/* Icons */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "light" ? (
            <LightModeOutlinedIcon />
          ) : (
            <DarkModeOutlinedIcon />
          )}
        </IconButton>

        {/* Select chuyển đổi ngôn ngữ */}
        <Select
          value={language}
          onChange={handleLanguageChange}
          sx={{
            minWidth: "50px", // Giảm chiều rộng xuống tối thiểu
            height: "32px", // Chiều cao của thẻ
            padding: "0 8px", // Giảm padding để tiết kiệm không gian
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // Căn giữa cờ trong thẻ
              padding: "0", // Loại bỏ padding để thu nhỏ thẻ nhất có thể
            },
          }}
        >
          <MenuItem value="vi">
            <img
              src={vietnamFlag}
              alt="Tiếng Việt"
              width="24" // Kích thước cờ nhỏ vừa
              height="24"
              style={{ borderRadius: "50%" }}
            />
          </MenuItem>
          <MenuItem value="en">
            <img
              src={usaFlag}
              alt="English"
              width="24" // Kích thước cờ nhỏ vừa
              height="24"
              style={{ borderRadius: "50%" }}
            />
          </MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default Topbar;
