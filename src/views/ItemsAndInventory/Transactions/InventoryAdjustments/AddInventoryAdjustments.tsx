import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItems, getItemById } from "../../../../api/Item/ItemApi";
import { getItemTypes } from "../../../../api/ItemType/ItemType";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { createStockMove } from "../../../../api/StockMoves/StockMovesApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function AddInventoryAdjustments() {
  const navigate = useNavigate();

  // Fetch locations
  const { data: locations = [] } = useQuery({
    queryKey: ["inventoryLocations"],
    queryFn: getInventoryLocations,
  });

  // Fetch items
  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: () => getItems() as Promise<{ stock_id: string | number; description: string; material_cost?: number }[]>,
  });

  // Fetch fiscal years
  const { data: fiscalYears = [] } = useQuery({
    queryKey: ["fiscalYears"],
    queryFn: getFiscalYears,
  });

  // Fetch item units
  const { data: itemUnits = [] } = useQuery({
    queryKey: ["itemUnits"],
    queryFn: getItemUnits,
  });

  // Fetch item types
  const { data: itemTypes = [] } = useQuery({
    queryKey: ["itemTypes"],
    queryFn: getItemTypes,
  });

  // Filter items to exclude those with item_type "Service"
  const filteredItems = useMemo(() => {
    const serviceType = itemTypes.find((type: any) => type.name === "Service");
    if (!serviceType) return items;
    return items.filter((item: any) => item.mb_flag !== serviceType.id);
  }, [items, itemTypes]);

  // Find current fiscal year (not closed and contains today's date)
  const currentFiscalYear = useMemo(() => {
    const today = new Date();
    const openFiscalYears = fiscalYears.filter((fy: any) => !fy.isClosed);

    // First try to find fiscal year that contains today's date
    const currentFY = openFiscalYears.find((fy: any) => {
      const from = new Date(fy.fiscal_year_from);
      const to = new Date(fy.fiscal_year_to);
      return today >= from && today <= to;
    });

    // If no fiscal year contains today's date, use the first open one
    return currentFY || openFiscalYears[0];
  }, [fiscalYears]);

  //  Table data
  const [rows, setRows] = useState([
    {
      id: 1,
      itemCode: "",
      description: "",
      qoh: 0,
      quantity: "",
      unit: "",
      unitCost: 0,
      total: 0,
      selectedItemId: null as string | number | null,
    },
  ]);

  //  Form fields
  const [memo, setMemo] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [reference, setReference] = useState("");
  const [dateError, setDateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Set reference when fiscal year loads
  useEffect(() => {
    if (currentFiscalYear) {
      const year = new Date(currentFiscalYear.fiscal_year_from).getFullYear();
      setReference(`001/${year}`);
    }
  }, [currentFiscalYear]);

  // Validate date is within fiscal year
  const validateDate = (selectedDate: string) => {
    if (!currentFiscalYear) {
      setDateError("No active fiscal year found");
      return false;
    }

    const selected = new Date(selectedDate);
    const from = new Date(currentFiscalYear.fiscal_year_from);
    const to = new Date(currentFiscalYear.fiscal_year_to);

    if (selected < from || selected > to) {
      setDateError(`Date must be within the fiscal year (${from.toLocaleDateString()} - ${to.toLocaleDateString()})`);
      return false;
    }

    setDateError("");
    return true;
  };

  // Handle date change with validation
  const handleDateChange = (value: string) => {
    setDate(value);
    validateDate(value);
  };

  //  Handle input change in table
  const handleChange = (id: number, field: string, value: any) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
            ...row,
            [field]: value,
            total:
              field === "quantity" || field === "unitCost"
                ? (field === "quantity" ? value : row.quantity) *
                (field === "unitCost" ? value : row.unitCost)
                : row.total,
          }
          : row
      )
    );
  };

  //  Add new row
  const handleAddItem = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        itemCode: "",
        description: "",
        qoh: 0,
        quantity: "",
        unit: "",
        unitCost: 0,
        total: 0,
        selectedItemId: null as string | number | null,
      },
    ]);
  };

  //  Remove row (optional)
  const handleRemoveRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Save inventory adjustments
  const handleSaveAdjustment = async () => {
    // Validation
    if (!location) {
      setSaveError("Please select a location");
      return;
    }
    if (!date) {
      setSaveError("Please select a date");
      return;
    }
    if (rows.length === 0 || rows.every(row => !row.selectedItemId || !row.quantity)) {
      setSaveError("Please add at least one item with quantity");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      // Create stock moves for each row
      const stockMoves = rows
        .filter(row => row.selectedItemId && row.quantity)
        .map(row => ({
          stock_id: row.selectedItemId,
          loc_code: location,
          date: date,
          qty: parseFloat(row.quantity.toString()),
          standard_cost: row.unitCost,
          reference: reference,  // Add reference
        }));

      // Save all stock moves
      await Promise.all(
        stockMoves.map(move => createStockMove(move))
      );

      setSaveSuccess(true);
      // Optionally reset form or navigate
      setTimeout(() => {
        navigate(-1); // Go back to previous page
      }, 2000);

    } catch (error: any) {
      console.error("Error saving inventory adjustments:", error);
      setSaveError(error.response?.data?.message || "Failed to save inventory adjustments");
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Inventory Adjustments" },
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
          <PageTitle title="Add Inventory Adjustments" />
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

      {/*  Location, Date, and Reference Fields */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* Location Dropdown */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              size="small"
            >
              {locations.map((loc) => (
                <MenuItem key={loc.loc_code} value={loc.loc_code}>
                  {loc.location_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Date Field */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              size="small"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!dateError}
              helperText={dateError}
            />
          </Grid>

          {/* Reference Field */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Reference"
              fullWidth
              size="small"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter reference"
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/*  Table */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Item Description</TableCell>
              <TableCell>QOH</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Unit Cost</TableCell>
              <TableCell>Total</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id} hover data-row-id={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.itemCode}
                    onChange={(e) =>
                      handleChange(row.id, "itemCode", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={row.description}
                    onChange={async (e) => {
                      const selectedItem = filteredItems.find(item => item.description === e.target.value);
                      handleChange(row.id, "description", e.target.value);
                      if (selectedItem) {
                        handleChange(row.id, "itemCode", selectedItem.stock_id);
                        handleChange(row.id, "selectedItemId", selectedItem.stock_id);
                        // Fetch item details to get material_cost and unit
                        try {
                          const itemData = await getItemById(selectedItem.stock_id);
                          if (itemData) {
                            if (itemData.material_cost !== undefined) {
                              handleChange(row.id, "unitCost", itemData.material_cost);
                            }
                            if (itemData.units !== undefined) {
                              const unit = itemUnits.find((u: any) => u.id === itemData.units);
                              const unitDescription = unit?.description || unit?.name || itemData.units;
                              handleChange(row.id, "unit", unitDescription || "");
                            }
                          }
                        } catch (error) {
                          console.error("Error fetching item data:", error);
                        }
                      }
                    }}
                  >
                    {filteredItems.map((item) => (
                      <MenuItem key={item.stock_id} value={item.description}>
                        {item.description}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.qoh}
                    onChange={(e) =>
                      handleChange(row.id, "qoh", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.quantity}
                    onChange={(e) =>
                      handleChange(row.id, "quantity", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.unit}
                    onChange={(e) =>
                      handleChange(row.id, "unit", e.target.value)
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.unitCost}
                    onChange={(e) =>
                      handleChange(row.id, "unitCost", Number(e.target.value))
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography>{Number(row.total).toFixed(2)}</Typography>
                </TableCell>
                <TableCell align="center">
                  {index === rows.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddItem}
                    >
                      Add
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          // Focus on the first editable field (item code)
                          const rowElement = document.querySelector(`[data-row-id="${row.id}"]`);
                          if (rowElement) {
                            const firstInput = rowElement.querySelector('input') as HTMLInputElement;
                            if (firstInput) firstInput.focus();
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleRemoveRow(row.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={9}>
                <Typography align="right" sx={{ pr: 2, fontWeight: 600 }}>
                  Grand Total:{" "}
                  {rows
                    .reduce((sum, r) => sum + Number(r.total), 0)
                    .toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/*  Memo Field */}
      <Box sx={{ mt: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Memo:</Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Enter memo or notes..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </Box>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Inventory adjustments saved successfully! Redirecting...
        </Alert>
      )}
      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {saveError}
        </Alert>
      )}

      {/*  Submit Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!!dateError || isSaving}
          onClick={handleSaveAdjustment}
        >
          {isSaving ? "Saving..." : "Process Adjustment"}
        </Button>
      </Box>
    </Stack>
  );
}
