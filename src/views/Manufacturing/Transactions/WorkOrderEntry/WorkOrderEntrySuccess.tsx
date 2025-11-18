import React from "react";
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function WorkOrderEntrySuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { reference } = state || {};

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Work Order Entry" },
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
          <PageTitle title="Work Order Entry" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={() => navigate("/manufacturing/transactions")}
        >
          Close
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 2 }}>
          The Work Order has been added.
        </Typography>

        <Stack spacing={3} direction="column" alignItems="center">
          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/manufacturing/transactions/work-order-entry/view", { state })}
          >
            View This Work Order
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => {
              // Navigate to print view - pass reference so print view can filter
              navigate("", { state: { reference } });
            }}
          >
            Print This Work Order
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/", { state })}
          >
            Email This Work Order
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => {
              
              navigate("/manufacturing/transactions/work-order-entry/view-gl-journal-entries", { state: { reference } });
            }}
          >
            View the GL Journal Entries for This Work Order
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/", { state })}
          >
            Print the GL Journal Entries for This Work Order
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/", { state })}
          >
            Add an Attachment
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/manufacturing/transactions/work-order-entry", { state })}
          >
            Enter a New Work Order
          </Button>

          <Button
            variant="outlined"
            sx={{ width: '500px' }}
            onClick={() => navigate("/manufacturing/inquiriesandreports/work-order-inquiry")}
          >
            Select an Existing Work Order
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
