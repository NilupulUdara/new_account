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
import { getPaymentTerms } from "../../../../api/PaymentTerm/PaymentTermApi";
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
  deliveryDate: string;
  dueBy: string;
  deliveryTotal: string | number;
  // optional fields for order mapping
  deliveryTo?: string;
  orderNo?: string;
  orderTotal?: string | number;
  currency: string;
  isInvoiced?: boolean;
}

export default function InvoicePrepaidOrders() {
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
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const { data: salesOrders = [] } = useQuery({ queryKey: ["salesOrders"], queryFn: getSalesOrders });
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });
  const { data: paymentTerms = [] } = useQuery({ queryKey: ["paymentTerms"], queryFn: getPaymentTerms });
  const { data: salesOrderDetails = [] } = useQuery({ queryKey: ["salesOrderDetails"], queryFn: getSalesOrderDetails });

  // header/state
  const [numberText, setNumberText] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [location, setLocation] = useState("ALL_LOCATIONS");
  const [itemCode, setItemCode] = useState("");
  const [selectedItem, setSelectedItem] = useState("ALL_ITEMS");
  const [selectedCustomer, setSelectedCustomer] = useState("ALL_CUSTOMERS");

  useEffect(() => {
    if (!selectedItem) {
      setItemCode("");
      return;
    }
    const it = (items || []).find((i: any) => String(i.stock_id ?? i.id) === String(selectedItem));
    setItemCode(it ? String(it.stock_id ?? it.id ?? "") : "");
  }, [selectedItem, items]);

  // Get valid payment terms indicators where payment_type == 1
  const validPaymentTerms = paymentTerms
    .filter((pt: any) => pt.payment_type?.id === 1)
    .map((pt: any) => pt.terms_indicator);

  // dummy rows
  const rows: Row[] = salesOrders
    .filter((so: any) => 
      validPaymentTerms.includes(so.payment_terms) && 
      so.reference !== "auto" &&
      (selectedCustomer === "ALL_CUSTOMERS" || so.debtor_no === parseInt(selectedCustomer)) &&
      (selectedItem === "ALL_ITEMS" || salesOrderDetails.some((detail: any) => detail.order_no === so.order_no && String(detail.stk_code) === selectedItem)) &&
      (numberText === "" || so.order_no.toString().includes(numberText)) &&
      (referenceText === "" || so.reference.toLowerCase().includes(referenceText.toLowerCase())) &&
      (fromDate === "" || so.ord_date >= fromDate) &&
      (toDate === "" || so.ord_date <= toDate) &&
      (location === "ALL_LOCATIONS" || so.from_stk_loc === location)
    )
    .map((so: any) => {
      const customer = customers.find((c: any) => c.debtor_no === so.debtor_no);
      const branch = branches.find((b: any) => b.branch_code === so.branch_code);
      return {
        id: so.order_no,
        deliveryNo: so.order_no,
        customer: customer?.name || so.debtor_no,
        branch: branch?.br_name || so.branch_code,
        contact: "", // Not available
        reference: so.reference,
        custRef: so.customer_ref || "",
        deliveryDate: so.ord_date,
        dueBy: so.delivery_date,
        deliveryTotal: so.total,
        currency: customer?.curr_code || "USD",
        deliveryTo: so.deliver_to || "",
        orderNo: so.order_no,
        orderTotal: so.total,
        isInvoiced: salesOrderDetails.filter((d: any) => d.order_no === so.order_no).every((d: any) => d.invoiced === 1),
      };
    });

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
          <PageTitle title="Invoicing Prepayment Orders" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Invoicing Prepayment Orders" }]} />
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
                    <MenuItem key={item.stock_id ?? item.id} value={String(item.stock_id ?? item.id)}>{item.description ?? item.item_name ?? item.name}</MenuItem>
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
              <TableCell>New Payment</TableCell>
              <TableCell>Actions</TableCell>
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
                <TableCell>{r.deliveryDate}</TableCell>
                <TableCell>{r.dueBy}</TableCell>
                <TableCell>{r.deliveryTo}</TableCell>
                <TableCell>{r.orderTotal ?? r.deliveryTotal}</TableCell>
                <TableCell>{r.currency}</TableCell>
                <TableCell>{payments[r.id] ?? ""}</TableCell>
                <TableCell>
                  { !r.isInvoiced && <Button variant="outlined" size="small" onClick={() => navigate("/sales/transactions/invoice-prepaid-orders/final-invoice-entry", { state: { orderNo: r.orderNo } })}>
                    Final Invoice
                  </Button> }
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
