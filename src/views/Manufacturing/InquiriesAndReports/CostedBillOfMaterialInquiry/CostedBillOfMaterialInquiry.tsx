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
    Paper,
    Typography,
    useMediaQuery,
    Theme,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ListSubheader,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemCodes, deleteItemCode } from "../../../../api/ItemCodes/ItemCodesApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";

function CostedBillOfMaterialInquiry() {
    const [selectedItem, setSelectedItem] = useState("");
    const [itemCode, setItemCode] = useState("");
    const [copyItemCode, setCopyItemCode] = useState("");
    const [selectedCopyItem, setSelectedCopyItem] = useState("");

    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: rawForeignItemData } = useQuery({
        queryKey: ["item-codes"],
        queryFn: getItemCodes,
    });

    const { data: rawItems } = useQuery({
        queryKey: ["items"],
        queryFn: getItems,
    });

    // Fetch categories using React Query
    const { data: categories = [] } = useQuery<{ category_id: number; description: string }[]>({
        queryKey: ["itemCategories"],
        queryFn: () => getItemCategories() as Promise<{ category_id: number; description: string }[]>,
    });

    // Mutation to delete item code
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteItemCode(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["item-codes"] });
            alert("Item code deleted successfully!");
        },
        onError: (err: any) => {
            console.error("Failed to delete item code:", err);
            alert("Failed to delete item code");
        },
    });

    // Backend may return `{ data: [...] }` or the array directly. Normalize to array.
    const foreignItemData = rawForeignItemData?.data ?? rawForeignItemData ?? [];
    const items = rawItems?.data ?? rawItems ?? [];

    // Fetch item units so we can display unit text
    const { data: rawItemUnits } = useQuery({
        queryKey: ["item-units"],
        queryFn: () => import("../../../../api/ItemUnit/ItemUnitApi").then(m => m.getItemUnits()),
    });
    const itemUnits = rawItemUnits?.data ?? rawItemUnits ?? [];

    // Auto-select the first item when items load and nothing is selected yet
    useEffect(() => {
        if ((!selectedItem || String(selectedItem).trim() === "") && items && items.length > 0) {
            const first = items[0];
            const firstStockId = first?.stock_id ?? first?.id ?? first?.stock_master_id ?? first?.item_id ?? 0;
            setSelectedItem(String(firstStockId));
            setItemCode(String(firstStockId));
        }
    }, [items]);

    // Update item code when selected item changes
    useEffect(() => {
        if (selectedItem && items && items.length > 0) {
            const selectedItemData = items.find((item: any) => String(item.stock_id ?? item.id) === String(selectedItem));
            if (selectedItemData) {
                setItemCode(String(selectedItemData.stock_id ?? selectedItemData.id ?? selectedItem));
            }
        }
    }, [selectedItem, items]);

    // Update copy item code when selected copy item changes
    useEffect(() => {
        if (selectedCopyItem && items && items.length > 0) {
            const selectedCopyItemData = items.find((item: any) => String(item.stock_id ?? item.id) === String(selectedCopyItem));
            if (selectedCopyItemData) {
                setCopyItemCode(String(selectedCopyItemData.stock_id ?? selectedCopyItemData.id ?? selectedCopyItem));
            }
        } else {
            setCopyItemCode("");
        }
    }, [selectedCopyItem, items]);

    // Filter data based on selected item
   const filteredData = useMemo(() => {
    // Only filter when an item is selected
    if (!selectedItem) return [];

    // The only shared column between items and item-codes is `stock_id`.
    // Match item-codes where code.stock_id === selectedItem and is_foreign === 1.
    const result = foreignItemData.filter((code: any) => {
        const codeStockId = code.stock_id ?? code.stockMasterId ?? code.stock_master?.stock_id ?? code.stock_master_id ?? code.item_id ?? code.itemId;
        return String(codeStockId) === String(selectedItem) && code.is_foreign === 1;
    });

    return result;
}, [foreignItemData, selectedItem]);

    // Dummy data for the table
    const dummyData = [
        { component: 'COMP001', description: 'Steel Rod', workCentre: 'Assembly Line 1', location: 'Warehouse A', quantity: 5, unitCost: 10.50 },
        { component: 'COMP002', description: 'Plastic Cover', workCentre: 'Packaging Station', location: 'Warehouse B', quantity: 10, unitCost: 5.25 },
        { component: 'COMP003', description: 'Copper Wire', workCentre: 'Assembly Line 2', location: 'Warehouse A', quantity: 20, unitCost: 2.10 },
        { component: 'COMP004', description: 'Screw Set', workCentre: 'Quality Check', location: 'Warehouse C', quantity: 50, unitCost: 0.75 },
    ];

    // Calculate total cost
    const totalCost = useMemo(() => {
        return dummyData.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    }, []);

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Costed Bill Of Material Inquiry" },
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
                    <PageTitle title="Costed Bill Of Material Inquiry" />
                    <Breadcrumb breadcrumbs={breadcrumbItems} />
                </Box>

                <Box sx={{ px: 2, mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                        label="Item Code"
                        value={itemCode}
                        InputProps={{
                            readOnly: true,
                        }}
                        size="medium"
                        sx={{ maxWidth: 90 }}
                    />
                    <FormControl sx={{ minWidth: 180 }} size="medium">
                        <InputLabel>Select Item</InputLabel>
                        <Select
                            value={selectedItem}
                            label="Select Item"
                            onChange={(e) => setSelectedItem(e.target.value)}
                        >
                                {items && items.length > 0 ? (
                                (() => {
                                    return Object.entries(
                                        items.reduce((groups: Record<string, any[]>, item) => {
                                            const catId = item.category_id || "Uncategorized";
                                            if (!groups[catId]) groups[catId] = [];
                                            groups[catId].push(item);
                                            return groups;
                                        }, {} as Record<string, any[]>)
                                    ).map(([categoryId, groupedItems]: [string, any[]]) => {
                                        const category = categories.find(cat => cat.category_id === Number(categoryId));
                                        const categoryLabel = category ? category.description : `Category ${categoryId}`;
                                        return [
                                            <ListSubheader key={`cat-${categoryId}`}>
                                                {categoryLabel}
                                            </ListSubheader>,
                                            groupedItems.map((item) => {
                                                const stockId = item.stock_id ?? item.id ?? item.stock_master_id ?? item.item_id ?? 0;
                                                const key = stockId;
                                                const label = item.item_name ?? item.name ?? item.description ?? String(stockId);
                                                const value = String(stockId);
                                                return (
                                                    <MenuItem key={String(key)} value={value}>
                                                        {label}
                                                    </MenuItem>
                                                );
                                            })
                                        ];
                                    });
                                })()
                            ) : (
                                <MenuItem disabled value="">
                                    No items
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Box>

                    <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/manufacturing/inquiriesandreports/")}>
                        Back
                    </Button>
                </Stack>
            </Box>

            {/* Table */}
            {selectedItem && (
                <Stack sx={{ alignItems: "center" }}>
                    <TableContainer
                        component={Paper}
                        elevation={2}
                        sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
                    >
                        <Table aria-label="costed bill of material inquiry table">
                            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                                <TableRow>
                                    <TableCell>Component</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Work Centre</TableCell>
                                    <TableCell>From Location</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit Cost</TableCell>
                                    <TableCell>Cost</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {dummyData.map((item, index) => {
                                    const cost = item.quantity * item.unitCost;
                                    return (
                                        <TableRow key={index} hover>
                                            <TableCell>{item.component}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.workCentre}</TableCell>
                                            <TableCell>{item.location}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.unitCost.toFixed(2)}</TableCell>
                                            <TableCell>{cost.toFixed(2)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                <TableRow sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
                                    <TableCell colSpan={6} sx={{ fontWeight: "bold" }}>
                                        Total Cost
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                        {totalCost.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            )}
        </Stack>
    );
}

export default CostedBillOfMaterialInquiry;
