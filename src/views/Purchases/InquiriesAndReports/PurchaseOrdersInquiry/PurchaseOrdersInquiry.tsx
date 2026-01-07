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
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { getPurchOrders } from "../../../../api/PurchOrders/PurchOrderApi";
import { getPurchOrderDetails } from "../../../../api/PurchOrders/PurchOrderDetailsApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  deliveryNo: string;
  supplier: string;
  branch: string;
  contact: string;
  reference: string;
  custRef: string;
  deliveryDate: string;
  dueBy: string;
  deliveryTotal: string | number;
  currency: string;
  hasOutstanding?: boolean;
}

export default function PurchaseOrdersInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // lookups
  const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: categories = [] } = useQuery({ queryKey: ["itemCategories"], queryFn: () => getItemCategories() });

  // header/state
  const [numberText, setNumberText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [location, setLocation] = useState("ALL_LOCATIONS");
  const [itemCode, setItemCode] = useState("");
  const [selectedItem, setSelectedItem] = useState("ALL_ITEMS");
  const [selectedSupplier, setSelectedSupplier] = useState("ALL_SUPPLIERS");

  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: getSuppliers });

  useEffect(() => {
    if (!selectedItem) {
      setItemCode("");
      return;
    }
    const it = (items || []).find((i: any) => String(i.stock_id ?? i.id) === String(selectedItem));
    setItemCode(it ? String(it.stock_id ?? it.id ?? "") : "");
  }, [selectedItem, items]);

  // Load real data
  const { data: purchOrderDetails = [] } = useQuery({ queryKey: ["purchOrderDetails"], queryFn: getPurchOrderDetails });
  const { data: purchOrders = [] } = useQuery({ queryKey: ["purchOrders"], queryFn: getPurchOrders });

  // Build rows from purch_orders where any related purch_order_detail has qty_invoiced != quantity_ordered
  const rows: Row[] = React.useMemo(() => {
    try {
      const outstandingOrderNos = new Set<string>();

      (purchOrderDetails || []).forEach((d: any) => {
        const invoiced = Number(d.qty_invoiced ?? d.quantity_invoiced ?? d.qtyInvoiced ?? d.qty ?? d.quantity_invoiced ?? 0);
        const ordered = Number(d.quantity_ordered ?? d.quantity ?? d.qty_ordered ?? d.qty ?? 0);
        if (!isNaN(ordered) && ordered !== 0 && invoiced !== ordered) {
          const ordNo = String(d.order_no ?? d.purch_order_no ?? d.orderNo ?? d.order_no_id ?? "");
          if (ordNo) outstandingOrderNos.add(ordNo);
        }
      });

      const fmtDate = (v: any) => {
        if (!v && v !== 0) return "";
        try {
          const d = new Date(v);
          if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
        } catch (e) {
          // fall through
        }
        return String(v).split("T")[0];
      };

      const filteredPurchOrders = (purchOrders || []).filter((po: any) => {
        // only outstanding
        if (!outstandingOrderNos.has(String(po.order_no ?? po.id ?? po.orderNo ?? ""))) return false;

        // filter by order number (#) if provided (partial match)
        if (numberText && String(numberText).trim() !== "") {
          if (!String(po.order_no ?? po.id ?? "").includes(String(numberText).trim())) return false;
        }

        // filter by supplier
        if (selectedSupplier && selectedSupplier !== "ALL_SUPPLIERS") {
          if (String(po.supplier_id ?? po.supplier ?? po.supp_id ?? "") !== String(selectedSupplier)) return false;
        }

        // filter by into location
        if (location && location !== "ALL_LOCATIONS") {
          if (String(po.into_stock_location ?? po.intoStockLocation ?? po.into_location ?? "") !== String(location)) return false;
        }

        // filter by selected item: only include POs that have a purch_order_detail for this item
        if (selectedItem && selectedItem !== "ALL_ITEMS") {
          const hasItem = (purchOrderDetails || []).some((d: any) => {
            const ordNo = String(d.order_no ?? d.purch_order_no ?? d.orderNo ?? "");
            const stockId = String(d.item_code ?? d.stock_id ?? d.item ?? d.stockId ?? "");
            return ordNo === String(po.order_no ?? po.id ?? po.orderNo ?? "") && stockId === String(selectedItem);
          });
          if (!hasItem) return false;
        }

        // filter by date range (ord_date)
        if (fromDate || toDate) {
          const poDateRaw = po.ord_date ?? po.ordDate ?? po.date ?? null;
          if (poDateRaw) {
            const poDate = new Date(poDateRaw);
            if (!isNaN(poDate.getTime())) {
              if (fromDate) {
                const fromD = new Date(fromDate);
                if (poDate < fromD) return false;
              }
              if (toDate) {
                const toD = new Date(toDate);
                // include full day by setting to end of day
                toD.setHours(23, 59, 59, 999);
                if (poDate > toD) return false;
              }
            }
          }
        }

        return true;
      });

      const mapped = filteredPurchOrders
        .map((po: any) => {
          const supp = (suppliers || []).find((s: any) => String(s.supplier_id ?? s.id ?? s.debtor_no) === String(po.supplier_id ?? po.supplier ?? po.supp_id ?? ""));
          const loc = (locations || []).find((l: any) => String(l.loc_code ?? l.code ?? l.id) === String(po.into_stock_location ?? po.intoStockLocation ?? po.into_location ?? ""));

          const ordKey = String(po.order_no ?? po.id ?? "");
          const hasOutstanding = (purchOrderDetails || []).some((d: any) => {
            const ordNo = String(d.order_no ?? d.purch_order_no ?? d.orderNo ?? "");
            const ordered = Number(d.quantity_ordered ?? d.quantity ?? d.qty ?? 0);
            const received = Number(d.quantity_received ?? d.qty_received ?? 0);
            return ordNo === ordKey && !isNaN(ordered) && ordered > received;
          });

          return {
            id: Number(po.order_no ?? po.id ?? 0),
            deliveryNo: String(po.order_no ?? po.id ?? ""),
            reference: po.reference ?? po.ref ?? "",
            supplier: supp ? (supp.supp_name ?? supp.name ?? supp.supplier_name ?? String(po.supplier_id ?? "")) : String(po.supplier_id ?? po.supplier ?? ""),
            branch: loc ? (loc.location_name?? String(loc.loc_code ?? loc.id)) : String(po.into_stock_location ?? ""),
            contact: "",
            custRef: po.requisition_no ?? po.requisitionNo ?? po.supplier_ref ?? "",
            deliveryDate: fmtDate(po.ord_date ?? po.ordDate ?? po.date ?? ""),
            dueBy: "",
            deliveryTotal: po.total ?? po.order_total ?? 0,
            currency: supp ? (supp.curr_code ?? supp.currency ?? "") : (po.currency ?? ""),
            hasOutstanding,
          } as Row;
        });

      return mapped;
    } catch (e) {
      console.warn('Failed to build purchase order rows', e);
      return [];
    }
  }, [purchOrderDetails, purchOrders, suppliers, locations, numberText, fromDate, toDate, location, selectedSupplier, selectedItem]);

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
          <PageTitle title="Search Purchase Orders" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Search Purchase Orders" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* First row: #, From, To, Into Location */}
          <Grid container item xs={12} spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="#" value={numberText} onChange={(e) => setNumberText(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="To" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="iasd-location-label">Into Location</InputLabel>
                <Select labelId="iasd-location-label" value={location} label="Location" onChange={(e) => setLocation(String(e.target.value))}>
                  <MenuItem value="ALL_LOCATIONS">All Locations</MenuItem>
                  {(locations || []).map((loc: any) => (
                    <MenuItem key={loc.loc_code} value={loc.loc_code}>{loc.location_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Second row: Item Code, Select Item, Select Supplier, Search */}
          <Grid container item xs={12} spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Item Code" value={itemCode} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="iasd-item-label">Select Item</InputLabel>
                <Select labelId="iasd-item-label" value={selectedItem ?? ""} label="Select Item" onChange={(e) => setSelectedItem(String(e.target.value))}>
                  <MenuItem value="ALL_ITEMS">All Items</MenuItem>
                  {(() => {
                    const filteredItems = items || [];
                    return (Object.entries(
                      filteredItems.reduce((groups: Record<string, any[]>, item) => {
                        const catId = item.category_id || "Uncategorized";
                        if (!groups[catId]) groups[catId] = [];
                        groups[catId].push(item);
                        return groups;
                      }, {})
                    ) as [string, any][]).map(([categoryId, groupedItems]) => {
                      const category = categories.find((cat: any) => cat.category_id === Number(categoryId));
                      const categoryLabel = category ? category.description : `Category ${categoryId}`;
                      return [
                        <ListSubheader key={`cat-${categoryId}`}>
                          {categoryLabel}
                        </ListSubheader>,
                        groupedItems.map((item: any) => (
                          <MenuItem key={item.stock_id ?? item.id} value={String(item.stock_id ?? item.id)}>
                            {item.description ?? item.item_name ?? item.name}
                          </MenuItem>
                        ))
                      ];
                    });
                  })()}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="iasd-supplier-label">Select Supplier</InputLabel>
                <Select labelId="iasd-supplier-label" value={selectedSupplier ?? ""} label="Select Supplier" onChange={(e) => setSelectedSupplier(String(e.target.value))}>
                  <MenuItem value="ALL_SUPPLIERS">All Suppliers</MenuItem>
                  {(suppliers || []).map((s: any) => (
                    <MenuItem key={s.supplier_id ?? s.id ?? s.debtor_no} value={String(s.supplier_id ?? s.id ?? s.debtor_no)}>{s.supp_name ?? s.name ?? s.supplier_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button fullWidth variant="contained" startIcon={<SearchIcon />} onClick={() => console.log("InvoiceAgainstSalesDelivery search", { numberText, fromDate, toDate, location, selectedItem })}>
                Search
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Supplier's Reference</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Order Total</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r, index) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.deliveryNo}</TableCell>
                <TableCell>{r.reference}</TableCell>
                <TableCell>{r.supplier}</TableCell>
                <TableCell>{r.branch}</TableCell>
                <TableCell>{r.custRef}</TableCell>
                <TableCell>{r.deliveryDate}</TableCell>
                <TableCell>{r.currency}</TableCell>
                <TableCell>{r.deliveryTotal}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button variant="outlined" size="small" onClick={() => navigate("/purchase/transactions/update-purchase-order-entry", { state: { id: r.id } })}>Edit</Button>
                    {r.hasOutstanding ? (
                      <Button variant="contained" size="small" color="success" onClick={() => navigate("/purchase/transactions/receive-purchase-order-items", { state: { id: r.deliveryNo } })}>
                        Receive
                      </Button>
                    ) : null}
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
                colSpan={9}
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
