import React, { useEffect, useMemo, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import { Box, Stack, Button, Typography, Checkbox, FormControlLabel, useMediaQuery, Theme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import theme from "../../../../theme";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import SearchBar from "../../../../components/SearchBar";
import { getCurrencies, deleteCurrency } from "../../../../api/Currency/currencyApi";

// Mock API function for currency data
// const getCurrencies = async () => [
//   {
//     id: 1,
//     currencyAbbreviation: "USD",
//     currencySymbol: "$",
//     currencyName: "US Dollar",
//     hundredthsName: "Cents",
//     country: "United States",
//     autoExchangeRateUpdate: true,
//   },
//   {
//     id: 2,
//     currencyAbbreviation: "LKR",
//     currencySymbol: "Rs",
//     currencyName: "Sri Lankan Rupee",
//     hundredthsName: "Cents",
//     country: "Sri Lanka",
//     autoExchangeRateUpdate: false,
//   },
//   {
//     id: 3,
//     currencyAbbreviation: "EUR",
//     currencySymbol: "€",
//     currencyName: "Euro",
//     hundredthsName: "Cents",
//     country: "European Union",
//     autoExchangeRateUpdate: true,
//   },
// ];

export default function CurrenciesTable() {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showAll, setShowAll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Fetch data
  // useState(() => {
  //   getCurrencies().then((data) => setCurrencies(data));
  // });

  useEffect(() => {
    getCurrencies().then((data) => setCurrencies(data));
  }, []);

  // Filter based on autoExchangeRateUpdate and search
  const filteredData = useMemo(() => {
    let data = showAll ? currencies : currencies.filter((c) => c.auto_exchange_rate_update);

    if (searchQuery.trim() !== "") {
      const lower = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
          c.currency_abbreviation.toLowerCase().includes(lower) ||
          c.currency_name.toLowerCase().includes(lower) ||
          c.country.toLowerCase().includes(lower)
      );
    }

    return data;
  }, [currencies, showAll, searchQuery]);

  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) return filteredData;
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this currency?")) {
      await deleteCurrency(id);
      setCurrencies((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Currencies" },
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
          <PageTitle title="Currency Setup" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/bankingandgeneralledger/maintenance/add-currency")}
          >
            Add Currency
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

      {/* Search & Filter */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: isMobile ? "flex-start" : "space-between" }}
      >
        {/* Checkbox on left */}
        <FormControlLabel
          control={<Checkbox checked={!showAll} onChange={(e) => setShowAll(!e.target.checked)} />}
          label="Show Only Auto Exchange Rate Enabled"
        />

        {/* SearchBar on right */}
        <Box sx={{ ml: isMobile ? 0 : "auto" }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search..."
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
          <Table aria-label="currencies table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Abbreviation</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Hundredths Name</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="center">Auto Exchange Update</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((currency) => (
                  <TableRow key={currency.id} hover>
                    <TableCell>{currency.currency_abbreviation}</TableCell>
                    <TableCell>{currency.currency_symbol}</TableCell>
                    <TableCell>{currency.currency_name}</TableCell>
                    <TableCell>{currency.hundredths_name}</TableCell>
                    <TableCell>{currency.country}</TableCell>
                    <TableCell align="center">
                      <Checkbox checked={currency.auto_exchange_rate_update} disabled />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/bankingandgeneralledger/maintenance/update-currency/${currency.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(currency.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={7}
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  showFirstButton
                  showLastButton
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
}
