import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Button,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getShippingCompanies } from "../../../../api/ShippingCompany/ShippingCompanyApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getSalesTypes } from "../../../../api/SalesMaintenance/salesService";
import { getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";
import { getDebtorTransDetails } from "../../../../api/DebtorTrans/DebtorTransDetailsApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getTaxGroupItemsByGroupId } from "../../../../api/Tax/TaxGroupItemApi";
import { getTaxTypes } from "../../../../api/Tax/taxServices";

export default function ViewUpdatedCustomerCreditNotes() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    trans_no,
    reference,
    date,
    trans_type,
  } = state || {};

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
    refetchOnMount: true,
  });

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
    refetchOnMount: true,
  });

  // Fetch sales types
  const { data: salesTypes = [] } = useQuery({
    queryKey: ["salesTypes"],
    queryFn: getSalesTypes,
    refetchOnMount: true,
  });

  // Fetch shipping companies
  const { data: shippingCompanies = [] } = useQuery({
    queryKey: ["shippingCompanies"],
    queryFn: getShippingCompanies,
    refetchOnMount: true,
  });

  // Fetch debtor trans
  const { data: debtorTrans = [] } = useQuery({
    queryKey: ["debtorTrans"],
    queryFn: getDebtorTrans,
    refetchOnMount: true,
  });

  // Fetch debtor trans details
  const { data: debtorTransDetails = [] } = useQuery({
    queryKey: ["debtorTransDetails"],
    queryFn: getDebtorTransDetails,
    refetchOnMount: true,
  });

  // Fetch items
  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
    refetchOnMount: true,
  });

  // Fetch item units
  const { data: itemUnits = [] } = useQuery({
    queryKey: ["itemUnits"],
    queryFn: getItemUnits,
    refetchOnMount: true,
  });

  // Fetch tax types
  const { data: taxTypes = [] } = useQuery({
    queryKey: ["taxTypes"],
    queryFn: getTaxTypes,
    refetchOnMount: true,
  });

  const [taxGroupItems, setTaxGroupItems] = useState<any[]>([]);

  // Find the current debtor trans (only credit notes: trans_type === 11)
  const currentTrans = useMemo(() => {
  //  console.log("debtorTrans:", debtorTrans);
    //console.log("trans_no:", trans_no);
    const found = debtorTrans.find((d: any) => d.trans_no == trans_no && d.trans_type == 11);
   // console.log("found transaction:", found);
    return found;
  }, [debtorTrans, trans_no]);

  // Find the details for this trans (match debtor_trans.trans_no === debtor_trans_details.debtor_trans_no)
  const currentDetails = useMemo(() => {
    // Only return details when the parent debtor_trans is a customer credit note (trans_type === 11)
    if (!currentTrans || Number(currentTrans.trans_type) !== 11) return [];
    const transNo = currentTrans.trans_no ?? trans_no;
    return debtorTransDetails.filter((d: any) => Number(d.debtor_trans_no) === Number(transNo));
  }, [debtorTransDetails, currentTrans, trans_no]);

  // Memoize selected branch to prevent unnecessary re-renders
  const selectedBranch = useMemo(() => {
    if (!currentTrans?.branch_code) return null;
    return (branches || []).find((b: any) => String(b.branch_code) === String(currentTrans.branch_code));
  }, [currentTrans?.branch_code, branches]);

  // Fetch tax group items when branch is available
  useEffect(() => {
    if (selectedBranch?.tax_group) {
      getTaxGroupItemsByGroupId(selectedBranch.tax_group)
        .then((items) => setTaxGroupItems(items))
        .catch((err) => {
          console.error("Failed to fetch tax group items:", err);
          setTaxGroupItems([]);
        });
    } else {
      setTaxGroupItems([]);
    }
  }, [selectedBranch?.tax_group]);

  // Resolve customer info
  const customerInfo = useMemo(() => {
  //  console.log("currentTrans:", currentTrans);
  //  console.log("customers:", customers);
    if (!currentTrans?.debtor_no) return { name: "-", currency: "-" };
    const found = (customers || []).find(
      (c) => String(c.debtor_no) === String(currentTrans.debtor_no)
    );
  //  console.log("found customer:", found);
    if (found) {
      const address = [found.address, found.city, found.state, found.postal_code].filter(Boolean).join(", ");
      return { name: `${found.name} - ${address}`, currency: found.curr_code || "-" };
    }
    return { name: currentTrans.debtor_no, currency: "-" };
  }, [customers, currentTrans]);

  // Resolve branch info
  const branchInfo = useMemo(() => {
    if (!currentTrans?.branch_code) return "-";
    const found = (branches || []).find(
      (b) => String(b.branch_code) === String(currentTrans.branch_code)
    );
    if (found) {
      const address = [found.br_address, found.city, found.state, found.postal_code].filter(Boolean).join(", ");
      return `${found.br_name} - ${address}`;
    }
    return currentTrans.branch_code;
  }, [branches, currentTrans]);

  // Resolve sales type name
  const salesTypeName = useMemo(() => {
    if (!currentTrans?.tpe) return "-";
    const found = (salesTypes || []).find(
      (s) => String(s.id) === String(currentTrans.tpe)
    );
    return found ? found.typeName : currentTrans.tpe;
  }, [salesTypes, currentTrans]);

  // Determine selected price list (sales type)
  const selectedPriceList = useMemo(() => {
    if (!currentTrans?.tpe) return null;
    return (salesTypes || []).find(
      (s) => String(s.id) === String(currentTrans.tpe)
    );
  }, [salesTypes, currentTrans]);

  // Resolve shipping company name
  const shippingName = useMemo(() => {
    if (!currentTrans?.ship_via) return "-";
    const found = (shippingCompanies || []).find(
      (s) => String(s.shipper_id) === String(currentTrans.ship_via)
    );
    return found ? found.shipper_name : currentTrans.ship_via;
  }, [shippingCompanies, currentTrans]);

  // Calculate sub total
  const subTotal = useMemo(() => {
    return currentDetails.reduce((sum, item) => {
      const total = (item.unit_price || 0) * (item.quantity || 0) * (1 - (item.discount_percent || 0) / 100);
      return sum + total;
    }, 0);
  }, [currentDetails]);

  // Calculate taxes
  const taxCalculations = useMemo(() => {
    if (taxGroupItems.length === 0) {
      return [];
    }

    // Calculate tax amounts for each tax type
    return taxGroupItems.map((item: any) => {
      const taxTypeData = taxTypes.find((t: any) => t.id === item.tax_type_id);
      const taxRate = taxTypeData?.default_rate || 0;
      const taxName = taxTypeData?.description || "Tax";

      let taxAmount = 0;
      if (selectedPriceList?.taxIncl) {
        // For prices that include tax, we need to extract the tax amount
        // Tax amount = subtotal - (subtotal / (1 + rate/100))
        taxAmount = subTotal - (subTotal / (1 + taxRate / 100));
      } else {
        // For prices that don't include tax, calculate tax on subtotal
        // Tax amount = subTotal * (taxRate / 100)
        taxAmount = subTotal * (taxRate / 100);
      }

      return {
        name: taxName,
        rate: taxRate,
        amount: taxAmount,
      };
    });
  }, [selectedPriceList, taxGroupItems, taxTypes, subTotal]);

  const totalTaxAmount = taxCalculations.reduce((sum, tax) => sum + tax.amount, 0);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (selectedPriceList?.taxIncl) {
      return subTotal.toFixed(2);
    } else {
      return (subTotal + totalTaxAmount).toFixed(2);
    }
  }, [selectedPriceList, subTotal, totalTaxAmount]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Customer Credit Notes" },
  ];

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
          flexWrap: "wrap",
        }}
      >
        <Box>
          <PageTitle title={`Customer Credit Note - ${reference || "-"}`} />
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

      {/* Credit Note Info */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Credit Note # {currentTrans?.trans_no || "-"}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Customer:</b> {customerInfo.name || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Branch:</b> {branchInfo || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Reference:</b> {currentTrans?.reference || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Sales Type:</b> {salesTypeName || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Date:</b> {currentTrans?.tran_date || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Shipping Company:</b> {shippingName || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Currency:</b> {customerInfo.currency || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Item Details
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-light-blue)" }}>
              <TableRow>
                <TableCell><b>Item Code</b></TableCell>
                <TableCell><b>Item Description</b></TableCell>
                <TableCell align="right"><b>Quantity</b></TableCell>
                <TableCell align="right"><b>Unit</b></TableCell>
                <TableCell align="right"><b>Price</b></TableCell>
                <TableCell align="right"><b>Discount %</b></TableCell>
                <TableCell align="right"><b>Total</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentDetails && currentDetails.length > 0 ? (
                currentDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.stock_id || "-"}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell align="right">{item.quantity || "-"}</TableCell>
                    <TableCell align="right">
                      {(() => {
                        const foundItem = items.find((i: any) => String(i.stock_id) === String(item.stock_id));
                        if (!foundItem) return "-";
                        const unitId = foundItem.units;
                        const foundUnit = itemUnits.find((u: any) => String(u.id) === String(unitId));
                        return foundUnit ? foundUnit.abbr : "-";
                      })()}
                    </TableCell>
                    <TableCell align="right">{item.unit_price || "-"}</TableCell>
                    <TableCell align="right">{item.discount_percent || "-"}</TableCell>
                    <TableCell align="right">{((item.unit_price || 0) * (item.quantity || 0) * (1 - (item.discount_percent || 0) / 100)).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No items found
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={6} align="right">
                  <b>Sub Total:</b>
                </TableCell>
                <TableCell align="right">
                  <b>{subTotal.toFixed(2)}</b>
                </TableCell>
              </TableRow>

              {/* Show tax breakdown */}
              {taxCalculations.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={7} sx={{ fontWeight: 600, fontStyle: 'italic', color: 'text.secondary' }}>
                      {selectedPriceList?.taxIncl ? "Taxes Included:" : "Taxes:"}
                    </TableCell>
                  </TableRow>
                  {taxCalculations.map((tax, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={5}></TableCell>
                      <TableCell sx={{ pl: 4 }}>
                        {tax.name} ({tax.rate}%)
                      </TableCell>
                      <TableCell>{tax.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              <TableRow>
                <TableCell colSpan={6} align="right">
                  <b>Total Credit:</b>
                </TableCell>
                <TableCell align="right">
                  <b>{totalAmount}</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button variant="contained" color="primary">
            Print
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Close
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
