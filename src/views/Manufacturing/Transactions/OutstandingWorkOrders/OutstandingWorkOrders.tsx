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

  useEffect(() => {
    if (!selectedItem) {
      setItemCode("");
      return;
    }
    const it = (items || []).find((i: any) => String(i.stock_id ?? i.id) === String(selectedItem));
    setItemCode(it ? String(it.stock_id ?? it.id ?? "") : "");
  }, [selectedItem, items]);

  // Dummy rows
  const today = new Date().toISOString().split("T")[0];
  const rows: Row[] = [
    { id: 1, reference: "WO-001", type: "Assembly", location: "Warehouse A", item: "Item A", required: 100, manufactured: 50, date: today, requiredBy: "2025-12-01" },
    { id: 2, reference: "WO-002", type: "Packaging", location: "Warehouse B", item: "Item B", required: 200, manufactured: 150, date: today, requiredBy: "2025-12-02" },
  ];

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
    console.log("Edit for", id);
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

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
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
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
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
                  <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => handleEdit(r.id)}>Edit</Button>
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
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
                colSpan={16}
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
