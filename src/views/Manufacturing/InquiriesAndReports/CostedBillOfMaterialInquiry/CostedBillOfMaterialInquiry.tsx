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
import { useQuery } from "@tanstack/react-query";
import { getItems } from "../../../../api/Item/ItemApi";
import { getBoms } from "../../../../api/Bom/BomApi";
import { getWorkCentres } from "../../../../api/WorkCentre/WorkCentreApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";

import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";

function CostedBillOfMaterialInquiry() {
    const [selectedItem, setSelectedItem] = useState("");
    const [itemCode, setItemCode] = useState("");

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

    const filteredItems = useMemo(() => (items || []).filter((it: any) => {
        const flag = it.mb_flag ?? it.mbFlag ?? it.mb ?? 0;
        return Number(flag) === 1;
    }), [items]);

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

    const { data: rawBoms = [] } = useQuery({ queryKey: ["boms"], queryFn: getBoms });
    const { data: workCentres = [] } = useQuery({ queryKey: ["workCentres"], queryFn: getWorkCentres });
    const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });

    // selected item record
    const selectedItemRec = useMemo(() => {
        if (!selectedItem) return null;
        return (items || []).find((it: any) => String(it.stock_id ?? it.id) === String(selectedItem)) || null;
    }, [items, selectedItem]);

    const standardLabourCost = useMemo(() => Number(selectedItemRec?.labour_cost ?? selectedItemRec?.labourCost ?? selectedItemRec?.standard_labour_cost ?? 0) || 0, [selectedItemRec]);
    const standardOverheadCost = useMemo(() => Number(selectedItemRec?.overhead_cost ?? selectedItemRec?.overheadCost ?? selectedItemRec?.standard_overhead_cost ?? 0) || 0, [selectedItemRec]);

    // Build BOM line items for selected parent item
    const bomLines = useMemo(() => {
        if (!selectedItem) return [];
        const allBoms = Array.isArray(rawBoms?.data ?? rawBoms) ? (rawBoms.data ?? rawBoms) : (rawBoms || []);
        const matches = allBoms.filter((b: any) => String(b.parent) === String(selectedItem));
        return matches.map((b: any) => {
            const componentId = String(b.component ?? b.component_stock_id ?? b.component_id ?? "");
            const qty = Number(b.quantity ?? b.qty ?? b.units_req ?? 0) || 0;
            const itemRec = (items || []).find((it: any) => String(it.stock_id ?? it.id) === componentId);
            const descr = itemRec ? (itemRec.item_name ?? itemRec.name ?? itemRec.description ?? "") : "";
            const unitCost = Number(itemRec?.material_cost ?? itemRec?.materialCost ?? itemRec?.standard_cost ?? itemRec?.unit_cost ?? 0) || 0;
            const wc = (workCentres || []).find((w: any) => String(w.id ?? w.work_centre_id ?? w.work_centre) === String(b.work_centre ?? b.work_centre_id ?? ""));
            const wcLabel = wc ? (wc.work_centre_name ?? wc.name ?? wc.description ?? String(b.work_centre)) : String(b.work_centre ?? "");
            const loc = (locations || []).find((l: any) => String(l.loc_code ?? l.loccode ?? l.code ?? "") === String(b.loc_code ?? b.loccode ?? ""));
            const locLabel = loc ? (loc.location_name ?? String(b.loc_code ?? "")) : String(b.loc_code ?? "");
            const cost = qty * unitCost;
            return {
                component: componentId,
                description: descr,
                workCentre: wcLabel,
                location: locLabel,
                quantity: qty,
                unitCost,
                cost,
            };
        });
    }, [rawBoms, selectedItem, items, workCentres, locations]);

    const totalCost = useMemo(() => {
        const bomSum = (bomLines || []).reduce((sum: number, line: any) => sum + (Number(line.cost) || 0), 0);
        return bomSum + (Number(standardLabourCost) || 0) + (Number(standardOverheadCost) || 0);
    }, [bomLines, standardLabourCost, standardOverheadCost]);

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Costed Bill Of Material Inquiry" },
    ];

    return (
        <Stack>
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
                                {filteredItems && filteredItems.length > 0 ? (
                                (() => {
                                    return Object.entries(
                                        filteredItems.reduce((groups: Record<string, any[]>, item) => {
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
                                {(bomLines || []).map((line: any, index: number) => (
                                    <TableRow key={String(line.component) + "-" + index} hover>
                                        <TableCell>{line.component}</TableCell>
                                        <TableCell>{line.description}</TableCell>
                                        <TableCell>{line.workCentre}</TableCell>
                                        <TableCell>{line.location}</TableCell>
                                        <TableCell>{line.quantity}</TableCell>
                                        <TableCell>{Number(line.unitCost).toFixed(2)}</TableCell>
                                        <TableCell>{Number(line.cost).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableCell colSpan={6} sx={{ fontWeight: "normal" }}>
                                        Standard Labour Cost
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "normal" }}>
                                        {Number(standardLabourCost).toFixed(2)}
                                    </TableCell>
                                </TableRow>

                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableCell colSpan={6} sx={{ fontWeight: "normal" }}>
                                        Standard Overhead Cost
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "normal" }}>
                                        {Number(standardOverheadCost).toFixed(2)}
                                    </TableCell>
                                </TableRow>

                                <TableRow sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
                                    <TableCell colSpan={6} sx={{ fontWeight: "bold" }}>
                                        Total Cost
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                        {Number(totalCost).toFixed(2)}
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
