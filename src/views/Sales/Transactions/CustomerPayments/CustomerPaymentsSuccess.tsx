import React from "react";
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function CustomerPaymentsSuccess() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { location: loc, reference, date } = state || {};

    const breadcrumbItems = [
        { title: "Home", href: "/home" },
        { title: "Customer Payment Entry" },
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
                    <PageTitle title="Customer Payment Entry" />
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
                <Typography sx={{ mb: 2, textAlign: 'center' }}>
                   The customer payment has been successfully entered.
                </Typography>

                <Stack spacing={3} direction="column" alignItems="center">
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/customer-payments/view-customer-payment", { state })}
                    >
                      View this Customer Payment
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => {
                            // Navigate to GL postings view - pass reference so GL view can filter
                            navigate("", { state: { reference } });
                        }}
                    >
                        Print This Receipt
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/")}
                    >
                        Email This Receipt
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/", { state })}
                    >
                        View the GL Journal Entries for this Customer Payment
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/sales/transactions/customer-payments", { state })}
                    >
                        Enter Another Customer Payment
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/bankingandgeneralledger/transactions/bankingandgeneralledger-order-entry", { state })}
                    >
                        Enter Other Deposit
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/purchase/transactions/payment-to-suppliers", { state })}
                    >
                        Enter Payment to Supplier
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/bankingandgeneralledger/transactions/bankingandgeneralledger-quotation-entry", { state })}
                    >
                        Enter Other Payment
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ width: '300px' }}
                        onClick={() => navigate("/bankingandgeneralledger/transactions/bank-account-transfers", { state })}
                    >
                        Bank Account Transfer
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
