import React, { useState, useEffect } from "react";
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
  Typography,
  MenuItem,
  Grid,
  useMediaQuery,
  Theme,
  FormControl,
  InputLabel,
  Select,
  ListSubheader,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  orderNo: string;
  ref: string;
  customer: string;
  branch: string;
  custOrderRef: string;
  orderDate: string;
  requiredBy: string;
  deliveryTo: string;
  orderTotal: number | string;
  currency: string;
}

export default function DeliveryAgainstSalesOrders() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch lookup data
  const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const { data: categories = [] } = useQuery({ queryKey: ["itemCategories"], queryFn: () => getItemCategories() });

  // Header fields
  const [numberText, setNumberText] = useState(""); // '#'
  const [referenceText, setReferenceText] = useState(""); // 'ref'
  const [location, setLocation] = useState("ALL_LOCATIONS");
  const [selectedItem, setSelectedItem] = useState("ALL_ITEMS");
  const [itemCode, setItemCode] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("ALL_CUSTOMERS");

  // Table shows dummy sample rows (do not display selected header values).
  const today = new Date().toISOString().split("T")[0];
  const rows: Row[] = [
    {
      id: 1,
      orderNo: "TD-001",
      ref: "REF-001",
      customer: "Acme Corporation",
      branch: "Main Branch",
      custOrderRef: "Template Item A",
      orderDate: today,
      requiredBy: "2025-12-07",
      deliveryTo: "Main Warehouse",
      orderTotal: "100.00",
      currency: "USD",
    },
    {
      id: 2,
      orderNo: "TD-002",
      ref: "REF-002",
      customer: "Beta Ltd",
      branch: "Branch A",
      custOrderRef: "Template Item B",
      orderDate: today,
      requiredBy: "2025-12-07",
      deliveryTo: "Branch Warehouse",
      orderTotal: "250.00",
      currency: "LKR",
    },
  ];

  const paginatedRows = React.useMemo(() => {
    if (rowsPerPage === -1) return rows;
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // When select item changes, set item code value if available
  useEffect(() => {
    if (!selectedItem) {
      setItemCode("");
      return;
    }
    const it = (items || []).find((i: any) => String(i.stock_id ?? i.id) === String(selectedItem));
    if (it) {
      setItemCode(String(it.stock_id ?? it.id ?? ""));
    } else {
      setItemCode("");
    }
  }, [selectedItem, items]);

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Search Outstanding Sales Orders" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Delivery Against Sales Orders" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={2}>
            <TextField fullWidth size="small" label="#" value={numberText} onChange={(e) => setNumberText(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth size="small" label="Ref" value={referenceText} onChange={(e) => setReferenceText(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="td-location-label">Location</InputLabel>
              <Select labelId="td-location-label" value={location} label="Location" onChange={(e) => setLocation(String(e.target.value))}>
                <MenuItem value="ALL_LOCATIONS">All Locations</MenuItem>
                {(locations || []).map((loc: any) => (
                  <MenuItem key={loc.loc_code} value={loc.loc_code}>{loc.location_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField fullWidth size="small" label="Item Code" value={itemCode} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="td-item-label">Select Item</InputLabel>
              <Select labelId="td-item-label" value={selectedItem ?? ""} label="Select Item" onChange={(e) => setSelectedItem(String(e.target.value))}>
                <MenuItem value="ALL_ITEMS">All Items</MenuItem>
                {Object.entries(
                  items.reduce((acc: any, item: any) => {
                    const category = categories.find((c: any) => c.category_id === item.category_id)?.description || "Uncategorized";
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(item);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([category, catItems]: [string, any[]]) => [
                  <ListSubheader key={category}>{category}</ListSubheader>,
                  ...catItems.map((item: any) => (
                    <MenuItem key={item.stock_id ?? item.id} value={String(item.stock_id ?? item.id)}>{item.description ?? item.item_name ?? item.name}</MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="td-customer-label">Select Customer</InputLabel>
                    <Select labelId="td-customer-label" value={selectedCustomer ?? ""} label="Select Customer" onChange={(e) => setSelectedCustomer(String(e.target.value))}>
                      <MenuItem value="ALL_CUSTOMERS">All Customers</MenuItem>
                      {(customers || []).map((c: any) => (
                        <MenuItem key={c.customer_id ?? c.id ?? c.debtor_no} value={String(c.customer_id ?? c.id ?? c.debtor_no)}>{c.name ?? c.customer_name ?? c.debtor_name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Button variant="contained" startIcon={<SearchIcon />} onClick={() => console.log("TemplateDelivery search", selectedCustomer)} sx={{ whiteSpace: "nowrap" }}>
                  Search
                </Button>
              </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Order #</TableCell>
              <TableCell>Ref</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Cust Order Ref</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Required By</TableCell>
              <TableCell>Delivery To</TableCell>
              <TableCell>Order Total</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow key={row.id} hover>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{row.orderNo}</TableCell>
                <TableCell>{row.ref}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.branch}</TableCell>
                <TableCell>{row.custOrderRef}</TableCell>
                <TableCell>{row.orderDate}</TableCell>
                <TableCell>{row.requiredBy}</TableCell>
                <TableCell>{row.deliveryTo}</TableCell>
                <TableCell>{row.orderTotal}</TableCell>
                <TableCell>{row.currency}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => navigate("/sales/transactions/update-sales-order-entry", { state: { id: row.id } })}>Edit</Button>
                    <Button variant="contained" color="secondary" size="small" startIcon={<LocalShippingIcon />} onClick={() => navigate("/sales/transactions/customer-delivery", { state: { id: row.id } })}>Dispatch</Button>
                    <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={() => console.log("Print", row.orderNo)}>Print</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={12}
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
