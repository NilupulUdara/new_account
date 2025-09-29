import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Box,
  Button,
  Stack,
  TableFooter,
  TablePagination,
  Typography,
  useMediaQuery,
  Theme,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import SearchBar from "../../../../components/SearchBar";
import { getTaxTypes, deleteTaxType } from "../../../../api/Tax/taxServices";

// Mock API function
// const getTaxGroups = async () => [
//   {
//     id: 1,
//     description: "Standard Tax",
//     defaultRate: 15,
//     salesGlAccount: "4000 - Sales Revenue",
//     purchasingGlAccount: "5000 - Purchase Expenses",
//     inactive: false,
//   },
//   {
//     id: 2,
//     description: "Reduced Tax",
//     defaultRate: 8,
//     salesGlAccount: "4010 - Services Revenue",
//     purchasingGlAccount: "5010 - Freight Expenses",
//     inactive: true,
//   },
//   {
//     id: 3,
//     description: "Standard Tax",
//     defaultRate: 15,
//     salesGlAccount: "4020 - Sales Revenue",
//     purchasingGlAccount: "5020 - Purchase Expenses",
//     inactive: false,
//   },
//   {
//     id: 4,
//     description: "Reduced Tax",
//     defaultRate: 8,
//     salesGlAccount: "4030 - Services Revenue",
//     purchasingGlAccount: "5030 - Freight Expenses",
//     inactive: true,
//   },
//   {
//     id: 5,
//     description: "Standard Tax",
//     defaultRate: 15,
//     salesGlAccount: "4040 - Sales Revenue",
//     purchasingGlAccount: "5040 - Purchase Expenses",
//     inactive: false,
//   },
//   {
//     id: 6,
//     description: "Reduced Tax",
//     defaultRate: 8,
//     salesGlAccount: "4010 - Services Revenue",
//     purchasingGlAccount: "5010 - Freight Expenses",
//     inactive: true,
//   },
//   {
//     id: 7,
//     description: "Standard Tax",
//     defaultRate: 15,
//     salesGlAccount: "4000 - Sales Revenue",
//     purchasingGlAccount: "5000 - Purchase Expenses",
//     inactive: false,
//   },
//   {
//     id: 8,
//     description: "Reduced Tax",
//     defaultRate: 8,
//     salesGlAccount: "4010 - Services Revenue",
//     purchasingGlAccount: "5010 - Freight Expenses",
//     inactive: true,
//   },
//   {
//     id: 9,
//     description: "Standard Tax",
//     defaultRate: 15,
//     salesGlAccount: "4000 - Sales Revenue",
//     purchasingGlAccount: "5000 - Purchase Expenses",
//     inactive: false,
//   },
//   {
//     id: 10,
//     description: "Reduced Tax",
//     defaultRate: 8,
//     salesGlAccount: "4010 - Services Revenue",
//     purchasingGlAccount: "5010 - Freight Expenses",
//     inactive: true,
//   },
// ];

export default function TaxGroupTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [taxGroups, setTaxGroups] = useState<any[]>([]);
  const [showInactive, setShowInactive] = useState(false); // global checkbox
  const [searchQuery, setSearchQuery] = useState(""); // search state
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Fetch data (simulate API)
  // useState(() => {
  //   getTaxGroups().then((data) => setTaxGroups(data));
  // });

  useEffect(() => {
    getTaxTypes().then((data) => setTaxGroups(data));
  }, []);

  // Filter rows based on global checkbox and search query
  const filteredData = useMemo(() => {
    let data = showInactive ? taxGroups : taxGroups.filter((g) => !g.inactive);

    if (searchQuery.trim() !== "") {
      const lower = searchQuery.toLowerCase();
      data = data.filter(
        (g) =>
          g.description.toLowerCase().includes(lower) ||
          g.sales_gl_account.toLowerCase().includes(lower) ||
          g.purchasing_gl_account.toLowerCase().includes(lower)
      );
    }

    return data;
  }, [taxGroups, showInactive, searchQuery]);

  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) return filteredData;
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [page, rowsPerPage, filteredData]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this tax type?")) {
      await deleteTaxType(id);
      setTaxGroups((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Tax Groups" },
  ];

  return (
    <Stack>
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
          <PageTitle title="Tax Types" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/setup/companysetup/add-tax-types")}
          >
            Add Tax Types
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/setup/companysetup")}
          >
            Back
          </Button>
        </Stack>
      </Box>

      {/* Global checkbox & Search Bar */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
          }
          label="Show Also Inactive"
        />

        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search Description, Sales GL, Purchasing GL"
          />
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
        >
          <Table aria-label="tax groups table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Default Rate (%)</TableCell>
                <TableCell>Sales GL Account</TableCell>
                <TableCell>Purchasing GL Account</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((group) => (
                  <TableRow key={group.id} hover>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>{group.default_rate}</TableCell>
                    <TableCell>{group.sales_gl_account}</TableCell>
                    <TableCell>{group.purchasing_gl_account}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/setup/companysetup/update-tax-types/${group.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(group.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={5}
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
