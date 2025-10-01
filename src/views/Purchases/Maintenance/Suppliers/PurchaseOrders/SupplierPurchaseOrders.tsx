import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
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
    TextField,
    useMediaQuery,
    Theme,
    Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../../components/BreadCrumb";
import PageTitle from "../../../../../components/PageTitle";
import theme from "../../../../../theme";
import DatePickerComponent from "../../../../../components/DatePickerComponent";
import { Grid } from "@mui/material";

interface SupplierPurchaseOrderProps {
    supplierId?: string | number;
}

// Mock API
const getPurchaseOrders = async () => [
    {
        id: 1,
        order: "PO1001",
        ref: "REF001",
        supplier: "Supplier A",
        branch: "Colombo",
        supplierRef: "SREF001",
        orderDate: "2025-09-01",
        currency: "LKR",
        orderTotal: "5000",
    },
    {
        id: 2,
        order: "PO1002",
        ref: "REF002",
        supplier: "Supplier B",
        branch: "Kandy",
        supplierRef: "SREF002",
        orderDate: "2025-09-05",
        currency: "USD",
        orderTotal: "12000",
    },
];

export default function SupplierPurchaseOrdersTable({ supplierId }: SupplierPurchaseOrderProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [searchFilters, setSearchFilters] = useState({
        order: "",
        ref: "",
        fromDate: null as Date | null,
        toDate: null as Date | null,
        location: "",
        item: "",
    });

    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const navigate = useNavigate();

    // Fetch data
    useEffect(() => {
        getPurchaseOrders().then((data) => setPurchaseOrders(data));
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchFilters({ ...searchFilters, [name]: value });
    };

    const handleDateChange = (name: string, date: Date | null) => {
        setSearchFilters({ ...searchFilters, [name]: date });
    };

    // Filtered data
    const filteredData = useMemo(() => {
        return purchaseOrders.filter((so) => {
            // Match order #
            const matchesOrder = searchFilters.order
                ? so.order.toLowerCase().includes(searchFilters.order.toLowerCase())
                : true;

            // Match location (branch only now)
            const matchesLocation = searchFilters.location
                ? so.branch.toLowerCase().includes(searchFilters.location.toLowerCase())
                : true;

            // Match item (not in your mock data — keep optional if you’ll add later)
            const matchesItem = searchFilters.item
                ? (so.item?.toLowerCase().includes(searchFilters.item.toLowerCase()) ?? false)
                : true;

            // Match dates
            let matchesDate = true;
            if (searchFilters.fromDate) {
                matchesDate =
                    new Date(so.orderDate).getTime() >= searchFilters.fromDate.getTime();
            }
            if (matchesDate && searchFilters.toDate) {
                matchesDate =
                    new Date(so.orderDate).getTime() <= searchFilters.toDate.getTime();
            }

            return matchesOrder && matchesLocation && matchesItem && matchesDate;
        });
    }, [purchaseOrders, searchFilters]);



    const paginatedData = useMemo(() => {
        if (rowsPerPage === -1) return filteredData;
        return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredData, page, rowsPerPage]);

    const handleChangePage = (_event: any, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleDelete = (id: number) => {
        alert(`Delete Purchase Order with id: ${id}`);
    };

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Purchase Orders" },
    ];

    return (
        <Stack>
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
                    <PageTitle title="Purchase Orders" />
                    <Breadcrumb breadcrumbs={breadcrumbItems} />
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/purchase/maintenance/suppliers")}
                    >
                        Back
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={2} sx={{ px: 2, mb: 2 }}>
                {/* Order # */}
                <Grid item xs={12} sm={2}>
                    <TextField
                        fullWidth
                        label="#"
                        name="order"
                        size="small"
                        value={searchFilters.order}
                        onChange={handleFilterChange}
                    />
                </Grid>

                {/* From Date */}
                <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>From Date:</Typography>
                    <DatePickerComponent
                        label=""
                        value={searchFilters.fromDate}
                        onChange={(date) => handleDateChange("fromDate", date)}
                    />
                </Grid>

                {/* To Date */}
                <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>To Date:</Typography>
                    <DatePickerComponent
                        label=""
                        value={searchFilters.toDate}
                        onChange={(date) => handleDateChange("toDate", date)}
                    />
                </Grid>

                {/* Location */}
                <Grid item xs={12} sm={2}>
                    <TextField
                        fullWidth
                        label="Location"
                        name="location"
                        size="small"
                        value={searchFilters.location}
                        onChange={handleFilterChange}
                    />
                </Grid>

                {/* Item */}
                <Grid item xs={12} sm={2}>
                    <TextField
                        fullWidth
                        label="Item"
                        name="item"
                        size="small"
                        value={searchFilters.item}
                        onChange={handleFilterChange}
                    />
                </Grid>
            </Grid>



            <Stack sx={{ alignItems: "center" }}>
                <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
                    <Table aria-label="purchase orders table">
                        <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Ref</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Supplier's Reference</TableCell>
                                <TableCell>Order Date</TableCell>
                                <TableCell>Currency</TableCell>
                                <TableCell>Order Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((so) => (
                                    <TableRow key={so.id} hover>
                                        <TableCell>{so.order}</TableCell>
                                        <TableCell>{so.ref}</TableCell>
                                        <TableCell>{so.supplier}</TableCell>
                                        <TableCell>{so.branch}</TableCell>
                                        <TableCell>{so.supplierRef}</TableCell>
                                        <TableCell>{so.orderDate}</TableCell>
                                        <TableCell>{so.currency}</TableCell>
                                        <TableCell>{so.orderTotal}</TableCell>

                                        {/* <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => navigate(`/sales/orders/update/${so.id}`)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => handleDelete(so.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </Stack>
                                        </TableCell> */}
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
                                    count={filteredData.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    showFirstButton
                                    showLastButton
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Stack>
        </Stack>
    );
}
