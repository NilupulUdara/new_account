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

// API function to get Item Categories
const getItemCategories = async () => [
  {
    id: 1,
    name: "Charges",
    taxType: "Regular",
    units: "each",
    type: "Service",
    salesAccount: "4010",
    inventoryAccount: "1510",
    cogsAccount: "5010",
    adjustmentAccount: "5040",
    assemblyAccount: "1503",
    status: "Active",
  },
  {
    id: 2,
    name: "Components",
    taxType: "Regular",
    units: "each",
    type: "Purchased",
    salesAccount: "4010",
    inventoryAccount: "1510",
    cogsAccount: "5010",
    adjustmentAccount: "5040",
    assemblyAccount: "1503",
    status: "Inactive",
  },
];

function ItemCategoriesTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { data: categoriesData = [] } = useQuery({
    queryKey: ["itemCategories"],
    queryFn: getItemCategories,
  });

  const filteredCategories = useMemo(() => {
    if (!categoriesData) return [];
    let filtered = categoriesData;

    if (!showInactive) filtered = filtered.filter((item) => item.status === "Active");

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.taxType.toLowerCase().includes(lowerQuery) ||
          item.units.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [categoriesData, searchQuery, showInactive]);

  const paginatedCategories = useMemo(() => {
    if (rowsPerPage === -1) return filteredCategories;
    return filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCategories, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (id: number) => alert(`Delete Category with id: ${id}`);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Item Categories" },
  ];

  return (
    <Stack>
      {/* Header with buttons */}
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
          <PageTitle title="Item Categories" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/itemsandinventory/maintenance/add-item-categories")}
          >
            Add Category
          </Button>

          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
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
          control={<Checkbox checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
          label="Show also Inactive"
        />

        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search..." />
        </Box>
      </Box>

      {/* Table */}
      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
        >
          <Table aria-label="item categories table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Tax Type</TableCell>
                <TableCell>Units</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Sales Account</TableCell>
                <TableCell>Inventory Account</TableCell>
                <TableCell>COGS Account</TableCell>
                <TableCell>Adjustment Account</TableCell>
                <TableCell>Assembly Account</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.taxType}</TableCell>
                    <TableCell>{item.units}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.salesAccount}</TableCell>
                    <TableCell>{item.inventoryAccount}</TableCell>
                    <TableCell>{item.cogsAccount}</TableCell>
                    <TableCell>{item.adjustmentAccount}</TableCell>
                    <TableCell>{item.assemblyAccount}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate("/itemsandinventory/maintenance/update-item-categories")}
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
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={11}
                  count={filteredCategories.length}
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

export default ItemCategoriesTable;
