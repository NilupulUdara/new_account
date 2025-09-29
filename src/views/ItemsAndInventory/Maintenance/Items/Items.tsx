import React from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import DashboardCard from "../../../../components/DashboardCard";
import SettingsIcon from "@mui/icons-material/Settings";
import ContactsIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Items = () => {
  const navigate = useNavigate();

  const customerItems = [
    { text: "General Settings", icon: <SettingsIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/itemsandinventory/maintenance/items/general-settings" },
    { text: "Sales Pricing", icon: <ReceiptIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/itemsandinventory/maintenance/items/sales-pricing" },
    { text: "Purchasing Pricing", icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/itemsandinventory/maintenance/items/purchasing-pricing" },
    { text: "Standard Costs", icon: <ContactsIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/itemsandinventory/maintenance/items/standard-costs" },
    { text: "Reoder Levels", icon: <AttachFileIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/itemsandinventory/maintenance/items/reorder-levels" },
    { text: "Transactions", icon: <AttachFileIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/itemsandinventory/maintenance/items/transactions" },
    { text: "Status", icon: <AttachFileIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/itemsandinventory/maintenance/items/status" },
    { text: "Attachmeents", icon: <AttachFileIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/itemsandinventory/maintenance/items/attachments" },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <Stack
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        p: { xs: 2, sm: 3, md: 5 }, // responsive padding
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography
          variant="h5"
          sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
        >
          Manage items
        </Typography>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/itemsandinventory/maintenance") }
        >
          Back
        </Button>
      </Box>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {customerItems.map((item, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={index}
          >
            <DashboardCard
              text={item.text}
              icon={item.icon}
              onClick={() => handleItemClick(item.path)}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default Items;
