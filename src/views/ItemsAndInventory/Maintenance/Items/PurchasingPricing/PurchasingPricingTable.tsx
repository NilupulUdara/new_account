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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import theme from "../../../../../theme";
import Breadcrumb from "../../../../../components/BreadCrumb";
import PageTitle from "../../../../../components/PageTitle";
import SearchBar from "../../../../../components/SearchBar";

interface PurchasingPricing {
  id: number;
  supplier: string;
  price: number;
  currency: string;
  supplierUnit: string;
  conversionFactor: number;
  supplierDescription: string;
}

function PurchasingPricingTable() {
  const [purchaseData, setPurchaseData] = useState<PurchasingPricing[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // Dummy data
  useEffect(() => {
    const dummyData: PurchasingPricing[] = [
      {
        id: 1,
        supplier: "ABC Traders",
        price: 50,
        currency: "USD",
        supplierUnit: "Box",
        conversionFactor: 10,
        supplierDescription: "ABC Item 123",
      },
      {
        id: 2,
        supplier: "XYZ Supplies",
        price: 45,
        currency: "USD",
        supplierUnit: "Pack",
        conversionFactor: 5,
        supplierDescription: "XYZ Special Pack",
      },
      {
        id: 3,
        supplier: "Global Imports",
        price: 12000,
        currency: "LKR",
        supplierUnit: "Carton",
        conversionFactor: 20,
        supplierDescription: "Sri Lanka Carton",
      },
    ];
    setPurchaseData(dummyData);
  }, []);

  // Filter by search
  const filteredData = useMemo(() => {
    return purchaseData.filter((item) => {
      return (
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplierDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.price.toString().includes(searchQuery)
      );
    });
  }, [purchaseData, searchQuery]);

  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) return filteredData;
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setPurchaseData((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Purchasing Pricing" },
  ];

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          marginY: 2,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <PageTitle title="Purchasing Pricing" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              navigate("/itemsandinventory/maintenance/items/add-purchasing-pricing")
            }
          >
            Add Purchasing Pricing
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/itemsandinventory/maintenance/items")}
          >
            Back
          </Button>
        </Stack>
      </Box>

      {/* Search */}
      <Stack
        direction="row"
        sx={{ px: 2, mb: 2, width: "100%", justifyContent: "flex-end" }}
      >
        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search Supplier, Description, Currency or Price..."
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
          <Table aria-label="purchasing pricing table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Supplier's Unit</TableCell>
                <TableCell>Conversion Factor</TableCell>
                <TableCell>Supplier's Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.currency}</TableCell>
                    <TableCell>{item.supplierUnit}</TableCell>
                    <TableCell>{item.conversionFactor}</TableCell>
                    <TableCell>{item.supplierDescription}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate(
                              `/itemsandinventory/maintenance/items/update-purchasing-pricing/${item.id}`
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
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={8}
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

export default PurchasingPricingTable;
