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
  Paper,
  TextField,
  MenuItem,
  Grid,
  useMediaQuery,
  Theme,
  FormControl,
  InputLabel,
  Select,
  TableFooter,
  TablePagination,
  ListSubheader,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { getSalesOrders } from "../../../../api/SalesOrders/SalesOrdersApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getSalesOrderDetails } from "../../../../api/SalesOrders/SalesOrderDetailsApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  deliveryNo: string;
  customer: string;
  branch: string;
  contact: string;
  reference: string;
  custRef: string;
  quoteDate: string;
  dueBy: string;
  deliveryTotal: string | number;
  // optional fields for order mapping
  deliveryTo?: string;
  orderNo?: string;
  quoteTotal?: string | number;
  currency: string;
}

export default function SalesQuotationInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // map to hold new payment values per row id
  const [payments, setPayments] = useState<Record<number, string>>({});

  // lookups
  const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: categories = [] } = useQuery({ queryKey: ["itemCategories"], queryFn: () => getItemCategories() });

  // header/state
  const [numberText, setNumberText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [location, setLocation] = useState("ALL_LOCATIONS");
  const [itemCode, setItemCode] = useState("");
  const [selectedItem, setSelectedItem] = useState("ALL_ITEMS");
  const [selectedCustomer, setSelectedCustomer] = useState("ALL_CUSTOMERS");

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });

  const { data: salesOrders = [] } = useQuery({ queryKey: ["salesOrders"], queryFn: getSalesOrders });

  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });

  const { data: orderDetails = [] } = useQuery({ queryKey: ["orderDetails"], queryFn: getSalesOrderDetails });

  useEffect(() => {
    if (!selectedItem) {
      setItemCode("");
      return;
    }
    const it = (items || []).find((i: any) => String(i.stock_id ?? i.id) === String(selectedItem));
    setItemCode(it ? String(it.stock_id ?? it.id ?? "") : "");
  }, [selectedItem, items]);

  const filteredRows = React.useMemo(() => {
    // Only include quotations that have at least one detail with trans_type=32 and qty_sent=0
    const relevantOrderNos = new Set(
      (orderDetails || [])
        .filter((d: any) => Number(d.trans_type) === 32 && Number(d.qty_sent) === 0)
        .map((d: any) => String(d.order_no))
    );

    let filtered = (salesOrders || []).filter((order: any) => relevantOrderNos.has(String(order.order_no)));

    if (selectedCustomer !== "ALL_CUSTOMERS") {
      filtered = filtered.filter((order: any) => String(order.debtor_no) === selectedCustomer);
    }

    if (numberText) {
      filtered = filtered.filter((order: any) => order.order_no.toString().includes(numberText));
    }

    if (referenceText) {
      filtered = filtered.filter((order: any) => order.reference.toLowerCase().includes(referenceText.toLowerCase()));
    }

    if (fromDate) {
      filtered = filtered.filter((order: any) => order.ord_date >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter((order: any) => order.ord_date <= toDate);
    }

    if (location !== "ALL_LOCATIONS") {
      filtered = filtered.filter((order: any) => order.from_stk_loc === location);
    }

    if (selectedItem !== "ALL_ITEMS") {
      const matchingOrderNos = new Set(orderDetails.filter((d: any) => d.stk_code === selectedItem).map((d: any) => d.order_no));
      filtered = filtered.filter((order: any) => matchingOrderNos.has(order.order_no));
    }

    return filtered.map((order: any) => {
      const customer = customers.find((c: any) => c.debtor_no === order.debtor_no);
      const branch = branches.find((b: any) => b.branch_code === order.branch_code);
      return {
        id: order.order_no,
        deliveryNo: order.order_no.toString(),
        customer: customer?.name ?? customer?.customer_name ?? customer?.debtor_name ?? order.debtor_no.toString(),
        branch: branch?.br_name ?? order.branch_code.toString(),
        contact: "",
        reference: order.reference,
        custRef: order.customer_ref || "",
        quoteDate: order.ord_date,
        dueBy: order.delivery_date || "",
        deliveryTotal: order.total.toString(),
        currency: customer?.curr_code ?? "USD",
        deliveryTo: order.deliver_to || "",
        orderNo: order.order_no.toString(),
        quoteTotal: order.total.toString(),
      };
    });
  }, [salesOrders, selectedCustomer, numberText, referenceText, fromDate, toDate, location, selectedItem, customers, branches, orderDetails]);

  const rows: Row[] = filteredRows;

  const paginatedRows = React.useMemo(() => {
    if (rowsPerPage === -1) return rows;
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Search All Sales Quotations" />
          <Breadcrumb breadcrumbs={[{ title: "Inquiries and Reports", href: "/sales/inquiriesandreports" }, { title: "Sales Quotation Inquiry" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2} md={1}>
            <TextField fullWidth size="small" label="#" value={numberText} onChange={(e) => setNumberText(e.target.value)} />
          </Grid>

          <Grid item xs={12} sm={3} md={2}>
            <TextField fullWidth size="small" label="Ref" value={referenceText} onChange={(e) => setReferenceText(e.target.value)} />
          </Grid>

          <Grid item xs={12} sm={5} md={3}>
            <TextField fullWidth size="small" label="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12} sm={5} md={3}>
            <TextField fullWidth size="small" label="To" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="iasd-location-label">Location</InputLabel>
              <Select labelId="iasd-location-label" value={location} label="Location" onChange={(e) => setLocation(String(e.target.value))}>
                <MenuItem value="ALL_LOCATIONS">All Locations</MenuItem>
                {(locations || []).map((loc: any) => (
                  <MenuItem key={loc.loc_code} value={loc.loc_code}>{loc.location_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3} md={2}>
            <TextField fullWidth size="small" label="Item Code" value={itemCode} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="iasd-item-label">Select Item</InputLabel>
              <Select labelId="iasd-item-label" value={selectedItem ?? ""} label="Select Item" onChange={(e) => setSelectedItem(String(e.target.value))}>
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
                    <MenuItem key={item.stock_id ?? item.id} value={String(item.stock_id ?? item.id)}>
                      {item.description ?? item.item_name ?? item.name}
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="iasd-customer-label">Select Customer</InputLabel>
              <Select labelId="iasd-customer-label" value={selectedCustomer ?? ""} label="Select Customer" onChange={(e) => setSelectedCustomer(String(e.target.value))}>
                <MenuItem value="ALL_CUSTOMERS">All Customers</MenuItem>
                {(customers || []).map((c: any) => (
                  <MenuItem key={c.customer_id ?? c.id ?? c.debtor_no} value={String(c.customer_id ?? c.id ?? c.debtor_no)}>{c.name ?? c.customer_name ?? c.debtor_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2} md={1}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={() => console.log("InvoiceAgainstSalesDelivery search", { numberText, fromDate, toDate, location, selectedItem })}>
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Quote #</TableCell>
              <TableCell>Ref</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Cust Order Ref</TableCell>
              <TableCell>Quote Date</TableCell>
              <TableCell>Valid Until</TableCell>
              <TableCell>Delivery To</TableCell>
              <TableCell>Quote Total</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.orderNo ?? r.deliveryNo}</TableCell>
                <TableCell>{r.reference}</TableCell>
                <TableCell>{r.customer}</TableCell>
                <TableCell>{r.branch}</TableCell>
                <TableCell>{r.custRef}</TableCell>
                <TableCell>{r.quoteDate}</TableCell>
                <TableCell>{r.dueBy}</TableCell>
                <TableCell>{r.deliveryTo}</TableCell>
                <TableCell>{r.quoteTotal ?? r.deliveryTotal}</TableCell>
                <TableCell>{r.currency}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button variant="outlined" size="small" onClick={() => navigate(`/sales/transactions/update-sales-quotation-entry/${r.id}`)}>Edit</Button>
                    <Button variant="outlined" size="small" onClick={() => navigate("/sales/transactions/quotation-sales-order-entry/", { state: { orderNo: r.id } })}>Sales Order</Button>
                    <Button variant="outlined" size="small">Print</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={11}
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
