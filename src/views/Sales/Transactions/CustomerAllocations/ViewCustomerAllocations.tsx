import React from "react";
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
  Grid,
  Typography,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";


export default function ViewCustomerAllocations() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { transNo, transType } = state || {};

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers, refetchOnMount: true });
  const { data: debtorTrans = [] } = useQuery({ queryKey: ["debtorTrans"], queryFn: getDebtorTrans, refetchOnMount: true });

  const transaction = debtorTrans.find((dt: any) => String(dt.trans_no) === String(transNo) && dt.trans_type === transType);
  const customer = customers.find((c: any) => c.debtor_no === transaction?.debtor_no);

  if (!transaction) {
    return <Typography>Transaction not found for transNo: {transNo}, transType: {transType}</Typography>;
  }

  // Placeholder empty rows
  const rows: any[] = [];

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <PageTitle title="Allocate Customer Payment or Credit Note" />
          <Breadcrumb
            breadcrumbs={[
              { title: "Home", href: "/home" },
              { title: "Allocate Customer Payment or Credit Note" },
            ]}
          />
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>

      {/* Transaction Details */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <Typography sx={{ textAlign: 'center' }}>
              <b>Type:</b> {transaction.trans_type === 11 ? "Customer Credit Note" : "Customer Payment"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography sx={{ textAlign: 'center' }}>
              <b>Customer:</b> {customer?.name || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography sx={{ textAlign: 'center' }}>
              <b>Date:</b> {transaction?.tran_date || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography sx={{ textAlign: 'center' }}>
              <b>Total:</b> {transaction?.ov_amount || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Transaction Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Ref</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Other Allocations</TableCell>
              <TableCell>Left to Allocate</TableCell>
              <TableCell>This Allocation</TableCell>
              <TableCell>All</TableCell>
              <TableCell>None</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Typography>No Records Found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.number}</TableCell>
                  <TableCell>{r.ref}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.due_date}</TableCell>
                  <TableCell>{r.amount}</TableCell>
                  <TableCell>{r.other_alloc}</TableCell>
                  <TableCell>{r.left}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={r.this_allocation}
                      onChange={(e) =>
                        console.log("Allocation change", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Button size="small" onClick={() => console.log("All clicked")}>
                      All
                    </Button>
                  </TableCell>

                  <TableCell>
                    <Button size="small" onClick={() => console.log("None clicked")}>
                      None
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          {/* FOOTER TOTALS */}
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} align="right">
                <b>Total Allocation:</b>
              </TableCell>
              <TableCell colSpan={2}>
                <b>0.00</b>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={9} align="right">
                <b>Left to Allocate:</b>
              </TableCell>
              <TableCell colSpan={2}>
                <b>0.00</b>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* BOTTOM ACTION BUTTONS */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="contained" color="primary">
          Refresh
        </Button>

        <Button variant="contained" color="success">
          Process
        </Button>

        <Button variant="outlined" onClick={() => navigate("/customer-allocations")}>
          Back to Allocation
        </Button>
      </Stack>
    </Stack>
  );
}
