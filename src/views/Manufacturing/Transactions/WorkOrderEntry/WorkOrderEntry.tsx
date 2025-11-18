import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Alert,
  ListSubheader,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
// import { getGLAccounts } from "../../../../api/GLAccounts/GLAccountsApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { set } from "date-fns";

export default function WorkOrderEntry() {
  const navigate = useNavigate();

  // Queries
  const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: categories = [] } = useQuery<{ category_id: number; description: string }[]>({
    queryKey: ["itemCategories"],
    queryFn: () => getItemCategories() as Promise<{ category_id: number; description: string }[]>,
  });
  const { data: chartMasters = [] } = useQuery({
    queryKey: ["chartMasters"],
    queryFn: () => import("../../../../api/GLAccounts/ChartMasterApi").then(m => m.getChartMasters()),
  });

  // Map of account type ids to descriptive text (used to group the dropdown)
  const accountTypeMap: Record<string, string> = {
    "1": "Current Assets",
    "2": "Inventory Assets",
    "3": "Capital Assets",
    "4": "Current Liabilities",
    "5": "Long Term Liabilities",
    "6": "Share Capital",
    "7": "Retained Earnings",
    "8": "Sales Revenue",
    "9": "Other Revenue",
    "10": "Cost of Good Sold",
    "11": "Payroll Expenses",
    "12": "General and Adminitrative Expenses",
  };

  // Group chart masters by descriptive account type for the select dropdown
  const groupedChartMasters = useMemo(() => {
    const groups: Record<string, any[]> = {};
    (chartMasters as any[]).forEach((acc: any) => {
      const typeText = accountTypeMap[String(acc.account_type)] || "Unknown";
      if (!groups[typeText]) groups[typeText] = [];
      groups[typeText].push(acc);
    });
    // sort each group's accounts by account_code for stable order
    Object.values(groups).forEach((arr) => arr.sort((a: any, b: any) => (String(a.account_code || "")).localeCompare(String(b.account_code || ""))));
    return groups;
  }, [chartMasters]);

  // Form fields
  const [reference, setReference] = useState("");
  const [type, setType] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [labourCost, setLabourCost] = useState("0.00");
  const [creditLabourAccount, setCreditLabourAccount] = useState("");
  const [overheadCost, setOverheadCost] = useState("0.00");
  const [creditOverheadAccount, setCreditOverheadAccount] = useState("");
  const [memo, setMemo] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [openLabourAccountSelect, setOpenLabourAccountSelect] = useState(false);
  const [openOverheadAccountSelect, setOpenOverheadAccountSelect] = useState(false);

  // Update item code when selected item changes
  useEffect(() => {
    if (!selectedItem) {
      setItemCode("");
      return;
    }
    const it = (items || []).find((i: any) => String(i.stock_id ?? i.id) === String(selectedItem));
    setItemCode(it ? String(it.stock_id ?? it.id ?? "") : "");
  }, [selectedItem, items]);

  const handleAddWorkOrder = async () => {
    // Validation
    if (!reference) {
      setSaveError("Please enter a reference");
      return;
    }
    if (!type) {
      setSaveError("Please select a type");
      return;
    }
    if (!selectedItem) {
      setSaveError("Please select an item");
      return;
    }
    if (!destinationLocation) {
      setSaveError("Please select a destination location");
      return;
    }
    if (!quantity) {
      setSaveError("Please enter the quantity");
      return;
    }
    if (!date) {
      setSaveError("Please select a date");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const payload = {
        reference,
        type,
        itemCode,
        selectedItem,
        destinationLocation,
        quantity,
        date,
        labourCost,
        creditLabourAccount,
        overheadCost,
        creditOverheadAccount,
        memo,
      };

      console.log("Prepared work order payload:", payload);
      // TODO: Save to API
      navigate("/manufacturing/transactions/work-order-entry/success", { state: { reference } });
    } catch (error: any) {
      console.error("Error preparing work order payload:", error);
      setSaveError(error?.message || "Failed to prepare work order");
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Work Order Entry" },
  ];

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <PageTitle title="Work Order Entry" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>

      {/* Work Order Form */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Reference"
              fullWidth
              size="small"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Type"
              fullWidth
              size="small"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="Assemble">Assemble</MenuItem>
              <MenuItem value="Unassemble">Unassemble</MenuItem>
              <MenuItem value="Advanced Manufacture">Advanced Manufacture</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Item Code"
                  fullWidth
                  size="small"
                  value={itemCode}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Select Item"
                  fullWidth
                  size="small"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                >
                  <MenuItem value="">Select item</MenuItem>
                  {items && items.length > 0 ? (
                    (() => {
                      return Object.entries(
                        items.reduce((groups: Record<string, any[]>, item) => {
                          const catId = item.category_id || "Uncategorized";
                          if (!groups[catId]) groups[catId] = [];
                          groups[catId].push(item);
                          return groups;
                        }, {} as Record<string, any[]>)
                      ).map(([categoryId, groupedItems]: [string, any[]]) => {
                        const category = categories.find(cat => cat.category_id === Number(categoryId));
                        const categoryLabel = category ? category.description : `Category ${categoryId}`;
                        return [
                          <ListSubheader key={`cat-${categoryId}`}>
                            {categoryLabel}
                          </ListSubheader>,
                          groupedItems.map((item) => {
                            const stockId = item.stock_id ?? item.id ?? item.stock_master_id ?? item.item_id ?? 0;
                            const key = stockId;
                            const label = item.item_name ?? item.name ?? item.description ?? String(stockId);
                            const value = String(stockId);
                            return (
                              <MenuItem key={String(key)} value={value}>
                                {label}
                              </MenuItem>
                            );
                          })
                        ];
                      });
                    })()
                  ) : (
                    <MenuItem disabled value="">
                      No items
                    </MenuItem>
                  )}
                </TextField>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Destination Location"
              fullWidth
              size="small"
              value={destinationLocation}
              onChange={(e) => setDestinationLocation(e.target.value)}
            >
              <MenuItem value="">Select location</MenuItem>
              {(locations || []).map((loc: any) => (
                <MenuItem key={loc.loc_code} value={loc.loc_code}>{loc.location_name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Quantity"
              fullWidth
              size="small"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Labour Cost"
              fullWidth
              size="small"
              type="number"
              value={labourCost}
              onChange={(e) => setLabourCost(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Credit Labour Account"
              fullWidth
              size="small"
              value={creditLabourAccount}
              onChange={(e) => {
                setCreditLabourAccount(e.target.value);
                setOpenLabourAccountSelect(false);
              }}
              SelectProps={{
                open: openLabourAccountSelect,
                onOpen: () => setOpenLabourAccountSelect(true),
                onClose: () => setOpenLabourAccountSelect(false),
                renderValue: (value: any) => {
                  if (!value) return "";
                  const found = (chartMasters as any[]).find((c: any) => String(c.account_code) === String(value));
                  return found ? `${found.account_name} - ${found.account_code}` : String(value);
                },
              }}
            >
              <MenuItem value="" onClick={() => {
                setCreditLabourAccount("");
                setOpenLabourAccountSelect(false);
              }}>
                Select account
              </MenuItem>
              {Object.entries(groupedChartMasters).map(([typeText, accounts]) => (
                <React.Fragment key={typeText}>
                  <ListSubheader>{typeText}</ListSubheader>
                  {accounts.map((acc: any) => (
                    <MenuItem
                      key={String(acc.account_code)}
                      value={String(acc.account_code)}
                      onClick={() => {
                        setCreditLabourAccount(String(acc.account_code));
                        setOpenLabourAccountSelect(false);
                      }}
                    >
                      {acc.account_name} {acc.account_code ? ` - ${acc.account_code}` : ""}
                    </MenuItem>
                  ))}
                </React.Fragment>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Overhead Cost"
              fullWidth
              size="small"
              type="number"
              value={overheadCost}
              onChange={(e) => setOverheadCost(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Credit Overhead Account"
              fullWidth
              size="small"
              value={creditOverheadAccount}
              onChange={(e) => setCreditOverheadAccount(e.target.value)}
              SelectProps={{
                open: openOverheadAccountSelect,
                onOpen: () => setOpenOverheadAccountSelect(true),
                onClose: () => setOpenOverheadAccountSelect(false),
                renderValue: (value: any) => {
                  if (!value) return "";
                  const found = (chartMasters as any[]).find((c: any) => String(c.account_code) === String(value));
                  return found ? `${found.account_name} - ${found.account_code}` : String(value);
                },
              }}
            >
              <MenuItem value="" onClick={() => {
                setCreditOverheadAccount("");
                setOpenOverheadAccountSelect(false);
              }}>
                Select account
              </MenuItem>
              {Object.entries(groupedChartMasters).map(([typeText, accounts]) => (
                <React.Fragment key={typeText}>
                  <ListSubheader>{typeText}</ListSubheader>
                  {accounts.map((acc: any) => (
                    <MenuItem
                      key={String(acc.account_code)}
                      value={String(acc.account_code)}
                      onClick={() => {
                        setCreditOverheadAccount(String(acc.account_code));
                        setOpenOverheadAccountSelect(false);
                      }}
                    >
                      {acc.account_name} {acc.account_code ? ` - ${acc.account_code}` : ""}
                    </MenuItem>
                  ))}
                </React.Fragment>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Memo"
              fullWidth
              multiline
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Enter memo or notes..."
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Success/Error Messages */}
      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {saveError}
        </Alert>
      )}

      {/* Submit Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={isSaving}
          onClick={handleAddWorkOrder}
        >
          {isSaving ? "Adding..." : "Add Work Order"}
        </Button>
      </Box>
    </Stack>
  );
}
