import React from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableFooter,
  TableRow as MuiTableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function CreateAndPrintRecurrentInvoices() {
  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Recurrent Invoices" },
  ];

  const navigate = useNavigate();

  // Dummy data to display in the table
  const today = new Date().toISOString().split("T")[0];
  const rows = [
    {
      id: 1,
      description: "Monthly maintenance fee",
      templateNo: "T-1001",
      customer: "Acme Corporation",
      branchGroup: "Main/Group A",
      days: 30,
      monthly: "Yes",
      begin: "2025-01-01",
      end: "2025-12-31",
      nextInvoice: today,
    },
    {
      id: 2,
      description: "Subscription - Premium",
      templateNo: "T-1002",
      customer: "Beta Ltd",
      branchGroup: "Branch B",
      days: 7,
      monthly: "No",
      begin: "2025-03-01",
      end: "2026-02-28",
      nextInvoice: today,
    },
    {
      id: 3,
      description: "Service retainer",
      templateNo: "T-1003",
      customer: "Gamma PLC",
      branchGroup: "Group C",
      days: 15,
      monthly: "Yes",
      begin: "2025-06-01",
      end: "2025-11-30",
      nextInvoice: today,
    },
  ];

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Create and Print Recurrent Invoices" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Template No</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Branch/Group</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Monthly</TableCell>
              <TableCell>Begin</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Next invoice</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.description}</TableCell>
                <TableCell>{r.templateNo}</TableCell>
                <TableCell>{r.customer}</TableCell>
                <TableCell>{r.branchGroup}</TableCell>
                <TableCell>{r.days}</TableCell>
                <TableCell>{r.monthly}</TableCell>
                <TableCell>{r.begin}</TableCell>
                <TableCell>{r.end}</TableCell>
                <TableCell>{r.nextInvoice}</TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => console.log("Create invoice for", r.templateNo)}>
                    Create Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <MuiTableRow>
              <TableCell colSpan={10} />
            </MuiTableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Stack>
  );
}
