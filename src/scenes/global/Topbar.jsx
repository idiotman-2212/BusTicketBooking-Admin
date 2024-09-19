import { React, useContext } from "react";
import { Box, IconButton, InputBase, useTheme, Tooltip  } from "@mui/material";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { FaFlagUsa } from 'react-icons/fa';
import { FaFlag } from 'react-icons/fa';
import { initReactI18next, useTranslation } from 'react-i18next';
import vietnamFlag from "../../assets/vietnam.png";
import usaFlag from "../../assets/uk.png";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const {t, i18n} = useTranslation();

  const changeLanguage =(lgn) =>{
    i18n.changeLanguage(lgn);
    console.log("change language", lgn)
  }

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
        
       

       {/* Language switcher - English (USA) */}
        <Tooltip title="Switch to English">
          <IconButton
            sx={{
              display: "flex",
              bgcolor: colors.primary[400],
              borderRadius: "50%", // Bo tròn nút
              mx: 1,
              padding: "5px", // Điều chỉnh padding
            }}
            onClick={() => changeLanguage("en")}
          >
            <img src={usaFlag} alt="USA Flag" width="24" height="24" style={{ borderRadius: "50%" }} />
          </IconButton>
        </Tooltip>

        {/* Language switcher - Vietnamese */}
        <Tooltip title="Chuyển sang Tiếng Việt">
          <IconButton
            sx={{
              display: "flex",
              bgcolor: colors.primary[400],
              borderRadius: "50%", // Bo tròn nút
              mx: 1,
              padding: "5px", // Điều chỉnh padding
            }}
            onClick={() => changeLanguage("vi")}
          >
            <img src={vietnamFlag} alt="Vietnam Flag" width="24" height="24" style={{ borderRadius: "50%" }} />
          </IconButton>
        </Tooltip>
      
        
      </Box>
    </Box>
  );
};

export default Topbar;
