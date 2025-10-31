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
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { useQuery } from "@tanstack/react-query";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemCodes } from "../../../../api/ItemCodes/ItemCodesApi";

function ForeignItemCodesTable() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState(""); // dropdown state

    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const navigate = useNavigate();

    const { data: rawForeignItemData } = useQuery({
        queryKey: ["item-codes"],
        queryFn: getItemCodes,
    });

    const { data: rawItems } = useQuery({
        queryKey: ["items"],
        queryFn: getItems,
    });

    // Backend may return `{ data: [...] }` or the array directly. Normalize to array.
    const foreignItemData = rawForeignItemData?.data ?? rawForeignItemData ?? [];
    const items = rawItems?.data ?? rawItems ?? [];

    // Auto-select the first item when items load and nothing is selected yet
    useEffect(() => {
        if ((!selectedItem || String(selectedItem).trim() === "") && items && items.length > 0) {
            const first = items[0];
            const firstStockId = first?.stock_id ?? first?.id ?? first?.stock_master_id ?? first?.item_id ?? 0;
            setSelectedItem(String(firstStockId));
        }
    }, [items]);

    // Filter data based on selected item and search query
   const filteredData = useMemo(() => {
    // Only filter when an item is selected
    if (!selectedItem) return [];

    // The only shared column between items and item-codes is `stock_id`.
    // Match item-codes where code.stock_id === selectedItem and is_foreign === 1.
    const result = foreignItemData.filter((code: any) => {
        const codeStockId = code.stock_id ?? code.stockMasterId ?? code.stock_master?.stock_id ?? code.stock_master_id ?? code.item_id ?? code.itemId;
        return String(codeStockId) === String(selectedItem) && code.is_foreign === 1;
    });

    if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        return result.filter((item: any) => {
            const codeStr = String(item.item_code ?? item.code ?? "").toLowerCase();
            const desc = String(item.description ?? "").toLowerCase();
            const cat = String(item.category_id ?? item.category ?? "").toLowerCase();
            return (
                codeStr.includes(lowerQuery) ||
                desc.includes(lowerQuery) ||
                cat.includes(lowerQuery)
            );
        });
    }

    return result;
}, [foreignItemData, selectedItem, searchQuery]);


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
        alert(`Delete Item with id: ${id}`);
    };

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Foreign Item Codes" },
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box>
                    <PageTitle title="Foreign Item Codes" />
                    <Breadcrumb breadcrumbs={breadcrumbItems} />
                </Box>

                <Box sx={{ px: 2, mb: 2 }}>
                    <FormControl sx={{ minWidth: 250 }}>
                        <InputLabel>Select Item</InputLabel>
                        <Select
                            value={selectedItem}
                            label="Select Item"
                            onChange={(e) => setSelectedItem(e.target.value)}
                        >
                                {items && items.length > 0 ? (
                                items.map((item, idx) => {
                                    // Prefer stock_id as the join key between items and item-codes
                                    const stockId = item.stock_id ?? item.id ?? item.stock_master_id ?? item.item_id ?? idx;
                                    const key = stockId;
                                    const label = item.item_name ?? item.name ?? item.description ?? String(stockId);
                                    const value = String(stockId);
                                    return (
                                        <MenuItem key={String(key)} value={value}>
                                            {label}
                                        </MenuItem>
                                    );
                                })
                            ) : (
                                <MenuItem disabled value="">
                                    No items
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Box>

                    <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/itemsandinventory/maintenance/add-foreign-item-codes", { state: { stock_id: selectedItem } })}
                    >
                        Add Item
                    </Button>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/itemsandinventory/maintenance/")}>
                        Back
                    </Button>
                </Stack>
            </Box>

            {/* Search bar only visible if item is selected */}
            {selectedItem && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2, mb: 2 }}>
                    <TextField
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        size="small"
                    />
                </Box>
            )}

            {/* Table */}
            {selectedItem && (
                <Stack sx={{ alignItems: "center" }}>
                    <TableContainer
                        component={Paper}
                        elevation={2}
                        sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
                    >
                        <Table aria-label="foreign item codes table">
                            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                                <TableRow>
                                    <TableCell>No</TableCell>
                                    <TableCell>EAN/UPC Code</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Units</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item, index) => (
                                        <TableRow key={item.id ?? index} hover>
                                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell>{item.item_code ?? item.code}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>each</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.category_id ?? item.category}</TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => navigate("/itemsandinventory/maintenance/update-foreign-item-codes", { state: { stock_id: selectedItem, itemCode: item } })}
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
                                        <TableCell colSpan={6} align="center">
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
            )}
        </Stack>
    );
}

export default ForeignItemCodesTable;
