import React from "react";
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function DepositSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { reference, date, payTo, from, toTheOrderOf } = state || {};

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Deposits" },
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
          <PageTitle title="Deposit" />
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
          Your deposit has been processed successfully.
        </Typography>

        <Stack spacing={1} direction="column">
          <Button
            variant="outlined"
            onClick={() => {
              // Navigate to GL postings view - pass reference so GL view can filter
              navigate("/bankingandgeneralledger/transactions/gl-postings", { state: { reference } });
            }}
          >
            1. View the GL Postings for this deposit
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/bankingandgeneralledger/transactions/bankingandgeneralledger-order-entry")}
          >
            2. Enter another deposit
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/bankingandgeneralledger/transactions/deposit/add-attachment", { state })}
          >
            3. Add an attachment
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
