import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import theme from "../../../../theme";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { getComments, createComment } from "../../../../api/Comments/CommentsApi";
import { getWorkOrderById, updateWorkOrder, deleteWorkOrder } from "../../../../api/WorkOrders/WorkOrderApi";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function UpdateWorkOrderEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const idFromState = (location.state as any)?.id ?? null;

  const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: categories = [] } = useQuery<{ category_id: number; description: string }[]>({
    queryKey: ["itemCategories"],
    queryFn: () => getItemCategories() as Promise<{ category_id: number; description: string }[]>,
  });

  const [loadingError, setLoadingError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // form fields
  const [reference, setReference] = useState("");
  const [type, setType] = useState<number | string>("");
  const [selectedItem, setSelectedItem] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateRequiredBy, setDateRequiredBy] = useState("");
  const [memo, setMemo] = useState("");
  const [woMemo, setWoMemo] = useState("");
  const [memoDisabled, setMemoDisabled] = useState(false);

  const manufacturableItems = useMemo(() => (items || []).filter((it: any) => Number(it.mb_flag) === 1), [items]);

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
        setReference(wo.wo_ref ?? wo.reference ?? "");
        setType(typeof wo.type !== "undefined" ? Number(wo.type) : "");
        const stock = String(wo.stock_id ?? wo.stock ?? wo.item_id ?? "");
        setSelectedItem(stock);
        setItemCode(stock);
        setDestinationLocation(wo.loc_code ?? wo.location ?? wo.loc ?? "");
        setQuantity(String(wo.units_reqd ?? wo.quantity ?? wo.units_issued ?? 0));
        setDate(wo.date ? String(wo.date).split("T")[0] : new Date().toISOString().split("T")[0]);
        setDateRequiredBy(wo.required_by ?? wo.date_required_by ?? "");
        setWoMemo(wo.memo ?? wo.memo_ ?? wo.notes ?? wo.description ?? "");
      } catch (err) {
        console.warn("Failed to load work order:", err);
        setLoadingError("Failed to load work order");
      }
    })();
  }, [idFromState]);

  const { data: comments = [] } = useQuery({ queryKey: ["comments", idFromState], queryFn: getComments, enabled: !!idFromState });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!idFromState) return;
    if (!Array.isArray(comments)) return;

    // find a comment that references this work order (be tolerant of field names)
    const match = comments.find((c: any) => {
      if (Number(c.type) !== 26) return false;
      const refs = [c.id, c.record_id, c.ref_id, c.trans_no, c.transaction_id, c.source_id];
      return refs.some(r => r !== undefined && String(r) === String(idFromState));
    });

    if (match) {
      const cm = match.memo_ ?? match.memo ?? match.notes ?? match.description ?? match.text ?? "";
      // show existing comment memo (may be empty) and disable editing — do not update existing comments
      setMemo(String(cm ?? ""));
      setMemoDisabled(true);
      return;
    }

    // if no comment row found, fall back to workorder memo (but don't overwrite if user already typed)
    if ((!memo || String(memo).trim() === "") && woMemo && String(woMemo).trim() !== "") {
      setMemo(String(woMemo));
    }
  }, [comments, idFromState, woMemo]);

  useEffect(() => {
    if (!selectedItem) {
      setItemCode("");
      return;
    }
    const it = (items || []).find((i: any) => String(i.stock_id ?? i.id) === String(selectedItem));
    setItemCode(it ? String(it.stock_id ?? it.id ?? "") : "");
  }, [selectedItem, items]);

  const handleUpdate = async () => {
    setSaveError("");
    if (!idFromState) { setSaveError("Missing work order id"); return; }
    if (!destinationLocation) { setSaveError("Please select a destination location"); return; }
    if (!selectedItem) { setSaveError("Please select an item"); return; }
    if (!quantity || Number(quantity) <= 0) { setSaveError("Quantity must be greater than 0"); return; }

    setIsSaving(true);
    try {
      const payload = {
        wo_ref: reference,
        loc_code: destinationLocation,
        units_reqd: Number(quantity),
        stock_id: String(selectedItem || itemCode || ""),
        date: date,
        type: Number(type),
        required_by: dateRequiredBy && String(dateRequiredBy).trim() !== "" ? dateRequiredBy : date,
        released_date: date,
        units_issued: Number(quantity),
        closed: false,
        released: true,
        additional_costs: 0,
        memo: memo,
      } as any;

      // update the work order first
      await updateWorkOrder(idFromState, payload);

      // then create or update the comment record for this work order (type 26)
      try {
        const commentPayload = {
          type: 26,
          id: idFromState,
          date_: date,
          memo_: memo,
        } as any;

        // determine existing comment (if any)
        const existing = Array.isArray(comments)
          ? comments.find((c: any) => Number(c.type) === 26 && [c.id, c.record_id, c.ref_id, c.trans_no, c.transaction_id, c.source_id].some(r => r !== undefined && String(r) === String(idFromState)))
          : null;

        if (!existing) {
          // only create a new comment if no comment row exists for this work order and memo provided
          if (memo && String(memo).trim() !== "") {
            await createComment(commentPayload);
          }
        }
      } catch (cErr) {
        console.warn("Failed to create/update comment for work order:", cErr);
      }

      // invalidate queries so other views show updated data
      try {
        queryClient.invalidateQueries({ queryKey: ["workOrders"] });
        queryClient.invalidateQueries({ queryKey: ["comments", idFromState] });
        queryClient.invalidateQueries({ queryKey: ["comments"] });
      } catch (invErr) {
        console.warn("Failed to invalidate queries:", invErr);
      }

      navigate("/manufacturing/transactions/outstanding-work-orders");
    } catch (err: any) {
      console.error("Failed to update work order:", err);
      setSaveError(err?.message || "Failed to update work order");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!idFromState) return;
    if (!confirm("Delete this work order? This cannot be undone.")) return;
    try {
      await deleteWorkOrder(idFromState);
      try {
        queryClient.invalidateQueries({ queryKey: ["workOrders"] });
        queryClient.invalidateQueries({ queryKey: ["comments", idFromState] });
        queryClient.invalidateQueries({ queryKey: ["comments"] } );
      } catch (invErr) {
        console.warn("Failed to invalidate queries after delete:", invErr);
      }
      navigate("/manufacturing/transactions/outstanding-work-orders");
    } catch (err: any) {
      console.error("Failed to delete work order:", err);
      setSaveError(err?.message || "Failed to delete work order");
    }
  };

  const breadcrumbItems = [
    { title: "Transactions", href: "/manufacturing/transactions" },
    { title: "Update Work Order" },
  ];

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Update Work Order" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {loadingError && <Alert severity="error">{loadingError}</Alert>}
        {saveError && <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Reference" fullWidth size="small" value={reference} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Type" fullWidth size="small" value={type} onChange={() => {}} disabled>
              <MenuItem value={0}>Assemble</MenuItem>
              <MenuItem value={1}>Unassemble</MenuItem>
              <MenuItem value={2}>Advanced Manufacture</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Item Code" fullWidth size="small" value={itemCode} InputProps={{ readOnly: true }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="item-select-label">Select Item</InputLabel>
                  <Select labelId="item-select-label" value={selectedItem ?? ""} label="Select Item" onChange={(e) => setSelectedItem(String(e.target.value))}>
                    {manufacturableItems.map((it: any) => (
                      <MenuItem key={String(it.stock_id ?? it.id)} value={String(it.stock_id ?? it.id)}>{it.item_name ?? it.name ?? it.description ?? String(it.stock_id ?? it.id)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="location-label">Destination Location</InputLabel>
              <Select labelId="location-label" value={destinationLocation} label="Destination Location" onChange={(e) => setDestinationLocation(String(e.target.value))}>
                <MenuItem value="">Select location</MenuItem>
                {(locations || []).map((loc: any) => (
                  <MenuItem key={loc.loc_code} value={loc.loc_code}>{loc.location_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Quantity" fullWidth size="small" type="number" inputProps={{ min: 0 }} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Date" type="date" fullWidth size="small" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Date Required By" type="date" fullWidth size="small" value={dateRequiredBy} onChange={(e) => setDateRequiredBy(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Memo"
              fullWidth
              multiline
              rows={3}
              value={memo}
              onChange={memoDisabled ? undefined : (e) => setMemo(e.target.value)}
              placeholder="Enter memo or notes..."
              disabled={memoDisabled}
            />
          </Grid>

          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="contained" color="error" onClick={handleDelete}>Delete this work order</Button>
            <Button variant="contained" color="primary" onClick={handleUpdate} disabled={isSaving}>{isSaving ? "Updating..." : "Update"}</Button>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}
