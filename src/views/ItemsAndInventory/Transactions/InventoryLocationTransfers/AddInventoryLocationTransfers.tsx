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
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { createStockMove, getStockMoves } from "../../../../api/StockMoves/StockMovesApi";
import { createAuditTrail } from "../../../../api/StockMoves/AuditTrailsApi";
import { createComment } from "../../../../api/Comments/CommentsApi";
import useCurrentUser from "../../../../hooks/useCurrentUser";
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

  const { user } = useCurrentUser();
  const userId = user?.id ?? (Number(localStorage.getItem("userId")) || 0);

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

  // Set reference when fiscal year loads (or fallback when DB empty)
  useEffect(() => {
    // Determine year: prefer fiscal year start if available, otherwise use current calendar year
    const year = currentFiscalYear
      ? new Date(currentFiscalYear.fiscal_year_from).getFullYear()
      : new Date().getFullYear();

    // Fetch existing references to generate next sequential number
    // Only consider stock moves of the same transaction type (16 = transfer)
    getStockMoves()
      .then((stockMoves) => {
        const moves = Array.isArray(stockMoves) ? stockMoves : [];
        const yearReferences = moves
          .filter((move: any) => move && move.type === 16 && move.reference && String(move.reference).endsWith(`/${year}`))
          .map((move: any) => String(move.reference))
          .map((ref: string) => {
            const match = String(ref).match(/^(\d{3})\/\d{4}$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((num: number) => !isNaN(num) && num > 0);

        const nextNumber = yearReferences.length > 0 ? Math.max(...yearReferences) + 1 : 1;
        const formattedNumber = nextNumber.toString().padStart(3, '0');
        setReference(`${formattedNumber}/${year}`);
      })
      .catch((error) => {
        console.error("Error fetching stock moves for reference generation:", error);
        // Fallback to 001 if there's an error or DB is empty
        setReference(`001/${year}`);
      });
  }, [currentFiscalYear]);
  const [rows, setRows] = useState<{
    id: number;
    itemCode: string;
    description: string;
    quantity: string;
    unit: string;
    qoh: number;
    selectedItemId: string | number | null;
  }[]>([
    {
      id: 1,
      itemCode: "",
      description: "",
      quantity: "",
      unit: "",
      qoh: 0,
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState("");
  const [processSuccess, setProcessSuccess] = useState(false);

  // Update QOH when from location changes
  useEffect(() => {
    if (fromLocation) {
      const updateQOH = async () => {
        try {
          const allStockMoves = await getStockMoves();
          setRows(prev => prev.map(row => {
            if (row.selectedItemId) {
              const itemStockMoves = allStockMoves.filter((move: any) => move.stock_id === row.selectedItemId && move.loc_code === fromLocation);
              const qoh = itemStockMoves.reduce((sum: number, move: any) => sum + (move.qty || 0), 0);
              return { ...row, qoh };
            }
            return row;
          }));
        } catch (error) {
          console.error("Error updating QOH:", error);
        }
      };
      updateQOH();
    } else {
      // Reset QOH if no from location
      setRows(prev => prev.map(row => ({ ...row, qoh: 0 })));
    }
  }, [fromLocation]);

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
        qoh: 0,
        selectedItemId: null as string | number | null,
      },
    ]);
  };

  //  Remove row (optional)
  const handleRemoveRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Process transfer
  const handleProcessTransfer = async () => {
    // Validation
    if (!fromLocation || !toLocation) {
      setProcessError("Please select both from and to locations.");
      return;
    }
    if (fromLocation === toLocation) {
      setProcessError("From and to locations cannot be the same.");
      return;
    }
    if (dateError) {
      setProcessError("Please fix the date error before proceeding.");
      return;
    }

    // Check if there are valid items with quantities
    const validRows = rows.filter(row => row.selectedItemId && parseFloat(row.quantity) > 0);
    if (validRows.length === 0) {
      setProcessError("Please add at least one item with quantity greater than 0.");
      return;
    }

    // Validate quantities do not exceed QOH
    const invalidRows = validRows.filter(row => parseFloat(row.quantity) > row.qoh);
    if (invalidRows.length > 0) {
      setProcessError("Transfer quantity cannot exceed quantity on hand for the following items: " + invalidRows.map(row => row.description).join(", "));
      return;
    }

    setIsProcessing(true);
    setProcessError("");
    setProcessSuccess(false);

    try {
      // Determine trans_no from reference (e.g., "001/2025" -> 1)
      const transNo = reference ? parseInt(String(reference).split("/")[0], 10) || 0 : 0;

      // Create stock moves for each valid row
      for (const row of validRows) {
        const quantity = parseFloat(row.quantity);

        // Stock move for reducing from location (negative quantity)
        await createStockMove({
          stock_id: row.selectedItemId,
          loc_code: fromLocation,
          tran_date: date,
          qty: -quantity,
          standard_cost: 0,
          reference: reference,
          memo: memo,
          type: 16,
          trans_no: transNo,
        });

        // Stock move for adding to location (positive quantity)
        await createStockMove({
          stock_id: row.selectedItemId,
          loc_code: toLocation,
          tran_date: date,
          qty: quantity,
          standard_cost: 0,
          reference: reference,
          memo: memo,
          type: 16,
          trans_no: transNo,
        });
      }

      setProcessSuccess(true);

      // Create audit trail entry for this transfer
      try {
        await createAuditTrail({
          type: 16,
          trans_no: transNo,
          user: userId,
          description: null,
          fiscal_year: currentFiscalYear?.id ?? null,
          gl_date: date,
          gl_seq: null,
        });
      } catch (err) {
        console.error("Failed to create audit trail for transfer", err);
      }

      // If memo was provided, save it to comments table (non-blocking)
      if (memo && String(memo).trim() !== "") {
        try {
          await createComment({
            type: 16,
            id: transNo,
            date_: date || null,
            memo_: memo,
          });
        } catch (err) {
          console.error("Failed to create comment for transfer", err);
        }
      }

      // Build payload to pass to success/view pages
      const payload = {
        reference,
        date,
        fromLocation,
        toLocation,
        items: rows
          .filter(row => row.selectedItemId && parseFloat(row.quantity) > 0)
          .map(r => ({
            itemCode: r.itemCode,
            description: r.description,
            quantity: r.quantity,
            unit: r.unit,
            selectedItemId: r.selectedItemId,
          })),
      };

      // Navigate to a transfer success page
      navigate(
        "/itemsandinventory/transactions/inventory-location-transfer/success",
        { state: payload }
      );
    } catch (error: any) {
      console.error("Error processing transfer:", error);
      setProcessError(error.response?.data?.message || "Error processing transfer. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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
              {locations.map((loc) => (
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
              {locations.map((loc) => (
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
                          // Fetch QOH from stock_moves if from location is selected
                          if (fromLocation) {
                            const allStockMoves = await getStockMoves();
                            const itemStockMoves = allStockMoves.filter((move: any) => move.stock_id === selectedItem.stock_id && move.loc_code === fromLocation);
                            const qoh = itemStockMoves.reduce((sum: number, move: any) => sum + (move.qty || 0), 0);
                            handleChange(row.id, "qoh", qoh);
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
                    value={row.qoh}
                    InputProps={{
                      readOnly: true,
                    }}
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
      <Box sx={{ mt: 2, pl: 1, pr: 1 }}>
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

      {/* Success/Error Messages */}
      {processSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Transfer processed successfully! Redirecting...
        </Alert>
      )}
      {processError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {processError}
        </Alert>
      )}

      {/*  Process Transfer Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pr: 1 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleProcessTransfer}
          disabled={!!dateError || isProcessing}
        >
          {isProcessing ? "Processing..." : "Process Transfer"}
        </Button>
      </Box>
    </Stack>
  );
}
