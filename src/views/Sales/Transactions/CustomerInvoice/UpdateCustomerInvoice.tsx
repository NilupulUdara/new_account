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
  Paper,
  TextField,
  Typography,
  MenuItem,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { getPaymentTerms } from "../../../../api/PaymentTerm/PaymentTermApi";
import { getShippingCompanies } from "../../../../api/ShippingCompany/ShippingCompanyApi";
import { getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";
import { getDebtorTransDetails } from "../../../../api/DebtorTrans/DebtorTransDetailsApi";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getSalesTypes } from "../../../../api/SalesMaintenance/salesService";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getItemTaxTypes } from "../../../../api/ItemTaxType/ItemTaxTypeApi.tsx";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { getCompanies } from "../../../../api/CompanySetup/CompanySetupApi";

export default function UpdateCustomerInvoice() {
  const navigate = useNavigate();

  // === Fields ===
  const { state } = useLocation();
  const { trans_no, reference: navReference, date: navDate } = (state || {}) as any;

  const [customer, setCustomer] = useState("");
  const [branch, setBranch] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("");
  const [reference, setReference] = useState(navReference || "");
  const [salesType, setSalesType] = useState("");
  const [currency, setCurrency] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [date, setDate] = useState(navDate || new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [memo, setMemo] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [dateError, setDateError] = useState("");

  // === Table Data ===
  const [rows, setRows] = useState<any[]>([]);

  // === API Queries ===
  const { data: paymentTerms = [] } = useQuery({ queryKey: ["paymentTerms"], queryFn: getPaymentTerms });
  const { data: shippingCompanies = [] } = useQuery({ queryKey: ["shippingCompanies"], queryFn: getShippingCompanies });

  const { data: debtorTransList = [] } = useQuery({ queryKey: ["debtorTrans"], queryFn: getDebtorTrans });
  const { data: debtorTransDetails = [] } = useQuery({ queryKey: ["debtorTransDetails"], queryFn: getDebtorTransDetails });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });
  const { data: salesTypes = [] } = useQuery({ queryKey: ["salesTypes"], queryFn: getSalesTypes });
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: itemUnits = [] } = useQuery({ queryKey: ["itemUnits"], queryFn: getItemUnits });
  const { data: itemTaxTypes = [] } = useQuery({ queryKey: ["itemTaxTypes"], queryFn: getItemTaxTypes });

  const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });
  const { data: companyData } = useQuery({
    queryKey: ["company"],
    queryFn: getCompanies,
  });

  // Find selected fiscal year from company setup
  const selectedFiscalYear = useMemo(() => {
    if (!companyData || companyData.length === 0) return null;
    const company = companyData[0];
    return fiscalYears.find((fy: any) => fy.id === company.fiscal_year_id);
  }, [companyData, fiscalYears]);

  // Validate date is within fiscal year
  const validateDate = (selectedDate: string) => {
    if (!selectedFiscalYear) {
      setDateError("No fiscal year selected from company setup");
      return false;
    }

    if (selectedFiscalYear.closed) {
      setDateError("The fiscal year is closed for further data entry.");
      return false;
    }

    const selected = new Date(selectedDate);
    const from = new Date(selectedFiscalYear.fiscal_year_from);
    const to = new Date(selectedFiscalYear.fiscal_year_to);

    if (selected < from || selected > to) {
      setDateError("The entered date is out of fiscal year.");
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

  // Validate date when fiscal year changes
  useEffect(() => {
    if (selectedFiscalYear) {
      validateDate(date);
    }
  }, [selectedFiscalYear]);

  // === Calculations ===
  const subTotal = rows.reduce((sum, r) => sum + Number(r.total || 0), 0);
  const invoiceTotal = subTotal + shippingCost;

  // === Actions ===
  const handleUpdate = () => alert("Invoice updated!");
  const handleProcessInvoice = () => alert("Invoice processed successfully!");

  const breadcrumbItems = [
    { title: "Transactions", href: "/sales/transactions" },
    { title: `Modifying Sales Invoice # ${trans_no || ""}` },
  ];

  // Prefill form when debtor trans and details are available
  useEffect(() => {
    if (!trans_no || debtorTransList.length === 0 || customers.length === 0) return;

    const invoice = debtorTransList.find((d: any) => String(d.trans_no) === String(trans_no) && d.trans_type === 10);
    if (!invoice) return;

    // basic fields
    const customerData = customers.find((c: any) => String(c.debtor_no) === String(invoice.debtor_no));
    const branchData = (branches || []).find((b: any) => String(b.branch_code) === String(invoice.branch_code));
    const salesTypeData = (salesTypes || []).find((st: any) => String(st.id) === String(invoice.tpe));

    setCustomer(customerData?.name || String(invoice.debtor_no || ""));
    setBranch(branchData?.br_name || String(invoice.branch_code || ""));
    setCurrency(customerData?.curr_code || invoice.curr_code || "");
    setSalesType(salesTypeData?.typeName || "");
    setReference(invoice.reference || navReference || "");
    setDate(invoice.tran_date ? String(invoice.tran_date).split(" ")[0] : (navDate || new Date().toISOString().split("T")[0]));
    setDueDate(invoice.due_date ? String(invoice.due_date).split(" ")[0] : "");
    setPaymentTerm(invoice.payment_terms || "");
    setShippingCompany(invoice.ship_via || "");
    setMemo(invoice.memo_ || invoice.comments || "");

    // rows from details
    const details = (debtorTransDetails || []).filter((d: any) => String(d.debtor_trans_no) === String(invoice.trans_no));
    if (details.length > 0) {
      const newRows = details.map((detail: any, index: number) => {
        const itemData = (items || []).find((i: any) => String(i.stock_id) === String(detail.stock_id));
        const unitData = (itemUnits as any[] || []).find((u: any) => String(u.id) === String(itemData?.units));
        const taxTypeData = (itemTaxTypes || []).find((t: any) => String(t.id) === String(itemData?.tax_type_id));
        const price = Number(detail.unit_price || 0);
        const qty = Number(detail.quantity || 0);
        const discount = Number(detail.discount_percent || 0);
        const total = qty * price * (1 - discount / 100);

        return {
          id: index + 1,
          itemCode: detail.stock_id || "",
          description: detail.description || "",
          delivered: qty,
          units: unitData?.abbr || detail.units || "",
          invoiced: Number(detail.qty_invoiced || 0),
          thisInvoice: qty,
          price: price,
          taxType: taxTypeData?.name || "",
          discount: discount,
          total: total,
          src_id: detail.src_id,
        };
      });
      setRows(newRows);
      setShippingCost(Number(invoice.shipping_cost || 0));
    }
  }, [trans_no, debtorTransList, debtorTransDetails, customers, branches, salesTypes, items, itemUnits, itemTaxTypes, navReference, navDate]);

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: 2,
          boxShadow: 2,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <PageTitle title={`Modifying Sales Invoice # ${trans_no || ""}`} />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Customer" value={customer} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Branch" value={branch} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Payment Terms"
              value={paymentTerm}
              onChange={(e) => setPaymentTerm(e.target.value)}
              size="small"
            >
              {paymentTerms.map((term: any) => (
                <MenuItem key={term.terms_indicator} value={term.terms_indicator}>
                  {term.description}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Reference" value={reference} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Sales Type" value={salesType} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Currency" value={currency} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Shipping Company"
              value={shippingCompany}
              onChange={(e) => setShippingCompany(e.target.value)}
              size="small"
            >
              {shippingCompanies.map((sc: any) => (
                <MenuItem key={sc.id} value={sc.id}>
                  {sc.shipper_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              type="date"
              label="Date"
              fullWidth
              size="small"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: selectedFiscalYear ? new Date(selectedFiscalYear.fiscal_year_from).toISOString().split('T')[0] : undefined,
                max: selectedFiscalYear ? new Date(selectedFiscalYear.fiscal_year_to).toISOString().split('T')[0] : undefined,
              }}
              error={!!dateError}
              helperText={dateError}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              type="date"
              label="Due Date"
              fullWidth
              size="small"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Typography variant="subtitle1" sx={{ mb: 2, textAlign: "center" }}>
        Invoice Items
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Delivered</TableCell>
              <TableCell>Units</TableCell>
              <TableCell>Invoiced</TableCell>
              <TableCell>This Invoice</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Tax Type</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.itemCode}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.delivered}</TableCell>
                <TableCell>{row.units}</TableCell>
                <TableCell>{row.invoiced}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.thisInvoice}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id ? { ...r, thisInvoice: value, total: value * r.price } : r
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>{row.taxType}</TableCell>
                <TableCell>{row.discount}%</TableCell>
                <TableCell>{row.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={10}>Shipping Cost</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={10} sx={{ fontWeight: 600 }}>
                Sub Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{subTotal.toFixed(2)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={10} sx={{ fontWeight: 600 }}>
                Invoice Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{invoiceTotal.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Memo and Actions */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <TextField
          fullWidth
          label="Memo"
          multiline
          rows={2}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleUpdate} disabled={!!dateError}>
            Update
          </Button>
          <Button variant="contained" color="success" onClick={handleProcessInvoice} disabled={!!dateError}>
            Process Invoice
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
