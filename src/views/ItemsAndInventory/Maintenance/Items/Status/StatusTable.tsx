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

interface Status {
    id: number;
    location: string;
    quantityOnHand: number;
    reorderLevel: number;
    demand: number;
    available: number;
    onOrder: number;
}

function StatusTable() {
    const [statusData, setStatusData] = useState<Status[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

    // Dummy data
    useEffect(() => {
        const dummyData: Status[] = [
            { id: 1, location: "Warehouse A", quantityOnHand: 100, reorderLevel: 50, demand: 30, available: 70, onOrder: 20 },
            { id: 2, location: "Warehouse B", quantityOnHand: 200, reorderLevel: 80, demand: 60, available: 140, onOrder: 50 },
            { id: 3, location: "Warehouse C", quantityOnHand: 50, reorderLevel: 30, demand: 25, available: 25, onOrder: 10 },
        ];
        setStatusData(dummyData);
    }, []);

    const filteredData = useMemo(() => {
        return statusData.filter(item =>
            item.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [statusData, searchQuery]);

    const paginatedData = useMemo(() => {
        if (rowsPerPage === -1) return filteredData;
        return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredData, page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            setStatusData(prev => prev.filter(item => item.id !== id));
        }
    };

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Status" },
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
                    <PageTitle title="Status" />
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

            {/* Search */}
            <Stack
                direction="row"
                sx={{ px: 2, mb: 2, width: "100%", justifyContent: "flex-end" }}
            >
                <Box sx={{ width: isMobile ? "100%" : "300px" }}>
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        placeholder="Search by location..."
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
                    <Table aria-label="status table">
                        <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                            <TableRow>
                                <TableCell>No</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Quantity on Hand</TableCell>
                                <TableCell>Reorder Level</TableCell>
                                <TableCell>Demand</TableCell>
                                <TableCell>Available</TableCell>
                                <TableCell>On Order</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>{item.quantityOnHand}</TableCell>
                                        <TableCell>{item.reorderLevel}</TableCell>
                                        <TableCell>{item.demand}</TableCell>
                                        <TableCell>{item.available}</TableCell>
                                        <TableCell>{item.onOrder}</TableCell>
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

export default StatusTable;
