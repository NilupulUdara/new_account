import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { useQuery } from "@tanstack/react-query";

// Mock API function for Foreign Item Codes
const getForeignItemCodes = async () => [
    { id: 1, code: "123456789012", quantity: 100, units: "pcs", description: "Item 1", category: "Electronics" },
    { id: 2, code: "987654321098", quantity: 50, units: "pcs", description: "Item 2", category: "Toys" },
    { id: 3, code: "555555555555", quantity: 200, units: "boxes", description: "Item 3", category: "Stationery" },
];

function ForeignItemCodesTable() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const navigate = useNavigate();

    //   const [data] = useState(getForeignItemCodes()); // Replace with useQuery if API exists
    const { data: foreignItemData = [] } = useQuery({
        queryKey: ["foreignItemCodes"],
        queryFn: getForeignItemCodes,
    });

    // Filter with search
    const filteredData = useMemo(() => {
        if (!foreignItemData) return [];
        if (!searchQuery.trim()) return foreignItemData;

        const lowerQuery = searchQuery.toLowerCase();
        return foreignItemData.filter(
            (item) =>
                item.code.includes(lowerQuery) ||
                item.description.toLowerCase().includes(lowerQuery) ||
                item.category.toLowerCase().includes(lowerQuery)
        );
    }, [foreignItemData, searchQuery]);

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
                }}
            >
                <Box>
                    <PageTitle title="Foreign Item Codes" />
                    <Breadcrumb breadcrumbs={breadcrumbItems} />
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/itemsandinventory/maintenance/add-foreign-item-codes")}
                    >
                        Add Item
                    </Button>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/itemsandinventory/maintenance/")}>
                        Back
                    </Button>
                </Stack>
            </Box>

            {/* Search */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2, mb: 2 }}>
                <TextField
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    size="small"
                />
            </Box>

            {/* Table */}
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
                                    <TableRow key={item.id} hover>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{item.code}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.units}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => navigate(
                                                        "/itemsandinventory/maintenance/update-foreign-item-codes"
                                                            // `/inventory/update-item/${item.id}`
                                                    )}
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
                                    <TableCell colSpan={7} align="center">
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
        </Stack>
    );
}

export default ForeignItemCodesTable;
