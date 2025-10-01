import React from "react";
import {
  Stack,
  Paper,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import StoreIcon from "@mui/icons-material/Store";
import GroupIcon from "@mui/icons-material/Group";
import RepeatIcon from "@mui/icons-material/Repeat";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import MapIcon from "@mui/icons-material/Map";
import { useNavigate } from "react-router";
import DashboardCard from "../../../components/DashboardCard";

function ItemsMaintenance() {
  const navigate = useNavigate();

  // Mock items list, replace this with your actual state or API
  const items = [
    // { id: 1, name: "Laptop" },
    // { id: 2, name: "Notebook" },
  ];

  const allItems = [
    {
      text: "ITEMS",
      icon: <PersonAddIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/maintenance/items",
    },
    {
      text: "FOREIGN ITEM CODES",
      icon: <StoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/maintenance/foreign-item-codes",
    },
    {
      text: "SALES KITS",
      icon: <GroupIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/maintenance/sales-kits",
    },
    {
      text: "ITEM CATEGORIES",
      icon: <RepeatIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/maintenance/item-categories",
    },
    {
      text: "INVENTORY LOCATIONS",
      icon: <CategoryIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/maintenance/inventory-locations",
    },
    {
      text: "UNITS OF MEASURE",
      icon: <PersonIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/maintenance/units-of-measure",
    },
    {
      text: "REORDER LEVELS",
      icon: <MapIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/maintenance/reorder-levels",
    },
  ];

  const handleItemClick = (path: string, text: string) => {
    // Prevent navigating to Reorder Levels if no items
    if (text === "REORDER LEVELS" && items.length === 0) {
      alert("Please add an item first before accessing Reorder Levels!");
      return;
    }

    if (path) {
      navigate(path);
    } else {
      console.log(`Clicked: ${text} (No route defined)`);
    }
  };

  return (
    <Stack sx={{ minHeight: "100vh", backgroundColor: "#f0f0f0", p: 3 }}>
      <Grid container spacing={2}>
        {allItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <DashboardCard
              text={item.text}
              icon={item.icon}
              change={24}
              onClick={() => handleItemClick(item.path, item.text)}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default ItemsMaintenance;
