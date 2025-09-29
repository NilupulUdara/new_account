import React from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import DashboardCard from "../../../../components/DashboardCard";
import SettingsIcon from "@mui/icons-material/Settings";
import ContactsIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";

const Suppliers = () => {
  const navigate = useNavigate();

  const customerItems = [
    { text: "General Settings", icon: <SettingsIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/purchase/maintenance/suppliers/general-settings" },
    { text: "Contacts", icon: <ContactsIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/purchase/maintenance/suppliers/contacts" },
    { text: "Transactions", icon: <ReceiptIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/purchase/maintenance/suppliers/transactions" },
    { text: "Purchase Orders", icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/purchase/maintenance/suppliers/purchases-orders" },
    { text: "Attachments", icon: <AttachFileIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/purchase/maintenance/suppliers/attachments" },
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
      spacing={3}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Manage Suppliers
        </Typography>

        {/* Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/purchase/maintenance")}
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

export default Suppliers;
