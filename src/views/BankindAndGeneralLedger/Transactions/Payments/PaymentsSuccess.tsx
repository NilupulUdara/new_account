import React from "react";
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function PaymentsSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { reference, date, payTo, from, toTheOrderOf } = state || {};

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Payments" },
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
          <PageTitle title="Payment" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={() => navigate("/bankingandgeneralledger/transactions")}
        >
          Close
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 2 }}>
          Your payment has been processed successfully.
        </Typography>

        <Stack spacing={1} direction="column">
          <Button
            variant="outlined"
            onClick={() => {
              // Navigate to GL postings view - pass reference so GL view can filter
              navigate("/bankingandgeneralledger/transactions/gl-postings", { state: { reference } });
            }}
          >
            1. View the GL Postings for this payment
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/bankingandgeneralledger/transactions/bankingandgeneralledger-quotation-entry")}
          >
            2. Enter another payment
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/bankingandgeneralledger/transactions/bankingandgeneralledger-order-entry")}
          >
            3. Enter a deposit
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/bankingandgeneralledger/transactions/payments/add-attachment", { state })}
          >
            4. Add an attachment
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
