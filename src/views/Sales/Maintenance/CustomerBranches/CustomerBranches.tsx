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
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
// Import your branch-specific components
import CustomerBranchesTable from "./GeneralSettings/CustomerBranchesTable";
import ContactsTable from "./Contacts/ContactsTable";
import UpdateGeneralSettingsForm from "./GeneralSettings/UpdateCustomerBranchesGeneralSettingForm";
// TabPanel helper
function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ mt: 2 }}>{children}</Box>}</div>;
}

const CustomersBranches = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Customer dropdown state
  const [customers, setCustomers] = useState<{ debtor_no: string | number; name: string }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | number>("new"); // default 'new'

  // Fetch customers from database
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCustomers();
  }, []);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Customer select handler
  const handleCustomerChange = (value: string | number) => {
    setSelectedCustomer(value);
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
          Customer Branches
        </Typography>

        {/* Customer dropdown */}
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Select Customer</InputLabel>
          <Select
            value={selectedCustomer}
            label="Select Customer"
            onChange={(e) => handleCustomerChange(e.target.value)}
          >
            {customers.map((customer) => (
              <MenuItem key={customer.debtor_no} value={customer.debtor_no}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>


        {/* Back Button */}
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/sales/maintenance")}>
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
        <Tab label="Contacts" disabled={selectedCustomer === "new"} />
      </Tabs>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {selectedCustomer && (
          <CustomerBranchesTable customerId={selectedCustomer} />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {selectedCustomer && 
        (
        <ContactsTable customerId={selectedCustomer} />
        )}
      </TabPanel>
      
    </Stack>
  );
};

export default CustomersBranches;
