import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import theme from "../../../../theme";
import { getWorkCentres } from "../../../../api/WorkCentre/WorkCentreApi";
import { useQueryClient } from "@tanstack/react-query";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItems } from "../../../../api/Item/ItemApi";
import useCurrentUser from "../../../../hooks/useCurrentUser";
import { createWoManufacture, getWoManufactures } from "../../../../api/WorkOrders/WOManufactureApi";
import { getWoRequirementsByWorkOrder, updateWoRequirement } from "../../../../api/WorkOrders/WORequirementsApi";
import { createStockMove } from "../../../../api/StockMoves/StockMovesApi";
import auditTrailApi from "../../../../api/AuditTrail/AuditTrailApi";
import { updateWorkOrder, getWorkOrderById } from "../../../../api/WorkOrders/WorkOrderApi";
import { getCompanies } from "../../../../api/CompanySetup/CompanySetupApi";

export default function ProduceWorkOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const idFromState = (location.state as any)?.id ?? null;

  const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });
  const { data: workCentres = [] } = useQuery({ queryKey: ["workCentres"], queryFn: getWorkCentres });

  const [loadingError, setLoadingError] = useState("");
  const [woRecord, setWoRecord] = useState<any | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [prodDate, setProdDate] = useState(today);
  const [prodReference, setProdReference] = useState("YYYY");
  const [prodType, setProdType] = useState("produce");
  const [prodQuantity, setProdQuantity] = useState("0");
  const [prodMemo, setProdMemo] = useState("");
  const [formError, setFormError] = useState("");

  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  // compute next sequential manufacture reference (NNN/YYYY) and prefill Reference when appropriate
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const currentYear = new Date(prodDate).getFullYear();
        const yearStr = String(currentYear);
        const allMan = await getWoManufactures();
        const refsForYear = Array.isArray(allMan)
          ? allMan
              .map((m: any) => String(m.reference ?? "").trim())
              .filter((r: string) => new RegExp(`^(\\d{3})\\/${yearStr}$`).test(r))
          : [];
        const nums = refsForYear.map((r: string) => Number(r.split("/")[0]) || 0);
        const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
        const nextNum = maxNum + 1;
        const computedRef = `${String(nextNum).padStart(3, "0")}/${yearStr}`;
        if (mounted) {
          if (!prodReference || prodReference === "YYYY") {
            setProdReference(computedRef);
          }
        }
      } catch (err) {
        console.warn("Failed to prefill manufacture reference:", err);
      }
    })();
    return () => { mounted = false; };
  }, [prodDate, prodReference]);

  useEffect(() => {
    (async () => {
      if (!idFromState) {
        setLoadingError("No work order id provided");
        return;
      }
      try {
        const wo = await getWorkOrderById(idFromState);
        if (!wo) {
          setLoadingError("Work order not found");
          return;
        }
        setWoRecord(wo);
        try {
          const defaultQty = Number(wo.units_reqd ?? wo.quantity ?? wo.units_req ?? 0) || 0;
          setProdQuantity(String(defaultQty));
        } catch (e) {}
      } catch (err) {
        console.warn("Failed to load work order:", err);
        setLoadingError("Failed to load work order");
      }
    })();
  }, [idFromState]);

  const getTypeLabel = (t: any) => {
    const n = Number(t);
    if (n === 0) return "Assemble";
    if (n === 1) return "Unassemble";
    if (n === 2) return "Advanced Manufacture";
    return String(t ?? "");
  };

  const itemLabel = (stockId: any) => {
    const rec = (woRecord || {});
    return rec ? (rec.item_name ?? rec.name ?? String(stockId)) : String(stockId ?? "");
  };

  const locLabel = (locCode: any) => {
    const rec = (locations || []).find((l: any) => String(l.loc_code ?? l.loccode ?? l.code ?? "") === String(locCode));
    return rec ? (rec.location_name ?? String(locCode)) : String(locCode ?? "");
  };

  const processProduction = async (forceClose = false) => {
    setFormError("");
    if (!prodDate) { setFormError("Select a date"); return; }
    if (!prodReference || String(prodReference).trim() === "") { setFormError("Enter a reference"); return; }
    if (!prodType || String(prodType).trim() === "") { setFormError("Select a type"); return; }
    const qty = Number(String(prodQuantity).replace(/,/g, "")) || 0;
    if (isNaN(qty) || qty <= 0) { setFormError("Enter a valid quantity"); return; }
    if (!idFromState) { setFormError("Work order id missing"); return; }

    try {
      // 1) create wo_manufacture with sequential reference NNN/YYYY
      const currentYear = new Date(prodDate).getFullYear();
      let computedRef = prodReference;
      try {
        const allMan = await getWoManufactures();
        const yearStr = String(currentYear);
        const refsForYear = Array.isArray(allMan)
          ? allMan
              .map((m: any) => String(m.reference ?? "").trim())
              .filter((r: string) => new RegExp(`^(\\d{3})\\/${yearStr}$`).test(r))
          : [];
        const nums = refsForYear.map((r: string) => Number(r.split("/")[0]) || 0);
        const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
        const nextNum = maxNum + 1;
        computedRef = `${String(nextNum).padStart(3, "0")}/${yearStr}`;
      } catch (refErr) {
        console.warn("Failed to compute next wo_manufacture reference:", refErr);
        computedRef = prodReference || `${"001"}/${new Date().getFullYear()}`;
      }

      const woManPayload = {
        reference: computedRef,
        workorder_id: Number(idFromState),
        quantity: qty,
        date: prodDate,
      } as any;
      const manRes = await createWoManufacture(woManPayload);
      const createdWoManId = manRes?.id ?? manRes?.workmanufacture_id ?? manRes?.wo_manufacture_id ?? manRes?.trans_no ?? manRes?.insertId ?? null;

      // 2) update wo_requirements: increment units_issued by produced quantity for all requirements of this WO
      let requirements: any[] = [];
      try {
        requirements = await getWoRequirementsByWorkOrder(Number(idFromState));
      } catch (reqErr) {
        console.warn("Failed to load WO requirements:", reqErr);
        requirements = [];
      }

      for (const req of requirements) {
        try {
          const updatedReq = {
            workorder_id: req.workorder_id,
            stock_id: String(req.stock_id ?? req.stockid ?? req.stock ?? ""),
            work_centre: req.work_centre ?? req.work_centre_id ?? 0,
            units_req: Number(req.units_req ?? req.units_reqd ?? 0),
            unit_cost: Number(req.unit_cost ?? req.unitCost ?? 0) || 0,
            loc_code: req.loc_code ?? req.loccode ?? "",
            units_issued: Number(req.units_issued ?? 0) + qty,
          } as any;
          if (req.id) await updateWoRequirement(req.id, updatedReq);
        } catch (uReqErr) {
          console.warn("Failed to update WO requirement issued:", uReqErr, req);
        }
      }

      // 3) create negative stock_moves for every requirement's stock (bom items) qty = -quantity
      try {
        for (const req of requirements) {
          try {
            const compStockId = req.stock_id ?? req.stockid ?? req.stock;
            const unitCost = Number(req.unit_cost ?? req.unitCost ?? 0) || 0;
            if (createdWoManId) {
              const stockMovePayload = {
                trans_no: createdWoManId,
                stock_id: String(compStockId),
                type: 29,
                loc_code: String(req.loc_code ?? req.loccode ?? ""),
                tran_date: prodDate,
                price: 0,
                reference: "",
                qty: -Math.abs(Number(qty) || 0),
                standard_cost: unitCost,
              } as any;
              await createStockMove(stockMovePayload);
            }
          } catch (smErr) {
            console.warn("Failed to create negative stock_move for component:", smErr, req);
          }
        }
      } catch (compErr) {
        console.warn("Failed processing component issues:", compErr);
      }

      // 4) create audit trail (production)
      try {
        const companies = await getCompanies();
        const company = Array.isArray(companies) && companies.length > 0 ? companies[0] : null;
        const fiscalYearIdForAudit = company?.fiscal_year_id ?? company?.fiscal_year ?? null;
        if (createdWoManId) {
          await auditTrailApi.create({
            type: 29,
            trans_no: createdWoManId,
            user: user?.id ?? (Number(localStorage.getItem("userId")) || null),
            stamp: new Date().toISOString(),
            description: "Production",
            fiscal_year: fiscalYearIdForAudit ?? null,
            gl_date: prodDate,
            gl_seq: 0,
          });
        }
      } catch (atProdErr) {
        console.warn("Failed to create audit trail for production:", atProdErr);
      }

      // 5) update workorder units_issued and possibly close
      try {
        // reload workorder to get current units_issued and units_reqd
        const wo = await getWorkOrderById(idFromState);
        const currentIssued = Number(wo?.units_issued ?? 0);
        const unitsReqd = Number(wo?.units_reqd ?? wo?.quantity ?? wo?.units_req ?? 0);
        const newIssued = currentIssued + qty;
        const closeFlag = forceClose ? true : (newIssued >= unitsReqd);

        const updatePayload = {
          wo_ref: wo?.wo_ref ?? wo?.reference ?? "",
          loc_code: wo?.loc_code ?? wo?.location ?? wo?.loc ?? "",
          units_reqd: unitsReqd,
          stock_id: wo?.stock_id ?? wo?.stock ?? wo?.item_id ?? "",
          date: wo?.date ?? wo?.tran_date ?? prodDate,
          type: wo?.type ?? 0,
          required_by: wo?.required_by ?? wo?.date_required_by ?? wo?.requiredBy ?? prodDate,
          released_date: wo?.released_date ?? null,
          units_issued: newIssued,
          closed: closeFlag,
          released: wo?.released ?? false,
          additional_costs: wo?.additional_costs ?? 0,
        } as any;
        await updateWorkOrder(idFromState, updatePayload);
      } catch (uwErr) {
        console.warn("Failed to update workorder issued/closed:", uwErr);
      }

      // 6) if produced qty >= units required (or forceClose), create positive stock_move for finished item
      try {
        const woAfter = await getWorkOrderById(idFromState);
        const unitsReqdAfter = Number(woAfter?.units_reqd ?? woAfter?.quantity ?? woAfter?.units_req ?? 0);
        if (qty >= unitsReqdAfter || forceClose) {
          const mainItemId = String(woAfter?.stock_id ?? woAfter?.stock ?? woAfter?.item_id ?? "");
          let mainMaterialCost = 0;
          try {
            const allItems = await getItems();
            const mainItem = Array.isArray(allItems) ? (allItems as any[]).find((it: any) => String(it.stock_id ?? it.id) === mainItemId) : null;
            mainMaterialCost = Number(mainItem?.material_cost ?? mainItem?.materialCost ?? mainItem?.standard_cost ?? mainItem?.unit_cost ?? 0) || 0;
          } catch (miErr) {
            console.warn("Failed to load items for main material cost:", miErr);
          }

          try {
            const mainStockMovePayload = {
              trans_no: Number(idFromState),
              stock_id: mainItemId,
              type: 26,
              loc_code: String(woAfter?.loc_code ?? woAfter?.location ?? woAfter?.loc ?? ""),
              tran_date: prodDate,
              price: 0,
              reference: prodReference || "",
              qty: Number(qty) || 0,
              standard_cost: mainMaterialCost,
            } as any;
            await createStockMove(mainStockMovePayload);
          } catch (mSmErr) {
            console.warn("Failed to create positive stock_move for finished item:", mSmErr);
          }
        }
      } catch (mainSmChkErr) {
        console.warn("Failed checking workorder for main stock move:", mainSmChkErr);
      }

      // navigate to success
      navigate("/manufacturing/transactions/work-order-entry/success", { state: { reference: prodReference, id: idFromState, successMode: 'manufacture' } });
    } catch (err) {
      console.error("Failed production process:", err);
      setFormError("Failed to process production. See console for details.");
    }
  };

  const handleProcess = () => processProduction(false);
  const handleProcessAndClose = () => processProduction(true);

  const breadcrumbItems = [
    { title: "Transactions", href: "/manufacturing/transactions" },
    { title: "Produce Work Order" },
  ];

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Produce or Unassemble Finished Items From Work Order" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {loadingError && <Alert severity="error">{loadingError}</Alert>}

        <Grid container>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Manufactured Item</TableCell>
                    <TableCell>Into Location</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Required by</TableCell>
                    <TableCell>Quantity required</TableCell>
                    <TableCell>Released date</TableCell>
                    <TableCell>Manufactured</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {woRecord ? (
                    <TableRow hover>
                      <TableCell>{woRecord.id ?? woRecord.wo_id ?? ""}</TableCell>
                      <TableCell>{woRecord.wo_ref ?? woRecord.reference ?? ""}</TableCell>
                      <TableCell>{getTypeLabel(woRecord.type)}</TableCell>
                      <TableCell>{itemLabel(woRecord.stock_id ?? woRecord.stock ?? woRecord.item_id)}</TableCell>
                      <TableCell>{locLabel(woRecord.loc_code ?? woRecord.location ?? woRecord.loc)}</TableCell>
                      <TableCell>{woRecord.date ? String(woRecord.date).split("T")[0] : (woRecord.tran_date ?? "")}</TableCell>
                      <TableCell>{woRecord.required_by ?? woRecord.date_required_by ?? woRecord.requiredBy ?? ""}</TableCell>
                      <TableCell>{Number(woRecord.units_reqd ?? woRecord.quantity ?? woRecord.units_req ?? 0)}</TableCell>
                      <TableCell>{woRecord.released_date ? String(woRecord.released_date).split("T")[0] : ""}</TableCell>
                      <TableCell>{Number(woRecord.units_issued ?? woRecord.unitsIssued ?? 0)}</TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10}>No work order selected</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} sx={{ mt: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField label="Date" type="date" fullWidth size="small" value={prodDate} onChange={(e) => setProdDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Reference" value={prodReference} onChange={(e) => setProdReference(e.target.value)} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth size="small" label="Type" value={prodType} onChange={(e) => setProdType(String(e.target.value))}>
                    <MenuItem value="produce">Produce Finished Items</MenuItem>
                    <MenuItem value="return">Return Items to work order</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Quantity" value={prodQuantity} onChange={(e) => setProdQuantity(e.target.value)} />
                </Grid>

                <Grid item xs={12}>
                  <TextField label="Memo" fullWidth multiline rows={3} value={prodMemo} onChange={(e) => setProdMemo(e.target.value)} />
                </Grid>

                {formError && (
                  <Grid item xs={12}>
                    <Alert severity="warning">{formError}</Alert>
                  </Grid>
                )}

                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <Button variant="contained" color="primary" onClick={handleProcess}>Process</Button>
                  <Button variant="contained" color="secondary" onClick={handleProcessAndClose}>Process and Close Order</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}
