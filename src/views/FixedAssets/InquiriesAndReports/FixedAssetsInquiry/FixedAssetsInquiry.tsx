import React, { useState } from "react";
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
  Checkbox,
  FormControlLabel,
  TablePagination,
  useMediaQuery,
  Theme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function FixedAssetsInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [showInactive, setShowInactive] = useState(false);

  // static sample data
  const rows = [
    {
      id: 1,
      class: "Computer",
      uom: "Unit",
      description: "Dell Laptop i7",
      rate: "5 Years",
      method: "Straight Line",
      status: "Active",
      purchased: "2022-01-10",
      initial: 250000,
      depreciations: 80000,
      current: 170000,
      liquidation: "-",
    },
    {
      id: 2,
      class: "Furniture",
      uom: "Unit",
      description: "Office Chair",
      rate: "10 Years",
      method: "Reducing Balance",
      status: "Inactive",
      purchased: "2018-11-03",
      initial: 18000,
      depreciations: 12000,
      current: 6000,
      liquidation: "Sold",
    },
  ];

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginatedRows = React.useMemo(() => {
    if (rowsPerPage === -1) return rows;
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <PageTitle title="Fixed Assets Inquiry" />
          <Breadcrumb
            breadcrumbs={[
              { title: "Inquiries and Reports", href: "/fixedassets/inquiriesandreports" },
              { title: "Fixed Assets Inquiry" },
            ]}
          />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
            }
            label="Show Inactive"
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={() => console.log("Search Clicked", { showInactive })}
          >
            Search
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>UOM</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Rate / Life Cycle</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Purchased</TableCell>
              <TableCell>Initial</TableCell>
              <TableCell>Depreciations</TableCell>
              <TableCell>Current</TableCell>
              <TableCell>Liquidation / Sale</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.class}</TableCell>
                <TableCell>{r.uom}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell>{r.rate}</TableCell>
                <TableCell>{r.method}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.purchased}</TableCell>
                <TableCell>{r.initial.toFixed(2)}</TableCell>
                <TableCell>{r.depreciations.toFixed(2)}</TableCell>
                <TableCell>{r.current.toFixed(2)}</TableCell>
                <TableCell>{r.liquidation}</TableCell>
              </TableRow>
            ))}
          </TableBody>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showFirstButton
            showLastButton
          />
        </Table>
      </TableContainer>
    </Stack>
  );
}
