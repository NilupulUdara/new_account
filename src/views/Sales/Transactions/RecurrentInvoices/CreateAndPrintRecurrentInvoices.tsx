import React, { useMemo, useState } from "react";
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
  TablePagination,
  TableRow as MuiTableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { getRecurrentInvoices } from "../../../../api/RecurrentInvoice/RecurrentInvoiceApi";
import { getSalesGroups } from "../../../../api/SalesMaintenance/salesService";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";

export default function CreateAndPrintRecurrentInvoices() {
  const breadcrumbItems = [
    { title: "Transactions", href: "/sales/transactions/" },
    { title: "Recurrent Invoices" },
  ];

  const navigate = useNavigate();

  const { data: recurrentInvoices = [] } = useQuery({
    queryKey: ["recurrentInvoices"],
    queryFn: getRecurrentInvoices,
  });

  const { data: salesGroups = [] } = useQuery({
    queryKey: ["salesGroups"],
    queryFn: getSalesGroups,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginatedInvoices = useMemo(() => {
    if (rowsPerPage === -1) return recurrentInvoices;
    return recurrentInvoices.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [recurrentInvoices, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const calculateNextInvoiceDate = (begin: string, monthly: number, days: number) => {
    if (!begin) return 'Not set';
    
    const beginDate = new Date(begin);
    const nextDate = new Date(beginDate);
    
    // Add monthly months
    nextDate.setMonth(nextDate.getMonth() + monthly);
    
    // Add days - 1 days
    nextDate.setDate(nextDate.getDate() + days - 1);
    
    return nextDate.toISOString().split('T')[0];
  };

  // Dummy data to display in the table
  const today = new Date().toISOString().split("T")[0];

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
            {paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>{invoice.order_no}</TableCell>
                  <TableCell>{customers.find(c => c.debtor_no === invoice.debtor_no)?.name || (invoice.debtor_no ? invoice.debtor_no : '')}</TableCell>
                  <TableCell>{salesGroups.find(g => g.id === invoice.group_no)?.name || invoice.group_no}</TableCell>
                  <TableCell>{invoice.days}</TableCell>
                  <TableCell>{invoice.monthly}</TableCell>
                  <TableCell>{invoice.begin ? new Date(invoice.begin).toISOString().split('T')[0] : ''}</TableCell>
                  <TableCell>{invoice.end ? new Date(invoice.end).toISOString().split('T')[0] : ''}</TableCell>
                  <TableCell>{calculateNextInvoiceDate(invoice.begin, invoice.monthly, invoice.days)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => navigate(`/sales/maintenance/create-recurrent-invoices/${invoice.id}`)}
                    >
                      Create Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="body2">No Recurrent Invoices Found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <MuiTableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={10}
                count={recurrentInvoices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </MuiTableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Stack>
  );
}
