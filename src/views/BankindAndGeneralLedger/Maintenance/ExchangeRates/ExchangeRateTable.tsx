import React, { useState, useMemo, useEffect } from "react";
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
  TablePagination,
  Paper,
  Typography,
  useMediaQuery,
  Theme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import theme from "../../../../theme";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import SearchBar from "../../../../components/SearchBar";

interface ExchangeRate {
  id: number;
  date_to_use: string;
  exchange_rate: number;
  currency: string;
}

function ExchangeRateTable() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // Dummy data
  useEffect(() => {
    const dummyData: ExchangeRate[] = [
      { id: 1, date_to_use: "2025-09-23", exchange_rate: 365.5, currency: "USD" },
      { id: 2, date_to_use: "2025-09-22", exchange_rate: 364.8, currency: "USD" },
      { id: 3, date_to_use: "2025-09-21", exchange_rate: 366.0, currency: "EUR" },
      { id: 4, date_to_use: "2025-09-20", exchange_rate: 365.2, currency: "EUR" },
      { id: 5, date_to_use: "2025-09-19", exchange_rate: 364.9, currency: "LKR" },
      { id: 6, date_to_use: "2025-09-18", exchange_rate: 363.7, currency: "LKR" },
      { id: 7, date_to_use: "2025-09-17", exchange_rate: 365.8, currency: "USD" },
    ];
    setExchangeRates(dummyData);
  }, []);

  // Filter data based on currency and search query
  const filteredData = useMemo(() => {
    return exchangeRates
      .filter((er) => er.currency === selectedCurrency)
      .filter((er) => {
        const dateStr = new Date(er.date_to_use).toLocaleDateString();
        const rateStr = er.exchange_rate.toString();
        return dateStr.includes(searchQuery) || rateStr.includes(searchQuery);
      });
  }, [exchangeRates, selectedCurrency, searchQuery]);

  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) return filteredData;
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this exchange rate?")) {
      setExchangeRates((prev) => prev.filter((er) => er.id !== id));
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Exchange Rates" },
  ];

  return (
    <Stack>
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          marginY: 2,
          borderRadius: 1,
          overflowX: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <PageTitle title="Exchange Rates" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/bankingandgeneralledger/maintenance/add-exchange-rate")}
          >
            Add Exchange Rate
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/bankingandgeneralledger/maintenance/")}
          >
            Back
          </Button>
        </Stack>
      </Box>

      {/* Currency Selector and Search Bar */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Currency</InputLabel>
          <Select
            value={selectedCurrency}
            label="Currency"
            onChange={(e) => setSelectedCurrency(e.target.value)}
          >
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
            <MenuItem value="LKR">LKR</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ ml: isMobile ? 0 : "auto", width: isMobile ? "100%" : "300px" }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search Date or Rate..."
          />
        </Box>
      </Stack>

      {/* Table */}
      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
        >
          <Table aria-label="exchange rates table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Date to Use</TableCell>
                <TableCell>Exchange Rate</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((er, index) => (
                  <TableRow key={er.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{new Date(er.date_to_use).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {er.exchange_rate}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                           onClick={() => navigate("/bankingandgeneralledger/maintenance/update-exchange-rate")}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(er.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={4}
                  count={filteredData.length}
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
    </Stack>
  );
}

export default ExchangeRateTable;
