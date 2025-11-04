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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItems, getItemById } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function AddInventoryLocationTransfers() {
  const navigate = useNavigate();

  // Fetch locations
  const { data: locations = [] } = useQuery({
    queryKey: ["inventoryLocations"],
    queryFn: getInventoryLocations,
  });

  // Fetch items
  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: () => getItems() as Promise<{ stock_id: string | number; description: string }[]>,
  });

  // Fetch item units
  const { data: itemUnits = [] } = useQuery({
    queryKey: ["itemUnits"],
    queryFn: getItemUnits,
  });

  // Fetch fiscal years
  const { data: fiscalYears = [] } = useQuery({
    queryKey: ["fiscalYears"],
    queryFn: getFiscalYears,
  });

  // Find current fiscal year
  const currentFiscalYear = useMemo(() => {
    const now = new Date();
    return fiscalYears.find((fy: any) => 
      !fy.isClosed && 
      new Date(fy.fiscal_year_from) <= now && 
      now <= new Date(fy.fiscal_year_to)
    );
  }, [fiscalYears]);

  // Validate date
  const validateDate = (selectedDate: string) => {
    if (!currentFiscalYear) {
      setDateError("No active fiscal year found.");
      return;
    }
    const selected = new Date(selectedDate);
    const start = new Date(currentFiscalYear.fiscal_year_from);
    const end = new Date(currentFiscalYear.fiscal_year_to);
    if (selected < start || selected > end) {
      setDateError("Date must be within the fiscal year.");
    } else {
      setDateError("");
    }
  };

  // Validate date on fiscal year load
  useEffect(() => {
    if (currentFiscalYear) {
      validateDate(date);
    }
  }, [currentFiscalYear]);
  const [rows, setRows] = useState<{
    id: number;
    itemCode: string;
    description: string;
    quantity: string;
    unit: string;
    selectedItemId: string | number | null;
  }[]>([
    {
      id: 1,
      itemCode: "",
      description: "",
      quantity: "",
      unit: "",
      selectedItemId: null,
    },
  ]);

  //  Form fields
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [memo, setMemo] = useState("");
  const [dateError, setDateError] = useState("");

  //  Handle table field changes
  const handleChange = (id: number, field: string, value: any) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
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
        quantity: "", 
        unit: "",
        selectedItemId: null as string | number | null,
      },
    ]);
  };

  //  Remove row (optional)
  const handleRemoveRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Inventory Location Transfers" },
  ];

  return (
    <Stack spacing={2}>
      {/*  Header */}
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
          <PageTitle title="Add Inventory Location Transfers" />
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

      {/*  From/To Location, Date, Reference */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* From Location */}
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="From Location"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              size="small"
            >
              {locations.filter(loc => loc.loc_code !== toLocation).map((loc) => (
                <MenuItem key={loc.loc_code} value={loc.loc_code}>
                  {loc.location_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* To Location */}
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="To Location"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              size="small"
            >
              {locations.filter(loc => loc.loc_code !== fromLocation).map((loc) => (
                <MenuItem key={loc.loc_code} value={loc.loc_code}>
                  {loc.location_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Date */}
          <Grid item xs={12} sm={3}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              size="small"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                validateDate(e.target.value);
              }}
              error={!!dateError}
              helperText={dateError}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Reference */}
          <Grid item xs={12} sm={3}>
            <TextField
              label="Reference"
              fullWidth
              size="small"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter reference"
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
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
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
                    onChange={(e) => handleChange(row.id, "itemCode", e.target.value)}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={row.description}
                    onChange={async (e) => {
                      const selectedItem = items.find(item => item.description === e.target.value);
                      handleChange(row.id, "description", e.target.value);
                      if (selectedItem) {
                        handleChange(row.id, "itemCode", selectedItem.stock_id);
                        handleChange(row.id, "selectedItemId", selectedItem.stock_id);
                        // Fetch item details to get unit
                        try {
                          const itemData = await getItemById(selectedItem.stock_id);
                          if (itemData && itemData.units !== undefined) {
                            const unit = itemUnits.find((u: any) => u.id === itemData.units);
                            const unitDescription = unit?.description || unit?.name || itemData.units;
                            handleChange(row.id, "unit", unitDescription || "");
                          }
                        } catch (error) {
                          console.error("Error fetching item data:", error);
                        }
                      }
                    }}
                  >
                    {items.map((item) => (
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
                    onChange={(e) => handleChange(row.id, "unit", e.target.value)}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
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
                          // Focus on the first editable field (description)
                          const rowElement = document.querySelector(`[data-row-id="${row.id}"]`);
                          if (rowElement) {
                            const firstInput = rowElement.querySelector('input:not([readonly])') as HTMLInputElement;
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
        </Table>
      </TableContainer>

      {/*  Memo Field */}
      <Box sx={{ mt: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Memo:</Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Enter memo or notes..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </Box>

      {/*  Process Transfer Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" color="primary">
          Process Transfer
        </Button>
      </Box>
    </Stack>
  );
}
