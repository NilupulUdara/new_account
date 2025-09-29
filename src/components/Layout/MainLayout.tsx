import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Alert,
  Badge,
  Button,
  Collapse,
  Drawer as MobileDrawer,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router";
import { SidebarItem, sidebarItems } from "./SidebarItems";
import theme from "../../theme";
import useIsMobile from "../../customHooks/useIsMobile";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { PermissionKeysObject } from "../../views/Administration/SectionList";
import useCurrentUser from "../../hooks/useCurrentUser";
import "./MainLayout.css";
import ViewUserContent from "../../views/Administration/ViewUserProfileContent";
import ViewProfileDataDrawer, {
  DrawerProfileHeader,
} from "../ViewProfileDataDrawer";
import ProfileImage from "../ProfileImageComponent";
import { useQuery } from "@tanstack/react-query";
import { getOrganization } from "../../api/OrganizationSettings/organizationSettingsApi";

const drawerWidth = 265;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: 0,
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
  [theme.breakpoints.down("md")]: {
    width: "100%",
    marginLeft: 0,
  },
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function MainLayout({ children }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(isMobile ? false : true);
  const { user } = useCurrentUser();
  const [openViewProfileDrawer, setOpenViewProfileDrawer] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [openEditUserRoleDialog, setOpenEditUserRoleDialog] = useState(false);
  const statusColor = user?.availability ? "#44b700" : "#f44336";
  const openProfileDrawer = () => setOpenViewProfileDrawer(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const toggleDrawerOpen = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const { data: organizationData } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });

  const logoUrl = useMemo(() => {
    if (organizationData && organizationData?.logoUrl) {
      return Array.isArray(organizationData.logoUrl)
        ? organizationData.logoUrl[0]
        : organizationData.logoUrl;
    }
  }, [organizationData]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        open={open}
        sx={{ backgroundColor: "#fff" }}
      >
        <Toolbar>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                aria-label="open drawer"
                onClick={toggleDrawerOpen}
                edge="start"
                sx={[
                  {
                    color: "#024271",
                    marginRight: 3,
                  },
                  open && !isMobile && { display: "none" },
                ]}
              >
                <MenuIcon />
              </IconButton>
              {logoUrl && (
                <Box>
                  <img
                    src={logoUrl?.signedUrl}
                    alt="logo"
                    height={"45rem"}
                    style={{ marginTop: "10px" }}
                  />
                </Box>
              )}
            </Box>
            {!isMobile && (
              <Box sx={{ display: "flex" }}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  component="div"
                  sx={{
                    color: "var(--pallet-blue)",
                    display: "flex",
                    marginRight: "0.5rem",
                  }}
                >
                  Monitor and Manage
                </Typography>
                <Typography
                  variant="subtitle1"
                  noWrap
                  component="div"
                  sx={{ color: "#000", display: "flex" }}
                >
                  <span className="slider-text" style={{ fontWeight: 600 }}>
                    Sustainability
                  </span>
                  <span className="slider-text" style={{ fontWeight: 600 }}>
                    Health & Safety
                  </span>
                  <span className="slider-text" style={{ fontWeight: 600 }}>
                    Social
                  </span>
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: statusColor,
                    color: statusColor,
                    boxShadow: "0 0 0 2px white",
                    height: "8px",
                    width: "8px",
                    borderRadius: "50%",
                  },
                }}
              >

                <ProfileImage
                  name={user?.name}
                  files={user?.profileImage}
                  size="2rem"
                  onClick={() => setOpenViewProfileDrawer(true)}
                />
              </Badge>
              <ViewProfileDataDrawer
                open={openViewProfileDrawer}
                handleClose={() => setOpenViewProfileDrawer(false)}
                fullScreen={true}
                drawerContent={
                  <Stack spacing={1} sx={{ paddingX: theme.spacing(1) }}>
                    <DrawerProfileHeader
                      title="User Profile"
                      handleClose={() => setOpenViewProfileDrawer(false)}
                      onEdit={() => setOpenEditUserRoleDialog(true)}
                    />
                    <Stack>
                      <ViewUserContent selectedUser={user} />
                    </Stack>
                  </Stack>
                }
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <MobileDrawer
          variant="temporary"
          open={open}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              backgroundColor: "#00024c",
              color: "#fff",
              elevation: 2,
            },
          }}
        >
          <DrawerContent handleDrawerClose={handleDrawerClose} openProfileDrawer={openProfileDrawer}/>
        </MobileDrawer>
      ) : (
        <Drawer
          variant="permanent"
          open={open}
          PaperProps={{
            sx: {
              backgroundColor: "#00024c",
              color: "#fff",
              elevation: 2,
            },
          }}
        >
          <DrawerContent handleDrawerClose={handleDrawerClose} openProfileDrawer={openProfileDrawer} />
        </Drawer>
      )}
      <Box component="main" sx={{ flexGrow: 1, }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}

