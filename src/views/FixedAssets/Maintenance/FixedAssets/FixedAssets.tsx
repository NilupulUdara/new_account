import React, { useState } from "react";
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
  ListSubheader,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import FixedAssetsGeneralSettingsForm from "./FixedAssetsGeneralSettings/FixedAssetsGeneralSettingsForm";
import UpdateFixedAssetsGeneralSettingsForm from "./FixedAssetsGeneralSettings/UpdateFixedAssetsGeneralSettingsForm";
import FixedAssetsTransactionsTable from "./Transactions/FixedAssetsTransactionsTable";
import FixedAssetsAttachmentsTable from "./Attachments/FixedAssetsAttachmentsTable";

// TabPanel helper
function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ mt: 2 }}>{children}</Box>}</div>;
}

const FixedAssets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(location.state?.tab || 0);

  // Item dropdown state
  const [selectedItem, setSelectedItem] = useState<string | number>(location.state?.selectedItem || "new");
  const [showInactive, setShowInactive] = useState(false);

  // Fetch items using React Query
  // const { data: items = [] } = useQuery<{ stock_id: string | number; category_id: string | number; description: string; inactive: number }[]>({
  //   queryKey: ["items"],
  //   queryFn: () => getItems() as Promise<{ stock_id: string | number; category_id: string | number; description: string; inactive: number }[]>,
  // });

  // Fetch categories using React Query
  // const { data: categories = [] } = useQuery<{ category_id: number; description: string }[]>({
  //   queryKey: ["itemCategories"],
  //   queryFn: () => getItemCategories() as Promise<{ category_id: number; description: string }[]>,
  // });

  // Fetch selected item data
  // const { data: selectedItemData } = useQuery({
  //   queryKey: ["item", selectedItem],
  //   queryFn: () => getItemById(selectedItem),
  //   enabled: selectedItem !== "new",
  // });

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Item select handler
  const handleItemChange = (value: string | number) => {
    setSelectedItem(value);
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
          Manage Fixed Assets
        </Typography>

        {/* Item dropdown and checkbox */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Select Fixed Asset</InputLabel>
            <Select
              value={selectedItem}
              label="Select Item"
              onChange={(e) => handleItemChange(e.target.value)}
            >
              <MenuItem value="new" key="new">
                + Add New Fixed Asset
              </MenuItem>

              {/* TODO: Add fixed assets options here when API is ready */}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
            }
            label="Show Inactive Fixed Assets"
          />
        </Stack>

        {/* Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/fixedassets/maintenance")}
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
        <Tab label="Transactions" disabled={selectedItem === "new"} />
        <Tab label="Attachments" disabled={selectedItem === "new"} />
      </Tabs>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {selectedItem === "new" ? (
          <FixedAssetsGeneralSettingsForm/>
        ) : (
          <UpdateFixedAssetsGeneralSettingsForm itemId={selectedItem} />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {selectedItem !== "new" && <FixedAssetsTransactionsTable itemId={selectedItem} />}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {selectedItem !== "new" && <FixedAssetsAttachmentsTable itemId={selectedItem} />}
      </TabPanel>
    </Stack>
  );
};

export default FixedAssets;
