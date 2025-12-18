import React from "react";
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function SupplierCreditNoteSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { location: loc, reference, date } = state || {};

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Supplier Credit Note" },
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
          <PageTitle title="Supplier Credit Note" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={() => navigate("/purchase/transactions")}
        >
          Close
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 2 }}>
          Supplier credit note has been processed.
        </Typography>

        <Stack spacing={3} direction="column" alignItems="center">
          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/purchase/transactions/supplier-credit-notes/view-supplier-credit-note", { state })}
          >
            View this Credit Note
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => {
              // Navigate to GL postings view - pass reference so GL view can filter
              navigate("", { state: { reference } });
            }}
          >
           View the GL Journal Entries for this Invoice
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/purchase/transactions/supplier-credit-notes")}
          >
           Enter Another Credit Note
          </Button>
          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/", { state })}
          >
           Add an Attachment
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
