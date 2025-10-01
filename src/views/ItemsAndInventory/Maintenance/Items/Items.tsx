import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
// import { getItems } from "../../../../../api/Item/ItemApi";

// Import item-specific components
import ItemGeneralSettingsForm from "./ItemsGeneralSettings/ItemsGeneralSettingsForm";
import UpdateItemGeneralSettingsForm from "./ItemsGeneralSettings/UpdateItemsGeneralSettingsForm";
import SalesPricingTable from "./SalesPricing/SalesPricingTable";
import PurchasingPricingTable from "./PurchasingPricing/PurchasingPricingTable";
import AddStandardCostForm from "./StandardCosts/AddStandardCostForm";
import ReOrderLevelsForm from "./ReOrderLevels/ReOrderLevelsForm";
import ItemTransactionsTable from "./Transactions/ItemTransactionsTable";
import StatusTable from "./Status/StatusTable";
import ItemAttachmentsTable from "./Attachments/ItemAttachmentsTable";

// TabPanel helper
function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ mt: 2 }}>{children}</Box>}</div>;
}

const Items = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Item dropdown state
  const [items, setItems] = useState<{ id: string | number; item_name: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | number>("new");

  // Fetch items from backend
  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const data = await getItems();
  //       setItems(data);
  //     } catch (error) {
  //       console.error("Failed to load items:", error);
  //     }
  //   };
  //   fetchItems();
  // }, []);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Item select handler
  const handleItemChange = (value: string | number) => {
    setSelectedItem(value);
    setTabValue(0); // always reset to General Settings
  };

  return (
    <Stack sx={{ minHeight: "100vh", backgroundColor: "#f0f0f0", p: { xs: 2, sm: 3, md: 5 } }} spacing={3}>
      
      {/* Header + Dropdown + Back */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Manage Items
        </Typography>

        {/* Item dropdown */}
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Select Item</InputLabel>
          <Select
            value={selectedItem}
            label="Select Item"
            onChange={(e) => handleItemChange(e.target.value)}
          >
            <MenuItem value="new" key="new">
              + Add New Item
            </MenuItem>
            {items.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.item_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/itemsandinventory/maintenance")}
        >
          Back
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
        sx={{ backgroundColor: "#fff", borderRadius: 1 }}
      >
        <Tab label="General Settings" />
        <Tab label="Sales Pricing" disabled={selectedItem === "new"} />
        <Tab label="Purchasing Pricing" disabled={selectedItem === "new"} />
        <Tab label="Standard Costs" disabled={selectedItem === "new"} />
        <Tab label="Reorder Levels" disabled={selectedItem === "new"} />
        <Tab label="Transactions" disabled={selectedItem === "new"} />
        <Tab label="Status" disabled={selectedItem === "new"} />
        <Tab label="Attachments" disabled={selectedItem === "new"} />
      </Tabs>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {selectedItem === "new" ? (
          <ItemGeneralSettingsForm />
        ) : (
          <UpdateItemGeneralSettingsForm itemId={selectedItem} />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {selectedItem !== "new" && <SalesPricingTable itemId={selectedItem} />}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {selectedItem !== "new" && <PurchasingPricingTable itemId={selectedItem} />}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {selectedItem !== "new" && <AddStandardCostForm itemId={selectedItem} />}
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {selectedItem !== "new" && <ReOrderLevelsForm itemId={selectedItem} />}
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        {selectedItem !== "new" && <ItemTransactionsTable itemId={selectedItem} />}
      </TabPanel>

      <TabPanel value={tabValue} index={6}>
        {selectedItem !== "new" && <StatusTable itemId={selectedItem} />}
      </TabPanel>

      <TabPanel value={tabValue} index={7}>
        {selectedItem !== "new" && <ItemAttachmentsTable itemId={selectedItem} />}
      </TabPanel>
    </Stack>
  );
};

export default Items;
