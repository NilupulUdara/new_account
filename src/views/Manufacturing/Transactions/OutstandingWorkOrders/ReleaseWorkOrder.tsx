import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getComments, createComment } from "../../../../api/Comments/CommentsApi";
import theme from "../../../../theme";
import { getWorkOrderById, updateWorkOrder } from "../../../../api/WorkOrders/WorkOrderApi";
import auditTrailApi from "../../../../api/AuditTrail/AuditTrailApi";
import { getBoms } from "../../../../api/Bom/BomApi";
import { createWoRequirement } from "../../../../api/WorkOrders/WORequirementsApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { getCompanies } from "../../../../api/CompanySetup/CompanySetupApi";
import useCurrentUser from "../../../../hooks/useCurrentUser";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function ReleaseWorkOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const idFromState = (location.state as any)?.id ?? null;

  const queryClient = useQueryClient();
  const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });
  const { user } = useCurrentUser();

  const [loadingError, setLoadingError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [woId, setWoId] = useState("");
  const [reference, setReference] = useState("");
  const [releasedDate, setReleasedDate] = useState(new Date().toISOString().split("T")[0]);
  const [memo, setMemo] = useState("");
  const [memoDisabled, setMemoDisabled] = useState(false);
  const [woRecord, setWoRecord] = useState<any | null>(null);

  const referenceFromState = (location.state as any)?.reference ?? "";

  const { data: comments = [] } = useQuery({ queryKey: ["comments", idFromState], queryFn: getComments, enabled: !!idFromState });
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });

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
        setWoId(String(wo.id ?? wo.wo_id ?? idFromState));
        setWoRecord(wo ?? null);
        // prefer reference passed in navigation state for snappy UX
        setReference(referenceFromState || (wo.wo_ref ?? wo.reference ?? ""));
        setReleasedDate(wo.released_date ? String(wo.released_date).split("T")[0] : new Date().toISOString().split("T")[0]);
        setMemo((prev) => {
          const existing = String(prev ?? "").trim();
          if (existing !== "") return prev as string;
          return wo.memo ?? wo.memo_ ?? wo.notes ?? "";
        });
      } catch (err) {
        console.warn("Failed to load work order:", err);
        setLoadingError("Failed to load work order");
      }
    })();
  }, [idFromState, referenceFromState]);

  // when comments load, check for an existing memo (type=26, id = workorder id)
  useEffect(() => {
    if (!idFromState) return;
    try {
      const existing = (comments || []).find((c: any) => {
        const typeVal = Number(c.type ?? c.type_id ?? c.comment_type ?? 0);
        const targetId = String(c.id ?? c.record_id ?? c.ref_id ?? c.trans_no ?? "");
        return typeVal === 26 && String(idFromState) === targetId;
      });
      if (existing) {
        const existingMemo = (existing.memo_ ?? existing.memo ?? "") as string;
        if (existingMemo && String(existingMemo).trim() !== "") {
          setMemo(existingMemo);
          if (existing.date_) setReleasedDate(String(existing.date_).split("T")[0]);
          setMemoDisabled(true);
        } else {
          // existing comment exists but has no memo; do not overwrite current memo
          setMemoDisabled(false);
        }
      } else {
        setMemoDisabled(false);
      }
    } catch (err) {
      console.warn("Failed to evaluate existing comments:", err);
    }
  }, [comments, idFromState]);

  const handleRelease = async () => {
    setSaveError("");
    if (!idFromState) return;
    setIsSaving(true);
    try {
      // prefer using the work order's own date for audit GL date; default to releasedDate
      let workOrderDate = releasedDate;
      // Update work order record by merging existing fields and setting released values
      try {
        let currentWo = woRecord;
        if (!currentWo) {
          currentWo = await getWorkOrderById(idFromState);
          setWoRecord(currentWo);
        }

        const updatePayload: any = {
          wo_ref: currentWo?.wo_ref ?? currentWo?.reference ?? "",
          loc_code: currentWo?.loc_code ?? currentWo?.location ?? currentWo?.loc ?? "",
          units_reqd: Number(currentWo?.units_reqd ?? currentWo?.quantity ?? 0),
          stock_id: String(currentWo?.stock_id ?? currentWo?.stock ?? currentWo?.item_id ?? ""),
          date: currentWo?.date ?? currentWo?.tran_date ?? new Date().toISOString().split("T")[0],
          type: Number(currentWo?.type ?? 0),
          required_by: currentWo?.required_by ?? currentWo?.date_required_by ?? currentWo?.requiredBy ?? currentWo?.required_date ?? currentWo?.date,
          released_date: releasedDate,
          units_issued: Number(currentWo?.units_issued ?? currentWo?.unitsIssued ?? 0),
          closed: currentWo?.closed ?? false,
          released: true,
          additional_costs: Number(currentWo?.additional_costs ?? currentWo?.additionalCosts ?? 0),
        } as any;

        // capture the work order date for use in audit trail
        workOrderDate = currentWo?.date ?? currentWo?.tran_date ?? workOrderDate;

        await updateWorkOrder(idFromState, updatePayload);
      } catch (uErr) {
        console.warn("Failed to mark work order as released:", uErr);
      }

      // create WO requirements from BOM (if BOM exists for the WO's manufactured item)
      try {
        const currentWo = woRecord ?? (await getWorkOrderById(idFromState));
        const parentCode = String(currentWo?.stock_id ?? currentWo?.stock ?? currentWo?.item_id ?? "");
        const qtyForWo = Number(currentWo?.units_reqd ?? currentWo?.quantity ?? currentWo?.units_req ?? 0);
        if (parentCode) {
          const allBoms = await getBoms();
          const matches = Array.isArray(allBoms) ? allBoms.filter((b: any) => String(b.parent) === parentCode) : [];
          for (const bom of matches) {
            try {
              const componentId = bom.component ?? bom.component_stock_id ?? bom.component_id ?? "";
              const workCentre = Number(bom.work_centre ?? bom.work_centre_id) || 0;
              const unitsPerParent = Number(bom.quantity ?? bom.units_req ?? bom.qty) || 0;
              const locCode = bom.loc_code ?? bom.loccode ?? "";
              const totalUnitsReq = unitsPerParent * (qtyForWo || 0);

              const compItem = (items || []).find((it: any) => String(it.stock_id ?? it.id) === String(componentId));
              const unitCostRaw = compItem?.material_cost ?? compItem?.materialCost ?? compItem?.standard_cost ?? compItem?.unit_cost ?? compItem?.cost ?? 0;
              const unitCost = Number(unitCostRaw) || 0;

              const reqPayload = {
                workorder_id: idFromState,
                stock_id: String(componentId),
                work_centre: workCentre,
                units_req: totalUnitsReq,
                unit_cost: unitCost,
                loc_code: String(locCode),
                units_issued: 0,
              } as any;

              await createWoRequirement(reqPayload);
            } catch (reqErr) {
              console.warn("Failed to create WO requirement for BOM record:", reqErr, bom);
            }
          }
        }
      } catch (bErr) {
        console.warn("Failed to expand BOM into WO requirements:", bErr);
      }

      // add 'Released' audit trail entry
      try {
        let fiscalYearIdForAudit: any = null;
        try {
          const company = Array.isArray(companies) && companies.length > 0 ? companies[0] : null;
          const companyFiscalId = company?.fiscal_year_id ?? company?.fiscal_year ?? null;
          if (companyFiscalId) {
            fiscalYearIdForAudit = companyFiscalId;
          } else if (Array.isArray(fiscalYears) && fiscalYears.length > 0) {
            const auditDateObj = releasedDate ? new Date(releasedDate) : new Date();
            const matching = (fiscalYears as any[]).find((fy: any) => {
              if (!fy.fiscal_year_from || !fy.fiscal_year_to) return false;
              const from = new Date(fy.fiscal_year_from);
              const to = new Date(fy.fiscal_year_to);
              if (isNaN(from.getTime()) || isNaN(to.getTime())) return false;
              return auditDateObj >= from && auditDateObj <= to;
            });
            const chosen = matching || (fiscalYears as any[])[0];
            fiscalYearIdForAudit = chosen?.id ?? chosen?.fiscal_year_id ?? null;
          }
        } catch (fyErr) {
          console.warn("Failed to determine fiscal year for audit trail:", fyErr);
        }

        const auditPayload: any = {
          type: 26,
          trans_no: idFromState,
          user: user?.id ?? (Number(localStorage.getItem("userId")) || null),
          stamp: new Date().toISOString(),
          description: memo && String(memo).trim() !== "" ? `Released - ${memo}` : "Released",
          fiscal_year: fiscalYearIdForAudit ?? null,
          gl_date: workOrderDate,
          gl_seq: 0,
        };

        await auditTrailApi.create(auditPayload);
      } catch (atErr) {
        console.warn("Failed to create release audit trail record:", atErr);
      }

      // create comment if none exists for this work order and memo provided
      try {
        const existing = (comments || []).find((c: any) => Number(c.type ?? c.type_id ?? 0) === 26 && String(c.id ?? c.record_id ?? c.ref_id ?? c.trans_no ?? "") === String(idFromState));
        if (!existing && memo && String(memo).trim() !== "") {
          await createComment({ type: 26, id: idFromState, date_: releasedDate, memo_: memo });
        }
      } catch (cErr) {
        console.warn("Failed to create comment on release:", cErr);
      }

      try {
        queryClient.invalidateQueries({ queryKey: ["workOrders"] });
        queryClient.invalidateQueries({ queryKey: ["comments", idFromState] });
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      } catch (invErr) {
        console.warn("Failed to invalidate queries after release:", invErr);
      }

      navigate("/manufacturing/transactions/work-order-entry/success", { state: { reference, id: idFromState, type: 2, successMode: 'release' } });
    } catch (err: any) {
      console.error("Failed to release work order:", err);
      setSaveError(err?.message || "Failed to release work order");
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { title: "Transactions", href: "/manufacturing/transactions" },
    { title: "Release Work Order" },
  ];

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Release Work Order" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {loadingError && <Alert severity="error">{loadingError}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Work Order #:" fullWidth size="small" value={woId} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Work Order Reference:" fullWidth size="small" value={reference} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Released Date:" type="date" fullWidth size="small" value={releasedDate} onChange={(e) => setReleasedDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12}>
            <TextField label="Memo" fullWidth multiline rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Enter memo or notes..." disabled={memoDisabled} />
          </Grid>

          {saveError && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mt: 1 }}>{saveError}</Alert>
            </Grid>
          )}

          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="contained" color="primary" onClick={handleRelease} disabled={isSaving}>{isSaving ? "Releasing..." : "Release Work Order"}</Button>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}
