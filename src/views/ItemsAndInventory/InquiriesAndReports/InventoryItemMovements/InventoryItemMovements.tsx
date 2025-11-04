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
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import DatePickerComponent from "../../../../components/DatePickerComponent";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface ItemTransactionProps {
  itemId?: string | number;
}

// Mock API
const getItemTransactions = async () => [
    {
        id: 1,
        type: "Receipt",
        number: "TXN001",
        reference: "REF001",
        location: "Colombo",
        date: "2025-09-01",
        detail: "Received items from supplier",
        quantityIn: 100,
        quantityOut: 0,
        quantityOnHand: 500,
    },
    {
        id: 2,
        type: "Issue",
        number: "TXN002",
        reference: "REF002",
        location: "Kandy",
        date: "2025-09-05",
        detail: "Issued items to production",
        quantityIn: 0,
        quantityOut: 50,
        quantityOnHand: 450,
    },
];

export default function InventoryItemMovements({ itemId }: ItemTransactionProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        location: "",
        fromDate: null as Date | null,
        toDate: null as Date | null,
    });

    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const navigate = useNavigate();

    // Fetch data
    useEffect(() => {
        getItemTransactions().then((data) => setTransactions(data));
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleDateChange = (name: string, date: Date | null) => {
        setFilters({ ...filters, [name]: date });
    };

    // Filtered data
    const filteredData = useMemo(() => {
        return transactions.filter((txn) => {
            const matchesLocation =
                !filters.location ||
                txn.location.toLowerCase().includes(filters.location.toLowerCase());

            const normalize = (d: Date) =>
                new Date(d.getFullYear(), d.getMonth(), d.getDate());

            const matchesFromDate =
                !filters.fromDate || normalize(new Date(txn.date)) >= normalize(filters.fromDate);

            const matchesToDate =
                !filters.toDate || normalize(new Date(txn.date)) <= normalize(filters.toDate);

            return matchesLocation && matchesFromDate && matchesToDate;
        });
    }, [transactions, filters]);

    const paginatedData = useMemo(() => {
        if (rowsPerPage === -1) return filteredData;
        return filteredData.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [filteredData, page, rowsPerPage]);

    const handleChangePage = (_event: any, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Item Transactions" },
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
                    <PageTitle title="Item Transactions" />
                    <Breadcrumb breadcrumbs={breadcrumbItems} />
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/itemsandinventory/maintenance/items")}
                    >
                        Back
                    </Button>
                </Stack>

            </Box>

            {/* Search & Filter */}
            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                sx={{ px: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}
            >
                <TextField
                    label="Location"
                    name="location"
                    size="small"
                    value={filters.location}
                    onChange={handleFilterChange}
                />
                <DatePickerComponent
                    label="From Date"
                    value={filters.fromDate}
                    onChange={(date) => handleDateChange("fromDate", date)}
                />
                <DatePickerComponent
                    label="To Date"
                    value={filters.toDate}
                    onChange={(date) => handleDateChange("toDate", date)}
                />
            </Stack>

            <Stack sx={{ alignItems: "center" }}>
                <TableContainer
                    component={Paper}
                    elevation={2}
                    sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
                >
                    <Table aria-label="item transactions table">
                        <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>#</TableCell>
                                <TableCell>Reference</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Detail</TableCell>
                                <TableCell>Quantity In</TableCell>
                                <TableCell>Quantity Out</TableCell>
                                <TableCell>Quantity on Hand</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((txn) => (
                                    <TableRow key={txn.id} hover>
                                        <TableCell>{txn.type}</TableCell>
                                        <TableCell>{txn.number}</TableCell>
                                        <TableCell>{txn.reference}</TableCell>
                                        <TableCell>{txn.location}</TableCell>
                                        <TableCell>{txn.date}</TableCell>
                                        <TableCell>{txn.detail}</TableCell>
                                        <TableCell>{txn.quantityIn}</TableCell>
                                        <TableCell>{txn.quantityOut}</TableCell>
                                        <TableCell>{txn.quantityOnHand}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography variant="body2">No Records Found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                                    colSpan={9}
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
