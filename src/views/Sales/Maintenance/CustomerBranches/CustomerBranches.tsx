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

const CustomersBranches = () => {
  const navigate = useNavigate();

  const customerBranchesItems = [
    { text: "General Settings", icon: <SettingsIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/sales/maintenance/customer-branches/general-settings" },
    { text: "Contacts", icon: <ContactsIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/sales/maintenance/customer-branches/branches-contacts" },
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
          Customer Branches
        </Typography>

        {/* Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/sales/maintenance")}
        >
          Back
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {customerBranchesItems.map((item, index) => (
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

export default CustomersBranches;
