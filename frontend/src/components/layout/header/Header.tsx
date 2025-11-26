import MainLogo from "../../../assets/main-logo.svg";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {Link} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

type LangCode = "ru" | "en";

interface LanguageOption {
  code: LangCode;
  label: string;
  short: "RU" | "EN";
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "ru", label: "Русский", short: "RU", flag: "🇷🇺" },
  { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
];

function Header() {
  const { t, i18n } = useTranslation()

  const handleChangeLanguage = (code: LangCode) => {
    i18n.changeLanguage(code);
    handleClose();
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const otherLanguages = LANGUAGES.filter((l) => l.code !== currentLang.code);

  return (
    <header className="header bg-stone-950 px-24 py-4 sticky top-0 z-50 flex row justify-between items-center">
      <div className="header-logo">
        <img src={MainLogo} alt={"logo"} />
      </div>
      <div className="header-menu flex items-center gap-4">
        <div>
          <Link
            to="/"
            className="px-4 py-2 rounded-full text-sm font-medium
            border border-gray-500 text-white
            hover:bg-gray-800 transition-colors"
          >
            {t("login")}
          </Link>
        </div>

        <div>
          <Link
            to="/"
            className="px-4 py-2 rounded-full text-sm font-medium
          bg-white text-black
          hover:bg-gray-200 transition-colors"
          >
            {t("register")}
          </Link>
        </div>

        {/* Домой */}
        <div className="relative flex items-center justify-center group">
          <Link to="/" className="flex items-center justify-center">
            <div
              className="transform transition-transform duration-200
              group-hover:-translate-y-1 group-hover:scale-90"
            >
              <IconButton size="small" className="!p-1">
                <HomeIcon className="text-white" />
              </IconButton>
            </div>
          </Link>

          <span
            className="pointer-events-none
              absolute left-1/2 top-full -translate-x-1/2
              text-xs text-gray-200
              opacity-0 translate-y-1 transform
              transition-all duration-200
              group-hover:opacity-100 group-hover:translate-y-0"
          >
            {t("header.home")}
          </span>
        </div>

        <div className="relative flex items-center justify-center group">
          <Link to="/profile" className="flex items-center justify-center">
            <div
              className="transform transition-transform duration-200
              group-hover:-translate-y-1 group-hover:scale-90"
            >
              <IconButton size="small" className="!p-1">
                <AccountCircleIcon className="text-white" />
              </IconButton>
            </div>
          </Link>

          <span
            className="pointer-events-none
              absolute left-1/2 top-full -translate-x-1/2
              text-xs text-gray-200
              opacity-0 translate-y-1 transform
              transition-all duration-200
              group-hover:opacity-100 group-hover:translate-y-0"
          >
            {t("header.profile")}
          </span>
        </div>

        <div className="relative inline-flex">
          <IconButton
            onClick={handleButtonClick}
            size="small"
            className="
          border border-gray-300 dark:border-gray-600
          rounded-full px-3 py-1
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors
        "
          >
            <span className="mr-2 text-lg">{currentLang.flag}</span>
            <span className="text-sm font-medium text-white">{currentLang.short}</span>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            MenuListProps={{
              className:
                "py-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 shadow-lg",
            }}
          >
            {otherLanguages.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleChangeLanguage(lang.code)}
                className="
              flex items-center
              hover:bg-gray-100 dark:hover:bg-gray-800
              px-3
            "
              >
                <ListItemIcon className="min-w-0 mr-3">
                  <span className="text-xl">{lang.flag}</span>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <span className="text-sm font-medium text-white">{lang.short}</span>
                  }
                  secondary={
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                  {lang.label}
                </span>
                  }
                />
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>
    </header>
  )
}

export default Header;