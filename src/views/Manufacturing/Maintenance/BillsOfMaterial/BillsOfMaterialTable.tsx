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

function BillsOfMaterialTable() {
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

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this item code?")) {
            deleteMutation.mutate(id);
        }
    };

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Bill Of Material" },
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
                    <PageTitle title="Bill Of Material" />
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/manufacturing/maintenance/add-bills-of-material", { state: { stock_id: selectedItem } })}
                    >
                        Add New
                    </Button>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/manufacturing/maintenance/")}>
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
                        <Table aria-label="foreign item codes table">
                            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                                <TableRow>
                                    <TableCell>Code</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Work Centre</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Units</TableCell>
                                    <TableCell align="center">Action</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow hover>
                                    <TableCell>101</TableCell>
                                    <TableCell>Item1</TableCell>
                                    <TableCell>default</TableCell>
                                    <TableCell>work centre</TableCell>
                                    <TableCell>10</TableCell>
                                    <TableCell>each</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => {navigate("/manufacturing/maintenance/update-bills-of-material")}}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => {}}
                                            >
                                                Delete
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <TableRow key={item.id ?? index} hover>
                                            <TableCell>{item.item_code ?? item.code}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>
                                                {
                                                    // resolve corresponding item and map its units id to unit text
                                                    (() => {
                                                        const codeStockId = item.stock_id ?? item.stockMasterId ?? item.stock_master?.stock_id ?? item.stock_master_id ?? item.item_id ?? item.itemId;
                                                        const correspondingItem = items.find((it: any) => String(it.stock_id ?? it.id) === String(codeStockId));
                                                        if (correspondingItem) {
                                                            const unitId = correspondingItem.units ?? correspondingItem.unit ?? correspondingItem.unit_id;
                                                            if (unitId && itemUnits && itemUnits.length > 0) {
                                                                const u = itemUnits.find((uu: any) => String(uu.id) === String(unitId));
                                                                if (u) return u.description ?? u.name ?? u.abbr ?? String(unitId);
                                                            }
                                                            return correspondingItem.unit_name ?? correspondingItem.unit ?? correspondingItem.units ?? "each";
                                                        }
                                                        return "each";
                                                    })()
                                                }
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => navigate("/manufacturing/maintenance/update-bills-of-material")}
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
                                ) : null}
                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableCell colSpan={4} sx={{ fontWeight: "bold", borderRight: "1px solid #ddd" }}>
                                        Copy BOM to another manufacturable item
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>
                                        <TextField
                                            size="small"
                                            value={copyItemCode}
                                            placeholder="Item Code"
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            sx={{ maxWidth: 110 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>
                                        <FormControl size="small" sx={{ minWidth: 150 }}>
                                            <InputLabel>Select Item</InputLabel>
                                            <Select
                                                value={selectedCopyItem}
                                                label="Select Item"
                                                onChange={(e) => setSelectedCopyItem(e.target.value)}
                                            >
                                                <MenuItem value="">
                                                    <em>None</em>
                                                </MenuItem>
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
                                                                <ListSubheader key={`copy-cat-${categoryId}`}>
                                                                    {categoryLabel}
                                                                </ListSubheader>,
                                                                groupedItems.map((item) => {
                                                                    const stockId = item.stock_id ?? item.id ?? item.stock_master_id ?? item.item_id ?? 0;
                                                                    const key = stockId;
                                                                    const label = item.item_name ?? item.name ?? item.description ?? String(stockId);
                                                                    const value = String(stockId);
                                                                    return (
                                                                        <MenuItem key={`copy-${String(key)}`} value={value}>
                                                                            {label}
                                                                        </MenuItem>
                                                                    );
                                                                })
                                                            ];
                                                        });
                                                    })()
                                                ) : null}
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                        >
                                            Copy
                                        </Button>
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

export default BillsOfMaterialTable;
