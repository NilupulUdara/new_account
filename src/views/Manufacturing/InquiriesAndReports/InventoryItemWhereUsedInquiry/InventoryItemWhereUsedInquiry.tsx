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
    ListSubheader,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { useQuery } from "@tanstack/react-query";
import { getItems } from "../../../../api/Item/ItemApi";
import { getBoms } from "../../../../api/Bom/BomApi";
import { getWorkCentres } from "../../../../api/WorkCentre/WorkCentreApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";

function InventoryItemWhereUsedInquiry() {
    const [selectedItem, setSelectedItem] = useState("");
    const [itemCode, setItemCode] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const navigate = useNavigate();

    const { data: rawItems } = useQuery({
        queryKey: ["items"],
        queryFn: getItems,
    });

    // Fetch categories using React Query
    const { data: categories = [] } = useQuery<{ category_id: number; description: string }[]>({
        queryKey: ["itemCategories"],
        queryFn: () => getItemCategories() as Promise<{ category_id: number; description: string }[]>,
    });

    // Backend may return `{ data: [...] }` or the array directly. Normalize to array.
    const items = rawItems?.data ?? rawItems ?? [];

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

    // Fetch BOMs, work centres and locations
    const { data: rawBoms = [] } = useQuery({ queryKey: ["boms"], queryFn: getBoms });
    const { data: workCentres = [] } = useQuery({ queryKey: ["workCentres"], queryFn: getWorkCentres });
    const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });

    // Build where-used rows: parents where component === selected item
    const whereUsed = useMemo(() => {
        if (!selectedItem) return [];
        const allBoms = Array.isArray(rawBoms?.data ?? rawBoms) ? (rawBoms.data ?? rawBoms) : (rawBoms || []);
        const matches = allBoms.filter((b: any) => String(b.component) === String(itemCode) || String(b.component) === String(selectedItem));
        return matches.map((b: any) => {
            const parent = String(b.parent ?? b.parent_item ?? b.parent_stock_id ?? "");
            const qty = Number(b.quantity ?? b.qty ?? b.units_req ?? 0) || 0;
            const wc = (workCentres || []).find((w: any) => String(w.id ?? w.work_centre_id ?? w.workcentre_id ?? w.work_centre) === String(b.work_centre ?? b.work_centre_id ?? ""));
            const wcLabel = wc ? (wc.work_centre_name ?? wc.name ?? wc.description ?? String(b.work_centre)) : String(b.work_centre ?? "");
            const loc = (locations || []).find((l: any) => String(l.loc_code ?? l.loccode ?? l.code ?? "") === String(b.loc_code ?? b.loccode ?? ""));
            const locLabel = loc ? (loc.location_name ?? String(b.loc_code ?? "")) : String(b.loc_code ?? "");
            const parentRec = (items || []).find((it: any) => String(it.stock_id ?? it.id) === String(parent));
            const parentLabel = parentRec ? `${parent} - ${parentRec.item_name ?? parentRec.name ?? parentRec.description ?? ""}` : parent;
            return { parentId: parent, parentItem: parentLabel, workCentre: wcLabel, location: locLabel, quantityRequired: qty };
        });
    }, [rawBoms, selectedItem, itemCode, workCentres, locations]);

    const paginatedData = useMemo(() => {
        if (rowsPerPage === -1) return whereUsed;
        return whereUsed.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [whereUsed, page, rowsPerPage]);

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Inventory Item Where Used Inquiry" },
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
                    <PageTitle title="Inventory Item Where Used Inquiry" />
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
                        <Table aria-label="inventory item where used inquiry table">
                            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                                <TableRow>
                                    <TableCell>Parent Item</TableCell>
                                    <TableCell>Work Centre</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Quantity Required</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item, index) => (
                                        <TableRow key={index} hover>
                                                <TableCell>
                                                    <Button
                                                        variant="text"
                                                        color="primary"
                                                        onClick={() => navigate("/manufacturing/maintenance/bills-of-material", { state: { stock_id: item.parentId } })}
                                                    >
                                                        {item.parentItem}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>{item.workCentre}</TableCell>
                                                <TableCell>{item.location}</TableCell>
                                                <TableCell>{item.quantityRequired}</TableCell>
                                            </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography variant="body2">No Records Found</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                                        colSpan={4}
                                        count={whereUsed.length}
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

export default InventoryItemWhereUsedInquiry;
