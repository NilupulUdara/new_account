import React from "react";
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function JournalEntrySuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { reference, date, documentDate, eventDate, currency, lines } = state || {};

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Journal Entry" },
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
          <PageTitle title="Journal Entry" />
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
          Your journal entry has been processed successfully.
        </Typography>

        <Stack spacing={3} direction="column" alignItems="center">
          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/bankingandgeneralledger/transactions/journal-entry/view", { state })}
          >
            1. View this journal entry
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/bankingandgeneralledger/transactions/journal-entry")}
          >
            2. Enter new journal entry
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/bankingandgeneralledger/transactions/journal-entry/add-attachment", { state })}
          >
            3. Add an attachment
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
