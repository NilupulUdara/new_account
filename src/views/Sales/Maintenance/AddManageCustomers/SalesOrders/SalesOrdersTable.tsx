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
    Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../../components/BreadCrumb";
import PageTitle from "../../../../../components/PageTitle";
import theme from "../../../../../theme";
import DatePickerComponent from "../../../../../components/DatePickerComponent";

interface SalesOrdersProps {
    customerId?: string | number;
}

// Mock API
const getSalesOrders = async () => [
    {
        id: 1,
        ref: "REF001",
        order: "SO001",
        customer: "Customer A",
        branch: "Colombo",
        custOrderRef: "CREF001",
        orderDate: "2025-09-01",
        requiredBy: "2025-09-10",
        deliveryTo: "Colombo Warehouse",
        orderTotal: "5000",
        currency: "LKR",
        tmpl: "Template A",
    },
    {
        id: 2,
        ref: "REF002",
        order: "SO002",
        customer: "Customer B",
        branch: "Kandy",
        custOrderRef: "CREF002",
        orderDate: "2025-09-05",
        requiredBy: "2025-09-12",
        deliveryTo: "Kandy Warehouse",
        orderTotal: "12000",
        currency: "USD",
        tmpl: "Template B",
    },
];

export default function SalesOrdersTable({ customerId }: SalesOrdersProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [salesOrders, setSalesOrders] = useState<any[]>([]);
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
        getSalesOrders().then((data) => setSalesOrders(data));
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
        return salesOrders.filter((so) => {
            // Match order #
            const matchesOrder = searchFilters.order
                ? so.order.toLowerCase().includes(searchFilters.order.toLowerCase())
                : true;

            // Match customer order ref
            const matchesRef = searchFilters.ref
                ? so.custOrderRef.toLowerCase().includes(searchFilters.ref.toLowerCase())
                : true;

            // Match location (branch or deliveryTo)
            const matchesLocation = searchFilters.location
                ? so.branch.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
                so.deliveryTo.toLowerCase().includes(searchFilters.location.toLowerCase())
                : true;

            // Match item/template
            const matchesItem = searchFilters.item
                ? so.tmpl.toLowerCase().includes(searchFilters.item.toLowerCase())
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
            return matchesOrder && matchesRef && matchesLocation && matchesItem && matchesDate;
        });
    }, [salesOrders, searchFilters]);


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
        alert(`Delete Sales Order with id: ${id}`);
    };

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Sales Orders" },
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
                    <PageTitle title="Sales Orders" />
                    <Breadcrumb breadcrumbs={breadcrumbItems} />
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/sales/maintenance/add-and-manage-customers")}
                    >
                        Back
                    </Button>
                </Stack>
            </Box>

            {/* Search & Filter */}
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

                {/* Ref */}
                <Grid item xs={12} sm={2}>
                    <TextField
                        fullWidth
                        label="Ref"
                        name="ref"
                        size="small"
                        value={searchFilters.ref}
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

                {/* Item / Template */}
                <Grid item xs={12} sm={2}>
                    <TextField
                        fullWidth
                        label="Item / Template"
                        name="item"
                        size="small"
                        value={searchFilters.item}
                        onChange={handleFilterChange}
                    />
                </Grid>
            </Grid>


            <Stack sx={{ alignItems: "center" }}>
                <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
                    <Table aria-label="sales orders table">
                        <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                            <TableRow>
                                <TableCell>Order</TableCell>
                                <TableCell>Ref</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Branch</TableCell>
                                <TableCell>Cust Order Ref</TableCell>
                                <TableCell>Order Date</TableCell>
                                <TableCell>Required By</TableCell>
                                <TableCell>Delivery To</TableCell>
                                <TableCell>Order Total</TableCell>
                                <TableCell>Currency</TableCell>
                                <TableCell>Tmpl</TableCell>
                                {/* <TableCell align="center">Actions</TableCell> */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((so) => (
                                    <TableRow key={so.id} hover>
                                        <TableCell>{so.order}</TableCell>
                                        <TableCell>{so.ref}</TableCell>
                                        <TableCell>{so.customer}</TableCell>
                                        <TableCell>{so.branch}</TableCell>
                                        <TableCell>{so.custOrderRef}</TableCell>
                                        <TableCell>{so.orderDate}</TableCell>
                                        <TableCell>{so.requiredBy}</TableCell>
                                        <TableCell>{so.deliveryTo}</TableCell>
                                        <TableCell>{so.orderTotal}</TableCell>
                                        <TableCell>{so.currency}</TableCell>
                                        <TableCell>{so.tmpl}</TableCell>
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
