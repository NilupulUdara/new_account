import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
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
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  Theme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import theme from "../../../../theme";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import SearchBar from "../../../../components/SearchBar";
import DeleteConfirmationModal from "../../../../components/DeleteConfirmationModal";
import { getCurrencies, deleteCurrency } from "../../../../api/Currency/currencyApi";
import ErrorModal from "../../../../components/ErrorModal";

export default function CurrenciesTable() {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showAll, setShowAll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Load currencies
  const loadCurrencies = async () => {
    try {
      const data = await getCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  // Filter and search
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

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteCurrency(selectedId);
      setOpenDeleteModal(false);
      setSelectedId(null);
      loadCurrencies();
    } catch (error) {
      console.error("Error deleting currency:", error);
      setErrorMessage(
        error?.response?.data?.message ||
        "Failed to delete currency Please try again."
      );
      setErrorOpen(true);
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
        <FormControlLabel
          control={<Checkbox checked={!showAll} onChange={(e) => setShowAll(!e.target.checked)} />}
          label="Show Only Auto Exchange Rate Enabled"
        />

        <Box sx={{ ml: isMobile ? 0 : "auto", width: isMobile ? "100%" : "300px" }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search..." />
        </Box>
      </Stack>

      {/* Table */}
      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
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
                          onClick={() => {
                            setSelectedId(currency.id);
                            setOpenDeleteModal(true);
                          }}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={openDeleteModal}
        title="Delete Currency"
        content="Are you sure you want to delete this currency? This action cannot be undone."
        handleClose={() => setOpenDeleteModal(false)}
        handleReject={() => setSelectedId(null)}
        deleteFunc={handleDelete}
      />
      <ErrorModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
      />
    </Stack>
  );
}
