import React, { useState, useEffect, useMemo } from "react";
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
  TablePagination,
  Paper,
  TextField,
  MenuItem,
  Grid,
  useMediaQuery,
  Theme,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  ListSubheader,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getWorkOrders } from "../../../../api/WorkOrders/WorkOrderApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  reference: string;
  type: string;
  location: string;
  item: string;
  required: number;
  manufactured: number;
  date: string;
  requiredBy: string;
  closed?: number | boolean | string;
  released?: number | boolean | string;
}

export default function OutstandingWorkOrders() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [numberText, setNumberText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [location, setLocation] = useState("ALL_LOCATIONS");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [itemCode, setItemCode] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Queries
  const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: categories = [] } = useQuery<{ category_id: number; description: string }[]>({
    queryKey: ["itemCategories"],
    queryFn: () => getItemCategories() as Promise<{ category_id: number; description: string }[]>,
  });

  const filteredItems = (items || []).filter((it: any) => {
    const flag = it.mb_flag ?? it.mbFlag ?? it.mb ?? 0;
    return Number(flag) === 1;
  });

  useEffect(() => {
    if (!selectedItem) {
      setItemCode("");
      return;
    }
    const it = (filteredItems || []).find((i: any) => String(i.stock_id ?? i.id) === String(selectedItem));
    setItemCode(it ? String(it.stock_id ?? it.id ?? "") : "");
  }, [selectedItem, filteredItems]);

  // Work orders — ensure we refetch on mount so newly created WOs appear without a full reload
  const { data: workOrders = [], refetch: refetchWorkOrders } = useQuery({ queryKey: ["workOrders"], queryFn: getWorkOrders, refetchOnMount: "always", refetchOnWindowFocus: true });

  useEffect(() => {
    // explicit refetch on mount to cover navigation cases where the component may not fully remount
    if (typeof refetchWorkOrders === "function") refetchWorkOrders();
  }, [refetchWorkOrders]);

  const getTypeLabel = (t: any) => {
    const n = Number(t);
    if (n === 0) return "Assemble";
    if (n === 1) return "Unassemble";
    if (n === 2) return "Advanced Manufacture";
    return String(t ?? "");
  };

  const today = new Date().toISOString().split("T")[0];

  const rows: Row[] = useMemo(() => {
    if (!Array.isArray(workOrders)) return [];

    // Start with open work orders
    let filtered = workOrders.filter((w: any) => {
      if (w.closed === undefined || w.closed === null) return true;
      if (typeof w.closed === "boolean") return w.closed === false;
      return String(w.closed) === "0" || String(w.closed).toLowerCase() === "false";
    });

    // Apply search filters at raw record level for accuracy
    if (numberText && String(numberText).trim() !== "") {
      const num = String(numberText).trim();
      filtered = filtered.filter((w: any, idx: number) => {
        const idVal = String(w.id ?? w.wo_id ?? idx + 1);
        return idVal.includes(num);
      });
    }

    if (referenceText && String(referenceText).trim() !== "") {
      const rt = String(referenceText).trim().toLowerCase();
      filtered = filtered.filter((w: any) => String(w.wo_ref ?? w.reference ?? "").toLowerCase().includes(rt));
    }

    if (location && location !== "ALL_LOCATIONS") {
      filtered = filtered.filter((w: any) => String(w.loc_code ?? w.location ?? w.loc ?? "") === String(location));
    }

    if (selectedItem && selectedItem !== "ALL_ITEMS") {
      filtered = filtered.filter((w: any) => String(w.stock_id ?? w.stock ?? w.item_id ?? "") === String(selectedItem));
    }

    // optionally show only overdue (required by date has passed)
    if (onlyOverdue) {
      filtered = filtered.filter((w: any) => {
        const req = w.required_by ?? w.date_required_by ?? w.requiredBy ?? w.date_required ?? w.required_date ?? null;
        if (!req) return false;
        const reqDate = new Date(String(req));
        const todayDate = new Date();
        reqDate.setHours(0, 0, 0, 0);
        todayDate.setHours(0, 0, 0, 0);
        return todayDate > reqDate;
      });
    }

    // Map to Row[] for table rendering
    return filtered.map((w: any, idx: number) => {
      const locCode = w.loc_code ?? w.location ?? w.loc ?? "";
      const loc = (locations || []).find((l: any) => String(l.loc_code ?? l.loccode ?? l.code ?? "") === String(locCode));
      const itemRec = (items || []).find((it: any) => String(it.stock_id ?? it.id ?? it.stock_master_id ?? it.item_id ?? "") === String(w.stock_id ?? w.stock));
      return {
        id: w.id ?? w.wo_id ?? idx + 1,
        reference: w.wo_ref ?? w.reference ?? "",
        type: getTypeLabel(w.type),
        location: loc ? (loc.location_name ?? String(locCode)) : String(locCode),
        item: itemRec ? (itemRec.item_name ?? itemRec.name ?? itemRec.description ?? String(w.stock_id)) : String(w.stock_id ?? ""),
        required: Number(w.units_reqd ?? w.quantity ?? 0),
        manufactured: Number(w.units_issued ?? w.unitsIssued ?? 0),
        date: w.date ? String(w.date).split("T")[0] : (w.tran_date ?? today),
        requiredBy: w.required_by ?? w.date_required_by ?? w.requiredBy ?? "",
        released: w.released ?? w.is_released ?? w.released_flag ?? 0,
      } as Row;
    });
  }, [workOrders, items, locations, numberText, referenceText, location, selectedItem, onlyOverdue]);

  const paginatedRows = useMemo(() => {
    if (rowsPerPage === -1) return rows;
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    console.log("Outstanding Work Orders search", { numberText, referenceText, location, onlyOverdue, selectedItem });
  };

  const handleGL = (id: number) => {
    console.log("GL for", id);
  };

  const handleEdit = (id: number) => {
    navigate("/manufacturing/transactions/work-order-entry/update", { state: { id } });
  };

  const handleRelease = (id: number, reference?: string) => {
    navigate("/manufacturing/transactions/outstanding-work-orders/release", { state: { id, reference, action: "release" } });
  };

  const handleIssue = (id: number) => {
    navigate("/manufacturing/transactions/outstanding-work-orders/issue", { state: { id, action: "issue" } });
  };

  const handleCosts = (id: number) => {
    navigate("/manufacturing/transactions/outstanding-work-orders/costs", { state: { id, action: "costs" } });
  };

  const handleProduce = (id: number) => {
    navigate("/manufacturing/transactions/outstanding-work-orders/produce", { state: { id, action: "produce" } });
  };

  const handlePrint = (id: number) => {
    console.log("Print for", id);
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Search Outstanding Work Orders" />
          <Breadcrumb breadcrumbs={[{ title: "Transactions", href: "/manufacturing/transactions" }, { title: "Outstanding Work Orders" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/manufacturing/transactions')}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2} md={3}>
            <TextField fullWidth size="small" label="#" value={numberText} onChange={(e) => setNumberText(e.target.value)} />
          </Grid>

          <Grid item xs={12} sm={3} md={3}>
            <TextField fullWidth size="small" label="Reference" value={referenceText} onChange={(e) => setReferenceText(e.target.value)} />
          </Grid>

          <Grid item xs={12} sm={3} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="location-label">Location</InputLabel>
              <Select labelId="location-label" value={location} label="Location" onChange={(e) => setLocation(String(e.target.value))}>
                <MenuItem value="ALL_LOCATIONS">All Locations</MenuItem>
                {(locations || []).map((loc: any) => (
                  <MenuItem key={loc.loc_code} value={loc.loc_code}>{loc.location_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2} md={3}>
            <FormControlLabel control={<Checkbox checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} />} label="Only overdue" />
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Grid item xs={12} sm={3} md={3}>
            <TextField fullWidth size="small" label="Item Code" value={itemCode} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="item-label">Select Item</InputLabel>
              <Select labelId="item-label" value={selectedItem ?? ""} label="Select Item" onChange={(e) => setSelectedItem(String(e.target.value))}>
                <MenuItem value="ALL_ITEMS">All Items</MenuItem>
                {filteredItems && filteredItems.length > 0 ? (
                  (() => {
                    return Object.entries(
                      filteredItems.reduce((groups: Record<string, any[]>, item) => {
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
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2} md={3}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Manufactured</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Required by</TableCell>
              <TableCell align="center">GL</TableCell>
              <TableCell align="center">Edit</TableCell>
              <TableCell align="center">Actions</TableCell>
              <TableCell align="center">Print</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.reference}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.location}</TableCell>
                <TableCell>{r.item}</TableCell>
                <TableCell>{r.required}</TableCell>
                <TableCell>{r.manufactured}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.requiredBy}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleGL(r.id)}>GL</Button>
                </TableCell>
                <TableCell>
                  {(() => {
                    const closedVal = r.closed;
                    const isClosed = closedVal === true || String(closedVal) === "1" || String(closedVal).toLowerCase() === "true";
                    return isClosed ? (
                      <span>Closed</span>
                    ) : (
                      <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => handleEdit(r.id)}>Edit</Button>
                    );
                  })()}
                </TableCell>

                <TableCell>
                  {(() => {
                    const closedVal = r.closed;
                    const isClosed = closedVal === true || String(closedVal) === "1" || String(closedVal).toLowerCase() === "true";
                    if (isClosed) return null;
                    const rel = r.released;
                    const isReleased = rel === true || String(rel) === "1" || String(rel).toLowerCase() === "true";
                    if (!isReleased) {
                      return (
                        <Button variant="contained" size="small" onClick={() => handleRelease(r.id, r.reference)}>Release</Button>
                      );
                    }
                    return (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Button variant="outlined" size="small" onClick={() => handleIssue(r.id)}>Issue</Button>
                        <Button variant="outlined" size="small" onClick={() => handleCosts(r.id)}>Costs</Button>
                        <Button variant="outlined" size="small" onClick={() => handleProduce(r.id)}>Produce</Button>
                      </div>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={() => handlePrint(r.id)}>Print</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={13}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                showFirstButton
                showLastButton
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Stack>
  );
}
