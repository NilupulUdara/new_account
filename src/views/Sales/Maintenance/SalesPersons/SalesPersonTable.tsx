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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import SearchBar from "../../../../components/SearchBar";
import { deleteSalesPerson, getSalesPerson, getSalesPersons } from "../../../../api/SalesPerson/SalesPersonApi";

function SalesPersonTable() {
  const [salesPersons, setSalesPersons] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const fetchSalesPersons = async () => {
    try {
      const data = await getSalesPersons();
      setSalesPersons(data);
    } catch (error) {
      console.error("Failed to fetch sales persons:", error);
    }
  };

  useEffect(() => {
    fetchSalesPersons();
  }, [])


  const filteredSalesPersons = useMemo(() => {
    if (!salesPersons) return [];

    let filtered = salesPersons;

    // if (!showInactive) {
    //   filtered = filtered.filter((item) => item.status === "Active");
    // }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sp) =>
          sp.name.toLowerCase().includes(lowerQuery) ||
          sp.telephone.toLowerCase().includes(lowerQuery) ||
          sp.fax.toLowerCase().includes(lowerQuery) ||
          sp.email.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [salesPersons, searchQuery, 
    // showInactive
  ]);

  const paginatedSalesPersons = useMemo(() => {
    if (rowsPerPage === -1) return filteredSalesPersons;
    return filteredSalesPersons.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredSalesPersons, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this sales person?")) return;

    try {
      await deleteSalesPerson(id);
      fetchSalesPersons();
    } catch (error) {
      console.error("Failed to delete sales person:", error);
    }
  };
  
  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Sales Persons" },
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
          <PageTitle title="Sales Persons" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/sales/maintenance/sales-persons/add-sales-person")}
          >
            Add Sales Person
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/sales/maintenance")}
          >
            Back
          </Button>
        </Stack>
      </Box>

      {/* Search Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          mb: 2,
          width: "100%",
          alignItems: "center",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
          }
          label="Show also Inactive"
        />

        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search..."
          />
        </Box>
      </Box>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
        >
          <Table aria-label="salesperson table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Sales Person Name</TableCell>
                <TableCell>Telephone Number</TableCell>
                <TableCell>Fax Number</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Provision (%)</TableCell>
                <TableCell>Turnover Break Pt Level</TableCell>
                <TableCell>Provision 2 (%)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedSalesPersons.length > 0 ? (
                paginatedSalesPersons.map((sp, index) => (
                  <TableRow key={sp.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{sp.name}</TableCell>
                    <TableCell>{sp.telephone}</TableCell>
                    <TableCell>{sp.fax}</TableCell>
                    <TableCell>{sp.email}</TableCell>
                    <TableCell>{sp.provision}</TableCell>
                    <TableCell>{sp.turnover_break_point}</TableCell>
                    <TableCell>{sp.provision2}</TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate(`/sales/maintenance/sales-persons/update-sales-person/${sp.id}`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(sp.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={9}
                  count={filteredSalesPersons.length}
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

export default SalesPersonTable;
