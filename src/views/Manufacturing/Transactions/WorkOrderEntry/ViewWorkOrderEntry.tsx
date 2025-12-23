import React, { useState, useEffect } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Stack, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { getWorkOrders } from "../../../../api/WorkOrders/WorkOrderApi";

export default function ViewWorkOrderEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { reference, id } = state || {};

  const [workOrder, setWorkOrder] = useState<any | null>(null);
  const [workOrderRequirements, setWorkOrderRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const all = await getWorkOrders();
        if (!Array.isArray(all)) {
          setWorkOrder(null);
          setWorkOrderRequirements([]);
          return;
        }

        let found = null;
        if (id) found = all.find((w: any) => String(w.id) === String(id) || String(w.wo_id ?? w.id) === String(id));
        if (!found && reference) found = all.find((w: any) => String(w.wo_ref ?? w.reference) === String(reference));

        if (found) {
          setWorkOrder(found);
          // try to pick any requirements/components property if present
          const reqs = found.requirements || found.components || found.work_order_requirements || [];
          setWorkOrderRequirements(Array.isArray(reqs) ? reqs : []);
        } else {
          setWorkOrder(null);
          setWorkOrderRequirements([]);
        }
      } catch (err) {
        console.warn("Failed to load work order:", err);
        setWorkOrder(null);
        setWorkOrderRequirements([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reference]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Work Order" },
  ];

  const getTypeLabel = (t: any) => {
    const n = Number(t);
    if (n === 0) return "Assemble";
    if (n === 1) return "Unassemble";
    if (n === 2) return "Advanced Manufacture";
    return String(t ?? "");
  };

  // Dummy work order requirements data
  // workOrderRequirements state is populated from the fetched work order (if available)

  const handlePrint = () => {
    window.print();
  };

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
          <PageTitle title={`View Work Order - ${reference || "N/A"}`} />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* First Table: Work Order Details */}
      <Paper sx={{ p: 2 }}>
        <TableContainer component={Paper} sx={{ p: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Manufactured Item</TableCell>
                <TableCell>Into Location</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>Loading...</TableCell>
                </TableRow>
              ) : !workOrder ? (
                <TableRow>
                  <TableCell colSpan={7}>No work order found</TableCell>
                </TableRow>
              ) : (
                <TableRow key={workOrder.id ?? workOrder.wo_ref}>
                  <TableCell>{workOrder.id ?? "-"}</TableCell>
                  <TableCell>{workOrder.wo_ref ?? workOrder.reference ?? "-"}</TableCell>
                  <TableCell>{getTypeLabel(workOrder.type)}</TableCell>
                  <TableCell>{workOrder.stock_id ?? workOrder.stock_code ?? workOrder.item_name ?? "-"}</TableCell>
                  <TableCell>{workOrder.loc_code ?? workOrder.into_location ?? workOrder.location_name ?? "-"}</TableCell>
                  <TableCell>{workOrder.date ? String(workOrder.date).split("T")[0] : (workOrder.tran_date ?? "-")}</TableCell>
                  <TableCell>{workOrder.units_reqd ?? workOrder.quantity ?? "-"}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Second Table: Work Order Requirements */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Work Order Requirements
        </Typography>
        <TableContainer component={Paper} sx={{ p: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>From Location</TableCell>
                <TableCell>Work Centre</TableCell>
                <TableCell align="right">Unit Quantity</TableCell>
                <TableCell align="right">Total Quantity</TableCell>
                <TableCell align="right">Units Issued</TableCell>
                <TableCell align="right">On Hand</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workOrderRequirements && workOrderRequirements.length > 0 ? (
                workOrderRequirements.map((req: any) => (
                  <TableRow key={req.id ?? JSON.stringify(req)}>
                    <TableCell>{req.component ?? req.stock_id ?? req.item_name ?? "-"}</TableCell>
                    <TableCell>{req.fromLocation ?? req.from_loc ?? req.loc_code ?? "-"}</TableCell>
                    <TableCell>{req.workCentre ?? req.work_centre ?? req.workcentre ?? "-"}</TableCell>
                    <TableCell align="right">{req.unitQuantity ?? req.qty_per_unit ?? req.unit_quantity ?? "-"}</TableCell>
                    <TableCell align="right">{req.totalQuantity ?? req.total_qty ?? "-"}</TableCell>
                    <TableCell align="right">{req.unitsIssued ?? req.issued ?? "-"}</TableCell>
                    <TableCell align="right">{req.onHand ?? req.on_hand ?? "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>No requirements found for this work order</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Print Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, p: 2 }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print
        </Button>
      </Box>
    </Stack>
  );
}
