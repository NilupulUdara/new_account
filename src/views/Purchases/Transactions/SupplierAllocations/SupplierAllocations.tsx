import React, { useState, useMemo } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getSuppTrans } from "../../../../api/SuppTrans/SuppTransApi";
import { getTransTypes } from "../../../../api/Reflines/TransTypesApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function SupplierAllocations() {
  const navigate = useNavigate();

  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: getSuppliers });
  const { data: suppTrans = [] } = useQuery({ queryKey: ["suppTrans"], queryFn: getSuppTrans });
  const { data: transTypes = [] } = useQuery({ queryKey: ["transTypes"], queryFn: getTransTypes });
  const [selectedSupplier, setSelectedSupplier] = useState("ALL_SUPPLIERS");
  const [showSettled, setShowSettled] = useState(false);

  // Build allocation rows from supp_trans
  const rows: any[] = useMemo(() => {
    const supMap: Map<string, any> = new Map(
      (suppliers || []).map((s: any) => [
        String(s.supplier_id ?? s.id ?? s.debtor_no ?? s.supp_id),
        s,
      ])
    );

    const transTypeMap: Map<string, any> = new Map(
      (transTypes || []).map((t: any) => [
        String(t.trans_type),
        t,
      ])
    );

    const data = Array.isArray(suppTrans) ? suppTrans : [];

    const matchesSupplier = (t: any) => {
      const supId = String(t.supplier_id ?? t.supplier ?? t.supp_id ?? "");
      return (
        selectedSupplier === "ALL_SUPPLIERS" || supId === String(selectedSupplier)
      );
    };

    const toRow = (t: any, useSuppReference: boolean) => {
      const supId = String(t.supplier_id ?? t.supplier ?? t.supp_id ?? "");
      const sup = supMap.get(supId) as any;
      const transTypeId = String(t.trans_type ?? t.type ?? "");
      const transType = transTypeMap.get(transTypeId) as any;
      return {
        id: `${t.trans_type ?? t.type ?? ""}-${t.trans_no ?? t.transno ?? t.id ?? ""}`,
        type: transType?.description ?? transType?.name ?? transTypeId,
        transType: t.trans_type ?? t.type ?? "",
        transNo: t.trans_no ?? t.transno ?? t.id ?? "",
        transData: t,
        number: t.trans_no ?? t.transno ?? t.id ?? "",
        reference: useSuppReference
          ? (t.supp_reference ?? t.suppreference ?? t.reference ?? "")
          : (t.reference ?? ""),
        date: t.trans_date ?? t.tran_date ?? t.date ?? "",
        supplier:
          (sup?.supp_name ?? sup?.supplier_name ?? sup?.name ?? "-") as string,
        currency: (sup?.curr_code ?? "-") as string,
        total: Number(t.alloc ?? 0),
        left: 0,
      };
    };

    // type 21 first, then 22
    const type21 = data
      .filter((t: any) => Number(t.trans_type ?? t.type ?? 0) === 21 && matchesSupplier(t))
      .map((t: any) => toRow(t, true));
    const type22 = data
      .filter((t: any) => Number(t.trans_type ?? t.type ?? 0) === 22 && matchesSupplier(t))
      .map((t: any) => toRow(t, false));

    // Optionally handle settled filter in the future; currently left is default 0
    return [...type21, ...type22];
  }, [suppTrans, suppliers, transTypes, selectedSupplier]);

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <PageTitle title="Supplier Allocations" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Supplier Allocations" }]} />
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel>Select Supplier</InputLabel>
            <Select value={selectedSupplier} label="Select Supplier" onChange={(e) => setSelectedSupplier(String(e.target.value))}>
              <MenuItem value="ALL_SUPPLIERS">All Suppliers</MenuItem>
              {(suppliers || []).map((s: any) => (
                <MenuItem key={s.supplier_id ?? s.id ?? s.debtor_no} value={String(s.supplier_id ?? s.id ?? s.debtor_no)}>{s.name ?? s.supplier_name ?? s.debtor_name ?? s.supp_name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Checkbox checked={showSettled} onChange={(e) => setShowSettled(e.target.checked)} />}
            label="Show Settled Items:"
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </Stack>
      </Box>

      {/* Customer select moved to header; retained here intentionally removed to avoid duplicate */}

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Transaction Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Left to Allocate</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2">No Records Found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, idx) => (
                <TableRow key={r.id ?? idx} hover>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>
                    {Number(r.transType) === 21 ? (
                      <Button
                        variant="text"
                        size="small"
                        sx={{ textDecoration: "underline", textTransform: "none" }}
                        onClick={() =>
                          navigate("/purchase/transactions/supplier-credit-notes/view-supplier-credit-note", {
                            state: {
                              transNo: r.transNo,
                              transType: r.transType,
                              supplier: r.transData?.supplier_id ?? r.transData?.supplier,
                              reference: r.transData?.reference ?? "",
                              supplierRef: r.transData?.supp_reference ?? "",
                              date: r.transData?.trans_date ?? "",
                              dueDate: r.transData?.due_date ?? "",
                              fromAllocations: true,
                            },
                          })
                        }
                      >
                        {r.number}
                      </Button>
                    ) : Number(r.transType) === 22 ? (
                      <Button
                        variant="text"
                        size="small"
                        sx={{ textDecoration: "underline", textTransform: "none" }}
                        onClick={() =>
                          navigate("/purchase/transactions/payment-to-suppliers/view-supplier-payment", {
                            state: {
                              transNo: r.transNo,
                              transType: r.transType,
                              supplier: r.transData?.supplier_id ?? r.transData?.supplier,
                              reference: r.transData?.reference ?? "",
                              date: r.transData?.trans_date ?? "",
                              fromAllocations: true,
                            },
                          })
                        }
                      >
                        {r.number}
                      </Button>
                    ) : (
                      r.number
                    )}
                  </TableCell>
                  <TableCell>{r.reference}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.supplier}</TableCell>
                  <TableCell>{r.currency}</TableCell>
                  <TableCell>{r.total}</TableCell>
                  <TableCell>{r.left}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => navigate("/purchase/transactions/allocate-supplier-payments-credit-notes/view-supplier-allocations", { state: { id: r.id } })}
                    >
                      Allocate
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
