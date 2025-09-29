import React, { useMemo, useState } from "react";
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import SearchBar from "../../../../components/SearchBar";
import theme from "../../../../theme";

const getGlAccountGroupsList = async () => [
  { id: 1, name: "Current Assets", subGroup: "", class: "Assets", status: "Active", },
  { id: 2, name: "Inventory Assets", subGroup: "", class: "Assets", status: "Active", },
  { id: 3, name: "Capital Assets", subGroup: "", class: "Assets", status: "Active", },
  { id: 4, name: "Current Liabilties", subGroup: "", class: "Liabilities", status: "Inactive", },
  { id: 5, name: "Long Term Liabilties", subGroup: "", class: "Liabilities", status: "Active", },
  { id: 6, name: "Share Capital", subGroup: "", class: "Liabilities", status: "Active", },
  { id: 7, name: "Retain Earnings", subGroup: "", class: "Income", status: "Inactive", },
  { id: 8, name: "Sales Revenue", subGroup: "", class: "Income", status: "Active", },
  { id: 9, name: "Other Revenue", subGroup: "", class: "Costs", status: "Inactive", },
  { id: 10, name: "Cost of Goods Sold", subGroup: "", class: "Costs", status: "Active", },

];

function GlAccountGroupsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { data: glAccountGroupsData = [] } = useQuery({
    queryKey: ["glAccountGroups"],
    queryFn: getGlAccountGroupsList,
  });

  // Filter with search + showInactive toggle
  const filteredAccounts = useMemo(() => {
    if (!glAccountGroupsData) return [];
    let filtered = glAccountGroupsData;

    if (!showInactive) {
      filtered = filtered.filter((item) => item.status === "Active");
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.subGroup.toLowerCase().includes(lowerQuery) ||
          item.class.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [glAccountGroupsData, searchQuery, showInactive]);

  const paginatedAccounts = useMemo(() => {
    if (rowsPerPage === -1) return filteredAccounts;
    return filteredAccounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAccounts, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (id: number) => {
    alert(`Delete GL Account Group with id: ${id}`);
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "GL Account Groups" },
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
          <PageTitle title="GL Account Groups" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/bankingandgeneralledger/maintenance/add-gl-account-groups")}
          >
            Add GL Account Groups
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Stack>
      </Box>

      {/* Search + Show Inactive Toggle */}
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

      {/* Table */}
      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
        >
          <Table aria-label="gl account groups table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Group ID</TableCell>
                <TableCell>Group Name</TableCell>
                <TableCell>Subgroup of</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedAccounts.length > 0 ? (
                paginatedAccounts.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.subGroup}</TableCell>
                    <TableCell>{item.class}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate("/bankingandgeneralledger/maintenance/update-gl-account-groups")
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={10}
                  count={filteredAccounts.length}
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

export default GlAccountGroupsTable;
