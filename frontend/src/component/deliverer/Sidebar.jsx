import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FlexBetween from "./FlexBetween";
import {
  AdminPanelSettingsOutlined,
  BarChartOutlined,
  CalendarMonth,
  CalendarMonthOutlined,
  ChevronLeftOutlined,
  DriveEta,
  GroupOutlined,
  GroupWorkOutlined,
  Groups2Outlined,
  HomeOutlined,
  LocalShipping,
  Money,
  Payments,
  People,
  PieChartOutlined,
  PointOfSaleOutlined,
  ReceiptLongOutlined,
  StackedLineChartSharp,
  TodayOutlined,
  TrendingUpOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import { useSelector } from "react-redux";

const Sidebar = ({
  user,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const companyId = user && user.companyId;
  const daily = "/revenue-analytics/daily-data/";
  const monthly = "/revenue-analytics/monthly-data/";
  const breakdown = "/revenue-analytics/breakdown/";

  const navItems = [
    {
      text: "Dashboard",
      icon: <TodayOutlined />,
      name:
        user && user.role !== "Guard Admin" ? "dashboard" : "guard-dashboard",
    },

    {
      text: "Daily Visits",
      icon: <BarChartOutlined />,
      name: "daily-visits",
    },
    {
      text: "Axis Central",
      icon: null,
    },

    {
      text: "Walk-ins",
      icon: <CalendarMonthOutlined />,
      name: "visits",
    },
    //   {
    //     text: "Customers",
    //    icon: <Groups2Outlined />,
    //    name: "customers",
    //   },
    {
      text: "Clients",
      icon: <Groups2Outlined />,
      name: "contractors",
    },

    // {
    //     text: "Revenue",
    //    icon: null,
    //  },
    //  {
    //   text: "$ Overview",
    //   icon: <PointOfSaleOutlined />,
    //  name: "dash-revenue",
    //  },
    //   {
    //    text: "Daily",
    //    icon: <TodayOutlined />,
    //    name: `${daily}`,
    // },
    // {
    //    text: "Monthly",
    //    icon: <CalendarMonthOutlined />,
    //   name: `${monthly}`,
    // },
    //  {
    //    text: "Breakdown",
    //   icon: <PieChartOutlined />,
    //   name: `${breakdown}`,
    // },
    //Not YET
    //{
    //  text: "Payments",
    //   icon: <Payments />,
    //   name: "payments",
    //  },
    //  {
    //    text: "Reports",
    //    icon: <TrendingUpOutlined />,
    //    name: "performance",
    //  },
    {
      text: "Management",
      icon: null,
    },

    user && user.role === "Super Admin"
      ? {
          text: "Admins",
          icon: <AdminPanelSettingsOutlined />,
          name: "admins",
        }
      : {
          // Define properties for the else case here
        },
    user && user.role === "Super Admin"
      ? {
          text: "Providers",
          icon: <GroupWorkOutlined />,
          name: "deliverers",
        }
      : {},
  ];

  const { pathname } = useLocation();
  const [active, setActive] = useState();
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);
  return (
    <div component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          anchor="left"
          variant="persistent"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[300],
              backgroundColor: theme.palette.background.alt,
              boxSizing: "border-box",
              borderWidth: isNonMobile ? 0 : "1.5px",
              width: drawerWidth,
            },
          }}
        >
          {/**Part 1 */}
          <Box width={"100%"}>
            <Box m="1rem 2rem 2rem 3rem">
              <FlexBetween color={theme.palette.secondary.main}>
                <Box alignItems={"center"} gap="1.5rem" display={"flex"}>
                  <Typography variant="h3" fontWeight={"bold"}>
                    myAssistant
                  </Typography>
                </Box>

                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeftOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
            {user && user.role !== "Guard Admin" ? (
              <>
                <List>
                  {navItems.map(({ text, icon, name }) => {
                    if (!icon) {
                      return (
                        <Typography key={text} m="1.5rem 2rem 0rem 3rem">
                          {text}
                        </Typography>
                      );
                    }
                    const lcText = text.toLowerCase();
                    return (
                      <ListItem key={text} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            name === daily &&
                              navigate(
                                `/revenue-analytics/daily-data/${companyId}`
                              );
                            name === monthly &&
                              navigate(
                                `/revenue-analytics/monthly/${companyId}`
                              );
                            name === breakdown &&
                              navigate(
                                `/revenue-analytics/breakdown/${companyId}`
                              );
                            name !== daily &&
                              name !== monthly &&
                              name !== breakdown &&
                              navigate(`del-${name}`);
                          }}
                          sx={{
                            backgroundColor:
                              active === lcText
                                ? theme.palette.secondary[300]
                                : "transparent",
                            color:
                              active === lcText
                                ? theme.palette.primary[600]
                                : theme.palette.secondary[100],
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              ml: "2rem",
                              color:
                                active === lcText
                                  ? theme.palette.primary[600]
                                  : theme.palette.secondary[100],
                            }}
                          >
                            {icon}
                          </ListItemIcon>
                          <ListItemText primary={text} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </>
            ) : (
              <></>
            )}
          </Box>

          {/**Part 2 */}
          <Box width={"100%"} bottom={"0rem"}>
            <Divider />
            <FlexBetween
              display={"flex"}
              gap={"1.5rem"}
              m="1.5rem 2rem 0rem 2rem"
            >
              <IconButton>
                <Avatar
                  height={"20px"}
                  width={"20px"}
                  // borderRadius={"50%"}
                  sx={{ objectFit: "cover" }}
                />
              </IconButton>
              <Box>
                <Typography
                  fontWeight={"bold"}
                  fontSize={"0.7rem"}
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {user?.name}
                </Typography>
                <Typography
                  fontSize={"0.8rem"}
                  sx={{ color: theme.palette.secondary[200] }}
                >
                  {user?.role}
                </Typography>
              </Box>
            </FlexBetween>
          </Box>
        </Drawer>
      )}
    </div>
  );
};

export default Sidebar;
