import React from "react";
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
  Paper,
  Grid,
  Typography,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";


export default function ViewCustomerAllocations() {
  const navigate = useNavigate();

  // Placeholder empty rows
  const rows: any[] = [];

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <PageTitle title="View Customer Allocations" />
          <Breadcrumb
            breadcrumbs={[
              { title: "Home", href: "/home" },
              { title: "Customer Allocations" },
              { title: "View" },
            ]}
          />
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Transaction Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Ref</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Other Allocations</TableCell>
              <TableCell>Left to Allocate</TableCell>
              <TableCell>This Allocation</TableCell>
              <TableCell>All</TableCell>
              <TableCell>None</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Typography>No Records Found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.number}</TableCell>
                  <TableCell>{r.ref}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.due_date}</TableCell>
                  <TableCell>{r.amount}</TableCell>
                  <TableCell>{r.other_alloc}</TableCell>
                  <TableCell>{r.left}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={r.this_allocation}
                      onChange={(e) =>
                        console.log("Allocation change", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Button size="small" onClick={() => console.log("All clicked")}>
                      All
                    </Button>
                  </TableCell>

                  <TableCell>
                    <Button size="small" onClick={() => console.log("None clicked")}>
                      None
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          {/* FOOTER TOTALS */}
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} align="right">
                <b>Total Allocation:</b>
              </TableCell>
              <TableCell colSpan={2}>
                <b>0.00</b>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={9} align="right">
                <b>Left to Allocate:</b>
              </TableCell>
              <TableCell colSpan={2}>
                <b>0.00</b>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* BOTTOM ACTION BUTTONS */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="contained" color="primary">
          Refresh
        </Button>

        <Button variant="contained" color="success">
          Process
        </Button>

        <Button variant="outlined" onClick={() => navigate("/customer-allocations")}>
          Back to Allocation
        </Button>
      </Stack>
    </Stack>
  );
}
