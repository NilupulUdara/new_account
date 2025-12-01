import React, { useMemo } from "react";
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
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getSalesTypes } from "../../../../api/SalesMaintenance/salesService";
import { getShippingCompanies } from "../../../../api/ShippingCompany/ShippingCompanyApi";
import { getDebtorTransDetails } from "../../../../api/DebtorTrans/DebtorTransDetailsApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";

export default function ViewDirectDelivery() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    chargeTo,
    chargeBranch,
    deliveredTo,
    reference,
    customerOrderRef,
    dispatchDate,
    currency,
    shippingCompany,
    dueDate,
    orderNo: ourOrderNo,
    saleType,
    items = [],
    subtotal,
    totalAmount,
    trans_no,
  } = state || {};

  // Fetch customers for display
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // Fetch branches for display
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
  });

  // Fetch sales types for display
  const { data: salesTypes = [] } = useQuery({
    queryKey: ["salesTypes"],
    queryFn: getSalesTypes,
  });

  // Fetch shipping companies for display
  const { data: shippingCompanies = [] } = useQuery({
    queryKey: ["shippingCompanies"],
    queryFn: getShippingCompanies,
  });

  // Fetch locations for display
  const { data: locations = [] } = useQuery({
    queryKey: ["inventoryLocations"],
    queryFn: getInventoryLocations,
  });

  // Fetch items for units
  const { data: stockItems = [] } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
  });

  // Fetch item units for abbr
  const { data: itemUnits = [] } = useQuery({
    queryKey: ["itemUnits"],
    queryFn: getItemUnits,
  });

  // Fetch debtor trans for due_date
  const { data: debtorTransList = [] } = useQuery({
    queryKey: ["debtorTrans"],
    queryFn: getDebtorTrans,
  });

  const debtorTrans = debtorTransList.find((trans: any) => String(trans.trans_no) === String(trans_no) && trans.trans_type === 13);

  // Fetch debtor trans details for items
  const { data: debtorTransDetails = [] } = useQuery({
    queryKey: ["debtorTransDetails", trans_no],
    queryFn: () => getDebtorTransDetails().then(details => details.filter((d: any) => String(d.debtor_trans_no) === String(trans_no))),
    enabled: !!trans_no,
  });

  // Resolve display names
  const chargeToName = useMemo(() => {
    const debtorNo = debtorTrans?.debtor_no || chargeTo;
    if (!debtorNo) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.debtor_no) === String(debtorNo)
    );
    return found ? found.name : debtorNo;
  }, [customers, chargeTo, debtorTrans]);

  const customerAddress = useMemo(() => {
    const debtorNo = debtorTrans?.debtor_no || chargeTo;
    if (!debtorNo) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.debtor_no) === String(debtorNo)
    );
    return found ? found.address || "-" : "-";
  }, [customers, chargeTo, debtorTrans]);

  const currencyFromCustomer = useMemo(() => {
    const debtorNo = debtorTrans?.debtor_no || chargeTo;
    if (!debtorNo) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.debtor_no) === String(debtorNo)
    );
    return found ? found.curr_code || "-" : "-";
  }, [customers, chargeTo, debtorTrans]);

  const chargeBranchName = useMemo(() => {
    const branchCode = debtorTrans?.branch_code || chargeBranch;
    if (!branchCode) return "-";
    const found = (branches || []).find(
      (b: any) => String(b.branch_code) === String(branchCode)
    );
    if (found) {
      return `${found.br_name} - ${found.br_address || ""}`;
    }
    return branchCode;
  }, [branches, chargeBranch, debtorTrans]);

  const deliveredToName = useMemo(() => {
    if (!deliveredTo) return "-";
    const found = (locations || []).find(
      (l: any) => String(l.loc_code) === String(deliveredTo)
    );
    return found ? found.location_name : deliveredTo;
  }, [locations, deliveredTo]);

  const saleTypeName = useMemo(() => {
    const tpe = debtorTrans?.tpe || saleType;
    if (!tpe) return "-";
    const found = (salesTypes || []).find(
      (s: any) => String(s.id) === String(tpe)
    );
    return found ? found.typeName : tpe;
  }, [salesTypes, saleType, debtorTrans]);

  const shippingCompanyName = useMemo(() => {
    const shipVia = debtorTrans?.ship_via || shippingCompany;
    if (!shipVia) return "-";
    const found = (shippingCompanies || []).find(
      (s: any) => String(s.shipper_id) === String(shipVia)
    );
    return found ? found.shipper_name : shipVia;
  }, [shippingCompanies, shippingCompany, debtorTrans]);

  // Items from debtor trans details
  const itemsFromDetails = useMemo(() => {
    return (debtorTransDetails || []).map((detail: any) => {
      const itemFound = (stockItems || []).find((item: any) => String(item.stock_id) === String(detail.stock_id));
      const unitFound = (itemUnits || []).find((unit: any) => String(unit.id) === String(itemFound?.units));
      return {
        itemCode: detail.stock_id,
        description: detail.description,
        quantity: detail.quantity,
        unit: unitFound?.abbr || "-",
        price: detail.unit_price,
        discount: detail.discount_percent || 0,
        total: (detail.quantity || 0) * (detail.unit_price || 0) * (1 - (detail.discount_percent || 0) / 100),
      };
    });
  }, [debtorTransDetails, stockItems, itemUnits]);

  // Calculate totals from details
  const subtotalFromDetails = useMemo(() => {
    return itemsFromDetails.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [itemsFromDetails]);

  const totalAmountFromDetails = subtotalFromDetails; // Assuming no additional charges for now

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Direct Deliveries" },
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
          <PageTitle title={`Dispatch Note #${trans_no || "-"}`} />
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

      {/* Delivery Information */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Delivery Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Charge To:</b> {chargeToName} - {customerAddress}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Charge Branch:</b> {chargeBranchName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Delivered To:</b> {chargeBranchName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Reference:</b> {reference || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Customer Order Ref:</b> {customerOrderRef || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Dispatch Date:</b> {debtorTrans?.tran_date || dispatchDate || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Currency:</b> {currencyFromCustomer}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Shipping Company:</b> {shippingCompanyName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Due Date:</b> {debtorTrans?.due_date || dueDate || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Our Order No:</b> {ourOrderNo || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Sale Type:</b> {saleTypeName}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Item Details</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Item Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Discount %</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemsFromDetails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>No items available</TableCell>
                </TableRow>
              ) : (
                itemsFromDetails.map((it: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{it.itemCode ?? "-"}</TableCell>
                    <TableCell>{it.description ?? "-"}</TableCell>
                    <TableCell>{it.quantity ?? "-"}</TableCell>
                    <TableCell>{it.unit ?? "-"}</TableCell>
                    <TableCell>{it.price ?? "-"}</TableCell>
                    <TableCell>{it.discount ?? "-"}</TableCell>
                    <TableCell>{it.total ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}

              {/* Totals */}
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>{subtotalFromDetails?.toFixed(2) ?? "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {totalAmountFromDetails?.toFixed(2) ?? "-"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Buttons */}
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
