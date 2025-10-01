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
import { getSuppliers } from "../../../../api/Supplier/SupplierApi"; // replace with your API

// Import your supplier-specific components
import GeneralSettingsForm from "./GeneralSettings/SupplierGeneralSettingsForm";
import UpdateGeneralSettingsForm from "./GeneralSettings/UpdateSupplierGeneralSettingsForm";
import SuppliersContactsTable from "./Contacts/SuppliersContactsTable";
import TransactionsTable from "./Transactions/SuppliersTransactionsTable";
import PurchaseOrdersTable from "./PurchaseOrders/SupplierPurchaseOrders";
import AttachmentsTable from "./Attachments/SuppliersAttachmentsTable";

// TabPanel helper
function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ mt: 2 }}>{children}</Box>}</div>;
}

const AddAndManageSuppliers = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Supplier dropdown state
  const [suppliers, setSuppliers] = useState<{ id: string | number; supplier_name: string }[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | number>("new"); // default 'new'

  // Fetch suppliers from backend
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSuppliers();
  }, []);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Supplier select handler
  const handleSupplierChange = (value: string | number) => {
    setSelectedSupplier(value);
    setTabValue(0); // always switch to General Settings tab
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
          Manage Suppliers
        </Typography>

        {/* Supplier dropdown */}
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Select Supplier</InputLabel>
          <Select
            value={selectedSupplier}
            label="Select Supplier"
            onChange={(e) => handleSupplierChange(e.target.value)}
          >
            <MenuItem value="new" key="new">
              + Add New Supplier
            </MenuItem>
            {suppliers.map((supplier) => (
              <MenuItem key={supplier.id} value={supplier.id}>
                {supplier.supplier_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Back Button */}
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/purchase/maintenance")}>
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
        <Tab label="Contacts" disabled={selectedSupplier === "new"} />
        <Tab label="Transactions" disabled={selectedSupplier === "new"} />
        <Tab label="Purchase Orders" disabled={selectedSupplier === "new"} />
        <Tab label="Attachments" disabled={selectedSupplier === "new"} />
      </Tabs>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {selectedSupplier === "new" ? (
          <GeneralSettingsForm />
        ) : (
          <UpdateGeneralSettingsForm supplierId={selectedSupplier} />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {selectedSupplier !== "new" && <SuppliersContactsTable supplierId={selectedSupplier} />}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {selectedSupplier !== "new" && <TransactionsTable supplierId={selectedSupplier} />}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {selectedSupplier !== "new" && <PurchaseOrdersTable supplierId={selectedSupplier} />}
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {selectedSupplier !== "new" && <AttachmentsTable supplierId={selectedSupplier} />}
      </TabPanel>
    </Stack>
  );
};

export default AddAndManageSuppliers;