const DrawerContent = ({
  handleDrawerClose,
  openProfileDrawer,
}: {
  handleDrawerClose: () => void;
  openProfileDrawer: () => void;
}) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { user } = useCurrentUser();
  const [activeMainItem, setActiveMainItem] = useState<string | null>(null); // State to track active main item

  const userPermissionObject = useMemo(() => {
    if (user && user?.permissionObject) {
      return user.permissionObject;
    }
  }, [user]);

  return (
    <>
      <DrawerHeader sx={{ justifyContent: "flex-start" }}>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "rtl" ? (
            <ChevronRightIcon sx={{ color: "#fff" }} />
          ) : (
            <ChevronLeftIcon sx={{ color: "#fff" }} />
          )}
        </IconButton>
        <Typography
          variant="subtitle1"
          noWrap
          component="div"
          sx={{ color: "#7db0ff" }}
        >
          Accounting
        </Typography>
      </DrawerHeader>
      {/* <Divider sx={{ marginBottom: "1rem", }} /> */}
      <Box
        sx={{
          height: "calc(100vh - 75px)",
          overflowY: "auto",
          paddingLeft: 0,
          overflowX: "hidden",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            px: 2,
            py: 1,
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.05rem",
          }}
        >
          Menu
        </Typography>

        {sidebarItems.map((item, index) => {
          if (item?.accessKey && !userPermissionObject[`${item?.accessKey}`])
            return null;

          if (item?.headline) {
            return (
              <Typography
                key={item.headline}
                variant="body2"
                sx={{
                  color: "#7db0ff",
                  padding: "0.5rem 1rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginTop: "5rem",
                }}
              >
                {item.headline}
              </Typography>
            );
          }

          if (item.nestedItems) {
            return (
              <Box key={`${item.href}-${item.title}`} sx={{ marginLeft: "1rem" }}>
                <NestedItem
                  item={item}
                  handleDrawerClose={handleDrawerClose}
                  userPermissionObject={userPermissionObject}
                  activeMainItem={activeMainItem}
                  setActiveMainItem={setActiveMainItem}
                  navigate={navigate}
                />
              </Box>
            );
          }

          return (
            <ListItem
              key={item.accessKey || item.href || index}
              disableGutters
              sx={{ paddingY: "1px", marginLeft: "1rem" }}
            >
              <LinkButton
                to={item.href}
                icon={item.icon}
                title={item.title}
                disabled={item.disabled}
                handleDrawerClose={handleDrawerClose}

              />
            </ListItem>
          );
        })}

        <Divider sx={{ backgroundColor: "var(--pallet-grey)", marginTop: "1rem", width: "80%", mx: "auto" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: "0.75rem",
              letterSpacing: "0.05rem",
            }}
          >
            Profile
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
             onClick={openProfileDrawer}
          >
            <ProfileImage
              name={user?.name}
              files={user?.profileImage}
              size="3rem"
            />

            <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#fff" }}
              >
                {user?.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Button
            sx={{
              textTransform: "capitalize",
              backgroundColor: "#d45e6a",
              color: "white",
              borderRadius: "0.5rem",
              px: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            startIcon={<LogoutIcon />}
            onClick={() => setLogoutDialogOpen(true)}
          >
            Log Out
          </Button>
        </Box>
      </Box>

      {logoutDialogOpen && (
        <DeleteConfirmationModal
          open={logoutDialogOpen}
          title="Log Out Confirmation"
          customDeleteButtonText="Log Out Now"
          customDeleteButtonIon={<LogoutIcon />}
          content={
            <>
              Are you sure you want to log out of the application?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                You will be logged out of the application and will need to log in with credentials again to access your account.
              </Alert>
            </>
          }
          handleClose={() => setLogoutDialogOpen(false)}
          deleteFunc={async () => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          onSuccess={() => {
            setLogoutDialogOpen(false);
            enqueueSnackbar("Logged Out Successfully!", { variant: "success" });
          }}
          handleReject={() => setLogoutDialogOpen(false)}
        />
      )}
    </>
  );
};

const NestedItem = React.memo(
  ({
    item,
    handleDrawerClose,
    userPermissionObject,
    activeMainItem,
    setActiveMainItem,
    navigate,
  }: {
    item: SidebarItem;
    handleDrawerClose: () => void;
    userPermissionObject: PermissionKeysObject;
    activeMainItem: string | null;
    setActiveMainItem: React.Dispatch<React.SetStateAction<string | null>>;
    navigate: ReturnType<typeof useNavigate>;
  }) => {
    const [open, setOpen] = React.useState(item.open);
    const { pathname } = useLocation();
    const { isTablet } = useIsMobile();

    const isMainItemActive = activeMainItem === (item.href || item.title);

    const isAllItemsHidden = useMemo(() => {
      const checkNestedItems = (nestedItems: SidebarItem[]) => {
        return nestedItems.every((nestedItem) => {
          if (nestedItem.nestedItems) {
            return checkNestedItems(nestedItem.nestedItems);
          }
          return nestedItem?.accessKey && !userPermissionObject[nestedItem.accessKey];
        });
      };

      return checkNestedItems(item.nestedItems);
    }, [item.nestedItems, userPermissionObject]);

    if (isAllItemsHidden) return null;

    return (
      <React.Fragment key={item.accessKey || item.href}>
        <Button
          onClick={() => {
            if (item.nestedItems) {
              setOpen((o) => !o);
              setActiveMainItem(item.href || item.title);
            } else if (item.href) {
              navigate(item.href);
              handleDrawerClose();
            }
          }}

          sx={{
            fontSize: "0.8rem",
            paddingY: "0.57rem",
            marginY: "0.4rem",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "230px",
            backgroundColor: isMainItemActive ? "#72a4ffff" : "transparent",
            borderLeft: isMainItemActive ? "4px solid #315fb6" : "none",
            borderRadius: "4px",
            color: "#fff",
            "&:hover": {
              backgroundColor: isMainItemActive ? "#315fb6" : "rgba(49, 95, 182, 0.1)",
            },
            "&:disabled": {
              color: "grey",
              backgroundColor: "transparent",
            },
          }}
          disabled={item.disabled}
        >
          <div
            style={{
              marginRight: "0.5rem",
              marginBottom: -4,
              color: item.disabled ? "grey" : "#fff",
            }}
          >
            {item.icon}
          </div>
          <Typography
            variant="body2"
            sx={{
              textTransform: "capitalize",
              color: item.disabled ? "grey" : "#fff",
              whiteSpace: "pre-line",
              wordBreak: "break-word",
              textAlign: "left",
            }}
          >
            {item.title}
          </Typography>
          <ChevronRightIcon
            sx={{
              transform: open ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              marginLeft: "auto",
            }}
          />
        </Button>
        <Collapse in={open} unmountOnExit>
          <List
            sx={{
              position: "relative",
              marginLeft: "1.2rem",
              paddingLeft: "0.4rem",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "1px",
                backgroundColor: "rgba(255, 255, 255, 0.4)",
              },
            }}
          >
            {item.nestedItems.map((nestedItem, index) => {
              if (nestedItem?.accessKey && !userPermissionObject[`${nestedItem?.accessKey}`])
                return null;

              if (nestedItem.nestedItems) {
                return (
                  <Box key={nestedItem.accessKey || nestedItem.href || index} sx={{ marginLeft: "0.5rem" }}>
                    <NestedItem
                      item={nestedItem}
                      handleDrawerClose={handleDrawerClose}
                      userPermissionObject={userPermissionObject}
                      activeMainItem={activeMainItem}
                      setActiveMainItem={setActiveMainItem}
                      navigate={navigate}
                    />
                  </Box>
                );
              }

              return (
                <ListItem
                  key={nestedItem.accessKey || nestedItem.href || index}
                  disableGutters
                  sx={{ paddingY: "1px", marginLeft: "0.5rem" }}
                >
                  <LinkButton
                    to={nestedItem.href}
                    icon={nestedItem.icon}
                    title={nestedItem.title}
                    disabled={nestedItem.disabled}
                    handleDrawerClose={handleDrawerClose}
                    isSubItem
                  />
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </React.Fragment>
    );
  }
);

interface LinkButtonProps {
  to: string;
  icon: any;
  title: string;
  disabled?: boolean;
  handleDrawerClose: () => void;
  isSubItem?: boolean;
}

export const LinkButton = React.memo(
  ({ to, icon, title, disabled, handleDrawerClose, isSubItem }: LinkButtonProps) => {
    const { pathname } = useLocation();
    const { isTablet } = useIsMobile();

    const isMatch = to === "/" ? pathname === to : pathname.startsWith(to);

    return (
      <Link
        to={to}
        style={{ width: "230px" }}
        onClick={() => {
          if (isTablet) handleDrawerClose();
        }}
      >
        <Button
          sx={{
            fontSize: "0.8rem",
            paddingY: "0.8rem",
            alignItems: "center",
            justifyContent: "flex-start",
            width: isSubItem ? "180px" : "230px",
            backgroundColor: isMatch ? "#72a4ffff" : "transparent",
            borderLeft: isMatch ? "4px solid #315fb6" : "none",
            borderRadius: "4px",
            marginY: "2px",
            color: "#fff",
            "&:hover": {
              backgroundColor: isMatch ? "#315fb6" : "rgba(49, 95, 182, 0.1)",
            },
            "&:disabled": {
              color: "grey",
              backgroundColor: "transparent",
            },
          }}
          disabled={disabled}
        >
          <div
            style={{
              marginRight: "0.4rem",
              marginBottom: -5,
              color: disabled ? "grey" : "#fff",
            }}
          >
            {icon}
          </div>
          <Typography
            variant="body2"
            sx={{
              textTransform: "capitalize",
              color: "inherit",
            }}
          >
            {title}
          </Typography>
        </Button>
      </Link>
    );
  }
);