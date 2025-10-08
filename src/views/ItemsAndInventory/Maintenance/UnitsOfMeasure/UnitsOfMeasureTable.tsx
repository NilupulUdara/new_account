import React, { useMemo, useState, useEffect } from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { getItemUnits, deleteItemUnit } from "../../../../api/ItemUnit/ItemUnitApi";
import SearchBar from "../../../../components/SearchBar";
import DeleteConfirmationModal from "../../../../components/DeleteConfirmationModal";
import ErrorModal from "../../../../components/ErrorModal";

export default function UnitsOfMeasureTable() {
  const [unitsData, setUnitsData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Fetch units from backend
  const loadData = async () => {
    try {
      const data = await getItemUnits();
      setUnitsData(data);
    } catch (error) {
      console.error("Failed to fetch Units of Measure:", error);
       setErrorMessage(
          error?.response?.data?.message ||
          "Failed to load units Please try again."
        );
        setErrorOpen(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter units based on search query
  const filteredUnits = useMemo(() => {
    if (!searchQuery.trim()) return unitsData;
    const lowerQuery = searchQuery.toLowerCase();
    return unitsData.filter(
      (u) =>
        u.abbr.toLowerCase().includes(lowerQuery) ||
        u.name.toLowerCase().includes(lowerQuery)
    );
  }, [unitsData, searchQuery]);

  // Pagination
  const paginatedUnits = useMemo(() => {
    if (rowsPerPage === -1) return filteredUnits;
    return filteredUnits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUnits, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteItemUnit(selectedId);
      setOpenDeleteModal(false);
      setSelectedId(null);
      loadData();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.message ||
        "Failed to delete item unit Please try again."
      );
      setErrorOpen(true);
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Units of Measure" },
  ];

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
          <PageTitle title="Units of Measure" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: isMobile ? 1 : 0 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              navigate("/itemsandinventory/maintenance/units-of-measure/add-units-of-measure")
            }
          >
            Add Unit
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", mb: 2 }}>
        <Box sx={{ width: isMobile ? "150px" : "250px" }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search Abbr or Name"
          />
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ overflowX: "auto", maxWidth: "100%", p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Decimals</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedUnits.length > 0 ? (
              paginatedUnits.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{item.abbr}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.decimals}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() =>
                          navigate(
                            `/itemsandinventory/maintenance/units-of-measure/update-units-of-measure/${item.id}`
                          )
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          setSelectedId(item.id);
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
                <TableCell colSpan={5} align="center">
                  <Typography>No Records Found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={5}
                count={filteredUnits.length}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={openDeleteModal}
        title="Delete Unit"
        content="Are you sure you want to delete this unit? This action cannot be undone."
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
