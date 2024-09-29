import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useTranslation } from "react-i18next";
import vietnamFlag from "../../assets/vietnam.png";
import usaFlag from "../../assets/uk.png";
import Tooltip from "@mui/material/Tooltip";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("en"); // Ngôn ngữ mặc định là tiếng Anh

  useEffect(() => {
    // Đồng bộ ngôn ngữ hiện tại từ i18n khi component được mount
    setLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (lgn) => {
    i18n.changeLanguage(lgn);
    setLanguage(lgn); // Cập nhật ngôn ngữ sau khi thay đổi
    console.log("Language changed to", lgn);
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    changeLanguage(selectedLanguage);
  };

  return (
    <Box display="flex" justifyContent="end" p={2}>
      {/* Icons */}
      <Box display="flex" alignItems="center">
        {/* Chế độ sáng/tối */}
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "light" ? (
            <LightModeOutlinedIcon />
          ) : (
            <DarkModeOutlinedIcon />
          )}
        </IconButton>

        {/* Select chuyển đổi ngôn ngữ với Tooltip */}
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
            <Tooltip title="Tiếng Việt" placement="top">
              <img
                src={vietnamFlag}
                alt="Tiếng Việt"
                width="24"
                height="24"
                style={{ borderRadius: "50%" }}
              />
            </Tooltip>
          </MenuItem>
          <MenuItem value="en">
            <Tooltip title="English" placement="top">
              <img
                src={usaFlag}
                alt="English"
                width="24"
                height="24"
                style={{ borderRadius: "50%" }}
              />
            </Tooltip>
          </MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default Topbar;
