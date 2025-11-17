import React from "react";
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function CustomerDeliverySuccess() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { location: loc, reference, date } = state || {};

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Deliver Items for a Sales Order" },
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
                    <PageTitle title="Deliver Items for a Sales Order" />
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
                    Delivery # has been entered.
                </Typography>

                <Stack spacing={3} direction="column" alignItems="center">
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/direct-delivery/view-direct-delivery", { state })}
                    >
                        View This Delivery
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => {
                            // Navigate to GL postings view - pass reference so GL view can filter
                            navigate("", { state: { reference } });
                        }}
                    >
                        Print Delivery Note
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/")}
                    >
                        Email Delivery Note
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/customer-delivery", { state })}
                    >
                        Print as Packing Slip
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/work-order-entry", { state })}
                    >
                        Email as Packing Slip
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/gl-journal-entries", { state })}
                    >
                        View the GL Journal Entries for this Dispatch
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/direct-delivery/customer-invoice", { state })}
                    >
                        Invoice This Delivery
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/customer-delivery", { state })}
                    >
                        Select Another Order For Dispatch
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
