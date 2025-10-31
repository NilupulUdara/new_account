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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import theme from "../../../../theme";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import SearchBar from "../../../../components/SearchBar";
import { getPurchData, PurchData, deletePurchData } from "../../../../api/PurchasingPricing/PurchasingPricingApi";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";

interface ItemPurchasinPricingProps {
  itemId?: string | number;
}

interface Supplier {
  supplier_id: number;
  supp_name: string;
}

interface PurchasingPricing {
  supplier_id: number;
  stock_id: string;
  price: number;
  suppliers_uom: string;
  conversion_factor: number;
  supplier_description?: string;
  supplier_name?: string; // Added for display
}

function ViewPurchasingPricing({ itemId }: ItemPurchasinPricingProps) {
  const [purchaseData, setPurchaseData] = useState<PurchasingPricing[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | number>(itemId || "");
  const [showInactive, setShowInactive] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // Fetch items for dropdown
  const [items, setItems] = useState<{ stock_id: string | number; category_id: string | number; description: string; inactive: number }[]>([]);
  const [categories, setCategories] = useState<{ category_id: number; description: string }[]>([]);

  // Fetch items and categories
  useEffect(() => {
    const fetchItemsAndCategories = async () => {
      try {
        const itemsData = await getItems();
        setItems(itemsData);
        const categoriesData = await getItemCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch items and categories:", error);
      }
    };
    fetchItemsAndCategories();
  }, []);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch purchasing pricing data
        const purchData = await getPurchData();

        // Fetch suppliers for name mapping
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);

        // Filter by selectedItem if provided and map supplier names
        let filteredData = [];
        if (selectedItem) {
          filteredData = purchData.filter(item => item.stock_id === selectedItem.toString());
        }

        // Map supplier names
        const dataWithSupplierNames = filteredData.map(item => ({
          ...item,
          supplier_name: suppliersData.find(s => s.supplier_id === item.supplier_id)?.supp_name || 'Unknown Supplier'
        }));

        setPurchaseData(dataWithSupplierNames);
      } catch (error) {
        console.error("Failed to fetch purchasing pricing data:", error);
        setPurchaseData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedItem]);

  // Filter by search
  const filteredData = useMemo(() => {
    return purchaseData.filter((item) => {
      return (
        (item.supplier_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supplier_description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.suppliers_uom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.price.toString().includes(searchQuery) ||
        item.stock_id.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDelete = async (supplierId: number, stockId: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deletePurchData(supplierId, stockId);
        // Refresh data after deletion
        const updatedData = await getPurchData();
        let filteredData = [];
        if (selectedItem) {
          filteredData = updatedData.filter(item => item.stock_id === selectedItem.toString());
        }
        const dataWithSupplierNames = filteredData.map(item => ({
          ...item,
          supplier_name: suppliers.find(s => s.supplier_id === item.supplier_id)?.supp_name || 'Unknown Supplier'
        }));
        setPurchaseData(dataWithSupplierNames);
      } catch (error) {
        console.error("Failed to delete purchasing pricing:", error);
        alert("Failed to delete the record. Please try again.");
      }
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
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <PageTitle title="Purchasing Pricing" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        {/* Item dropdown and checkbox */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Select Item</InputLabel>
            <Select
              value={selectedItem}
              label="Select Item"
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <MenuItem value="" key="none">
                <em>Select an Item</em>
              </MenuItem>

              {/* Group items by category_id */}
              {(() => {
                const filteredItems = items.filter(item => showInactive || item.inactive !== 1);
                return Object.entries(
                  filteredItems.reduce((groups, item) => {
                    const catId = item.category_id || "Uncategorized";
                    if (!groups[catId]) groups[catId] = [];
                    groups[catId].push(item);
                    return groups;
                  }, {} as Record<string, typeof filteredItems>)
                ).map(([categoryId, groupedItems]) => {
                  const category = categories.find(cat => cat.category_id === Number(categoryId));
                  const categoryLabel = category ? category.description : `Category ${categoryId}`;
                  return [
                    <ListSubheader key={`cat-${categoryId}`}>
                      {categoryLabel}
                    </ListSubheader>,
                    groupedItems.map((item) => (
                      <MenuItem key={item.stock_id} value={item.stock_id}>
                        {item.description}
                      </MenuItem>
                    ))
                  ];
                });
              })()}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
            }
            label="Show Inactive"
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              navigate(`/itemsandinventory/pricingandcosts/add-purchasing-pricing/${selectedItem}`)
            }
            disabled={!selectedItem}
          >
            Add Purchasing Pricing
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
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
            placeholder="Search Supplier, Description, UOM, Price or Stock ID..."
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={`${item.supplier_id}-${item.stock_id}`} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{item.supplier_name}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>USD</TableCell>
                    <TableCell>{item.suppliers_uom}</TableCell>
                    <TableCell>{item.conversion_factor}</TableCell>
                    <TableCell>{item.supplier_description || ''}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate(
                              `/itemsandinventory/pricingandcosts/update-purchasing-pricing/${item.supplier_id}/${item.stock_id}`
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
                          onClick={() => handleDelete(item.supplier_id, item.stock_id)}
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
                    <Typography variant="body2">
                      {selectedItem ? "No Records Found" : "Please select an item to view purchasing pricing"}
                    </Typography>
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

export default ViewPurchasingPricing;
