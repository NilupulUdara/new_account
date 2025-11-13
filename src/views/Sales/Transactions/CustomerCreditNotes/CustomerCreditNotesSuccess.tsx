import React from "react";
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function CustomerCreditNotesSuccess() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { location: loc, reference, date } = state || {};

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Customer Credit Note" },
    ];

    return (
        <Stack spacing={2}>
            <Box
                sx={{
                    padding: 2,
                    boxShadow: 2,
                    borderRadius: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <Box>
                    <PageTitle title="Customer Credit Note" />
                    <Breadcrumb breadcrumbs={breadcrumbItems} />
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={() => navigate("/sales/transactions")}
                >
                    Close
                </Button>
            </Box>

            <Paper sx={{ p: 2 }}>
                <Typography sx={{ mb: 2 }}>
                    Credit Note # has been processed
                </Typography>

                <Stack spacing={3} direction="column" alignItems="center">
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/customer-credit-notes/view-customer-credit-note", { state })}
                    >
                      View this credit note
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => {
                            // Navigate to GL postings view - pass reference so GL view can filter
                            navigate("", { state: { reference } });
                        }}
                    >
                        Print This Credit Invoice
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/")}
                    >
                        Email This Credit Invoice
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/", { state })}
                    >
                        View the GL Journal Entries for this Credit Note
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/customer-credit-notes", { state })}
                    >
                        Enter Another Customer Credit Note
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/", { state })}
                    >
                        Add an Attachment
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}
