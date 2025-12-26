import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Alert,
  ListSubheader,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
// import { getGLAccounts } from "../../../../api/GLAccounts/GLAccountsApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { set } from "date-fns";
import { createWorkOrder } from "../../../../api/WorkOrders/WorkOrderApi";
import { getWorkOrders } from "../../../../api/WorkOrders/WorkOrderApi";
import { createJournal, getJournals } from "../../../../api/Journals/JournalApi";
import useCurrentUser from "../../../../hooks/useCurrentUser";
import auditTrailApi from "../../../../api/AuditTrail/AuditTrailApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { getCompanies } from "../../../../api/CompanySetup/CompanySetupApi";
import { getCurrencies } from "../../../../api/Currency/currencyApi";
import { createComment } from "../../../../api/Comments/CommentsApi";
import { createWoManufacture } from "../../../../api/WorkOrders/WOManufactureApi";
import { getBoms } from "../../../../api/Bom/BomApi";
import { createWoRequirement } from "../../../../api/WorkOrders/WORequirementsApi";
import { createWOCosting } from "../../../../api/WorkOrders/WOCostingApi";
import { createStockMove } from "../../../../api/StockMoves/StockMovesApi";

export default function WorkOrderEntry() {
  const navigate = useNavigate();

  // Queries
  const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: categories = [] } = useQuery<{ category_id: number; description: string }[]>({
    queryKey: ["itemCategories"],
    queryFn: () => getItemCategories() as Promise<{ category_id: number; description: string }[]>,
  });
  const { data: chartMasters = [] } = useQuery({
    queryKey: ["chartMasters"],
    queryFn: () => import("../../../../api/GLAccounts/ChartMasterApi").then(m => m.getChartMasters()),
  });

  // Map of account type ids to descriptive text (used to group the dropdown)
  const accountTypeMap: Record<string, string> = {
    "1": "Current Assets",
    "2": "Inventory Assets",
    "3": "Capital Assets",
    "4": "Current Liabilities",
    "5": "Long Term Liabilities",
    "6": "Share Capital",
    "7": "Retained Earnings",
    "8": "Sales Revenue",
    "9": "Other Revenue",
    "10": "Cost of Good Sold",
    "11": "Payroll Expenses",
    "12": "General and Adminitrative Expenses",
  };

  // Group chart masters by descriptive account type for the select dropdown
  const groupedChartMasters = useMemo(() => {
    const groups: Record<string, any[]> = {};
    (chartMasters as any[]).forEach((acc: any) => {
      const typeText = accountTypeMap[String(acc.account_type)] || "Unknown";
      if (!groups[typeText]) groups[typeText] = [];
      groups[typeText].push(acc);
    });
    // sort each group's accounts by account_code for stable order
    Object.values(groups).forEach((arr) => arr.sort((a: any, b: any) => (String(a.account_code || "")).localeCompare(String(b.account_code || ""))));
    return groups;
  }, [chartMasters]);

  // Only include manufacturable items for the Select dropdown (mb_flag === 1)
  const manufacturableItems = useMemo(() => {
    return (items || []).filter((it: any) => Number(it.mb_flag) === 1);
  }, [items]);
  // Form fields
  const [reference, setReference] = useState("");
  const [type, setType] = useState<number | string>("");
  const [itemCode, setItemCode] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateRequiredBy, setDateRequiredBy] = useState("");
  const [labourCost, setLabourCost] = useState("0.00");
  const [creditLabourAccount, setCreditLabourAccount] = useState("");
  const [overheadCost, setOverheadCost] = useState("0.00");
  const [creditOverheadAccount, setCreditOverheadAccount] = useState("");
  const [memo, setMemo] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [openLabourAccountSelect, setOpenLabourAccountSelect] = useState(false);
  const [openOverheadAccountSelect, setOpenOverheadAccountSelect] = useState(false);

  // Update item code when selected item changes
  useEffect(() => {
    if (!selectedItem) {
      setItemCode("");
      return;
    }
    const it = (items || []).find((i: any) => String(i.stock_id ?? i.id) === String(selectedItem));
    setItemCode(it ? String(it.stock_id ?? it.id ?? "") : "");

    // populate labour and overhead costs from the selected item if available
    if (it) {
      const rawLabour = it.labour_cost ?? it.labourCost ?? it.standard_labour_cost ?? it.labour_cost_local ?? 0;
      const rawOverhead = it.overhead_cost ?? it.overheadCost ?? it.standard_overhead_cost ?? 0;
      const labourVal = Number(rawLabour);
      const overheadVal = Number(rawOverhead);
      setLabourCost(!isNaN(labourVal) ? labourVal.toFixed(2) : "0.00");
      setOverheadCost(!isNaN(overheadVal) ? overheadVal.toFixed(2) : "0.00");
    } else {
      setLabourCost("0.00");
      setOverheadCost("0.00");
    }
  }, [selectedItem, items]);

  // Set defaults for dropdowns to first available option when data loads
  useEffect(() => {
    if (!type) {
      setType(0);
    }
  }, [type]);

  useEffect(() => {
    if (!selectedItem && manufacturableItems && manufacturableItems.length > 0) {
      const first = manufacturableItems[0];
      const stockId = first.stock_id ?? first.id ?? first.stock_master_id ?? first.item_id ?? "";
      if (stockId !== "") setSelectedItem(String(stockId));
    }
  }, [manufacturableItems, selectedItem]);

  useEffect(() => {
    if (!destinationLocation && locations && locations.length > 0) {
      const firstLoc = locations[0];
      if (firstLoc?.loc_code) setDestinationLocation(firstLoc.loc_code);
    }
  }, [locations, destinationLocation]);

  // Fiscal years used to build fiscal-year-aware reference like PurchaseOrderEntry
  const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });
  const { data: currencies = [] } = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const { user } = useCurrentUser();

  useEffect(() => {
    (async () => {
      // prefer company setup fiscal year if available
      try {
        let yearLabel: string | null = null;

        const company = Array.isArray(companies) && companies.length > 0 ? companies[0] : null;
        const companyFiscalId = company?.fiscal_year_id ?? company?.fiscal_year ?? null;

        if (companyFiscalId && fiscalYears && fiscalYears.length > 0) {
          const chosenFy = fiscalYears.find((fy: any) => String(fy.id ?? fy.fiscal_year_id ?? fy.fiscal_year) === String(companyFiscalId));
          if (chosenFy) {
            const fromYear = chosenFy.fiscal_year_from ? new Date(chosenFy.fiscal_year_from).getFullYear() : null;
            const toYear = chosenFy.fiscal_year_to ? new Date(chosenFy.fiscal_year_to).getFullYear() : fromYear;
            yearLabel = chosenFy.fiscal_year || (fromYear && toYear ? (fromYear === toYear ? String(fromYear) : `${fromYear}-${toYear}`) : String(new Date().getFullYear()));
          }
        }

        // fallback: use date to determine fiscal year if we don't have company-configured fiscal year
        if (!yearLabel) {
          if (!date) return;
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) return;

          yearLabel = String(dateObj.getFullYear());
          if (fiscalYears && fiscalYears.length > 0) {
            const matching = fiscalYears.find((fy: any) => {
              if (!fy.fiscal_year_from || !fy.fiscal_year_to) return false;
              const from = new Date(fy.fiscal_year_from);
              const to = new Date(fy.fiscal_year_to);
              if (isNaN(from.getTime()) || isNaN(to.getTime())) return false;
              return dateObj >= from && dateObj <= to;
            });

            const chosen = matching || [...fiscalYears]
              .filter((fy: any) => fy.fiscal_year_from && !isNaN(new Date(fy.fiscal_year_from).getTime()))
              .sort((a: any, b: any) => new Date(b.fiscal_year_from).getTime() - new Date(a.fiscal_year_from).getTime())
              .find((fy: any) => new Date(fy.fiscal_year_from) <= dateObj) || fiscalYears[0];

            if (chosen) {
              const fromYear = chosen.fiscal_year_from ? new Date(chosen.fiscal_year_from).getFullYear() : dateObj.getFullYear();
              const toYear = chosen.fiscal_year_to ? new Date(chosen.fiscal_year_to).getFullYear() : fromYear;
              yearLabel = chosen.fiscal_year || (fromYear === toYear ? String(fromYear) : `${fromYear}-${toYear}`);
            }
          }
        }

        // find next sequential number for work orders in that fiscal year
        const allWOs = await getWorkOrders();
        let nextNum = 1;
        if (Array.isArray(allWOs) && allWOs.length > 0 && yearLabel) {
          const yearPattern = `/${yearLabel}`;
          const matchingRefs = allWOs
            .map((w: any) => w.wo_ref ?? w.reference ?? "")
            .filter((ref: string) => String(ref).endsWith(yearPattern))
            .map((ref: string) => {
              const parts = String(ref).split('/');
              if (parts.length >= 2) {
                const numPart = parts[0];
                const parsed = parseInt(numPart, 10);
                return isNaN(parsed) ? 0 : parsed;
              }
              return 0;
            })
            .filter((n: number) => n > 0);
          if (matchingRefs.length > 0) {
            const maxRef = Math.max(...matchingRefs);
            nextNum = maxRef + 1;
          }
        }
        if (yearLabel) setReference(`${nextNum.toString().padStart(3, '0')}/${yearLabel}`);
      } catch (err) {
        console.warn('Failed to fetch work orders for reference generation', err);
      }
    })();
  }, [date, fiscalYears, companies]);

  useEffect(() => {
    // pick the first available account from groupedChartMasters for both labour and overhead
    if ((!creditLabourAccount || !creditOverheadAccount) && Object.keys(groupedChartMasters).length > 0) {
      const allAccounts = Object.values(groupedChartMasters).flat();
      if (allAccounts.length > 0) {
        const accCode = allAccounts[0].account_code ?? allAccounts[0].accountCode ?? "";
        if (accCode) {
          if (!creditLabourAccount) setCreditLabourAccount(String(accCode));
          if (!creditOverheadAccount) setCreditOverheadAccount(String(accCode));
        }
      }
    }
  }, [groupedChartMasters, creditLabourAccount, creditOverheadAccount]);

  const handleAddWorkOrder = async () => {
    // Validation
    if (!reference) {
      setSaveError("Please enter a reference");
      return;
    }
    if (type === "" || type === null || typeof type === "undefined" || isNaN(Number(type))) {
      setSaveError("Please select a type");
      return;
    }
    if (!selectedItem) {
      setSaveError("Please select an item");
      return;
    }
    if (!destinationLocation) {
      setSaveError("Please select a destination location");
      return;
    }
    if (!quantity) {
      setSaveError("Please enter the quantity");
      return;
    }
    if (Number(quantity) <= 0) {
      setSaveError("Quantity must be greater than 0");
      return;
    }
    if (!date) {
      setSaveError("Please select a date");
      return;
    }
    if (Number(type) === 2 && !dateRequiredBy) {
      setSaveError("Please select Date Required By");
      return;
    }

    // Prevent creating work orders if the selected fiscal year is closed (closed === 1)
    try {
      let chosenFy: any | null = null;
      const company = Array.isArray(companies) && companies.length > 0 ? companies[0] : null;
      const companyFiscalId = company?.fiscal_year_id ?? company?.fiscal_year ?? null;
      if (companyFiscalId && Array.isArray(fiscalYears) && fiscalYears.length > 0) {
        chosenFy = fiscalYears.find((fy: any) => String(fy.id ?? fy.fiscal_year_id ?? fy.fiscal_year) === String(companyFiscalId));
      }

      if (!chosenFy) {
        // fallback: find fiscal year that contains the selected date
        if (date) {
          const dateObj = new Date(date);
          if (!isNaN(dateObj.getTime()) && Array.isArray(fiscalYears)) {
            chosenFy = fiscalYears.find((fy: any) => {
              if (!fy.fiscal_year_from || !fy.fiscal_year_to) return false;
              const from = new Date(fy.fiscal_year_from);
              const to = new Date(fy.fiscal_year_to);
              if (isNaN(from.getTime()) || isNaN(to.getTime())) return false;
              return dateObj >= from && dateObj <= to;
            }) || null;
          }
        }
      }

      // If company has a configured fiscal year, ensure the entered date is within it and it's not closed
      try {
        if (companyFiscalId && chosenFy) {
          if (date) {
            const dateObj = new Date(date);
            const from = chosenFy.fiscal_year_from ? new Date(chosenFy.fiscal_year_from) : null;
            const to = chosenFy.fiscal_year_to ? new Date(chosenFy.fiscal_year_to) : null;
            const outOfRange = !from || !to || isNaN(from.getTime()) || isNaN(to.getTime()) || dateObj < from || dateObj > to;
            const closed = Number(chosenFy.closed) === 1;
            if (outOfRange || closed) {
              setSaveError("The entered date is out of fiscal year or is closed for further data entry.");
              return;
            }
          }
        }
      } catch (fyCheckErr) {
        console.warn("Failed to validate company fiscal year date check:", fyCheckErr);
      }

      if (chosenFy && Number(chosenFy.closed) === 1) {
        setSaveError("The selected fiscal year is closed. Cannot create work order.");
        return;
      }
      // determine fiscalYearId for audit trail entries - prefer company configured fiscal year
      var fiscalYearIdForAudit: any = null;
      if (companyFiscalId) {
        fiscalYearIdForAudit = companyFiscalId;
      } else if (chosenFy) {
        fiscalYearIdForAudit = chosenFy?.id ?? chosenFy?.fiscal_year_id ?? null;
      } else {
        try {
          if (date && Array.isArray(fiscalYears) && fiscalYears.length > 0) {
            const dateObj = new Date(date);
            const matching = fiscalYears.find((fy: any) => {
              if (!fy.fiscal_year_from || !fy.fiscal_year_to) return false;
              const from = new Date(fy.fiscal_year_from);
              const to = new Date(fy.fiscal_year_to);
              if (isNaN(from.getTime()) || isNaN(to.getTime())) return false;
              return dateObj >= from && dateObj <= to;
            });
            const chosen = matching || fiscalYears[0];
            fiscalYearIdForAudit = chosen?.id ?? chosen?.fiscal_year_id ?? null;
          }
        } catch (fyErr) {
          console.warn("Failed to determine fiscal year for audit trail:", fyErr);
        }
      }
    } catch (err) {
      console.warn("Fiscal year check failed:", err);
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const payload = {
        wo_ref: reference,
        loc_code: destinationLocation,
        units_reqd: Number(quantity),
        stock_id: String(selectedItem || itemCode || ""),
        date: date,
        type: Number(type),
        required_by: Number(type) === 2 ? (dateRequiredBy || date) : date,
        released_date: date,
        units_issued: Number(quantity),
        closed: true,
        released: true,
        additional_costs: 0,
      };

      console.log("Creating work order with payload:", payload);
      const res = await createWorkOrder(payload as any);

      // determine created work order id from response (be tolerant of different APIs)
      const createdWoId = res?.id ?? res?.workorder_id ?? res?.wo_id ?? res?.trans_no ?? res?.insertId ?? null;

      // create first two audit trail entries: created and released
      try {
        const nowStamp = new Date().toISOString();
        // 1st: created
        await auditTrailApi.create({
          type: 26,
          trans_no: createdWoId,
          user: user?.id ?? (Number(localStorage.getItem("userId")) || null),
          stamp: nowStamp,
          description: "",
          fiscal_year: fiscalYearIdForAudit ?? null,
          gl_date: date,
          gl_seq: null,
        });

        // 2nd: released
        await auditTrailApi.create({
          type: 26,
          trans_no: createdWoId,
          user: user?.id ?? (Number(localStorage.getItem("userId")) || null),
          stamp: nowStamp,
          description: "Released",
          fiscal_year: fiscalYearIdForAudit ?? null,
          gl_date: date,
          gl_seq: 0,
        });
      } catch (atErr) {
        console.warn("Failed to create initial audit trail records:", atErr);
      }

      // Create journal entries for labour and overhead if provided
      (async () => {
        try {
          // compute next trans_no for journal type 0
          const allJournals = await getJournals();
          const sameType = Array.isArray(allJournals) ? allJournals.filter((j: any) => Number(j.type) === 0) : [];
          const maxTransNo = sameType.length > 0 ? Math.max(...sameType.map((j: any) => Number(j.trans_no) || 0)) : 0;
          const nextTransNo = maxTransNo + 1;

          const toCreate: Array<{ amount: number; note: string }> = [];
          const labourAmt = Number(labourCost || 0);
          const overheadAmt = Number(overheadCost || 0);
          if (!isNaN(labourAmt) && labourAmt > 0) toCreate.push({ amount: labourAmt, note: "Labour" });
          if (!isNaN(overheadAmt) && overheadAmt > 0) toCreate.push({ amount: overheadAmt, note: "Overhead" });

          let currentTransNo = nextTransNo;
          // determine currency abbreviation from company setup (home_currency_id) falling back to USD
          const company = Array.isArray(companies) && companies.length > 0 ? companies[0] : null;
          const homeCurrencyId = company?.home_currency_id ?? company?.home_currency ?? null;
          let currencyAbbrev = "USD";
          if (homeCurrencyId && Array.isArray(currencies) && currencies.length > 0) {
            const foundCur = (currencies as any[]).find((c: any) => String(c.id) === String(homeCurrencyId));
            if (foundCur && foundCur.currency_abbreviation) currencyAbbrev = foundCur.currency_abbreviation;
          }

          for (const entry of toCreate) {
            const thisTransNo = currentTransNo;
            const journalPayload = {
              type: 0,
              trans_no: thisTransNo,
              tran_date: date,
              reference: reference,
              source_ref: null,
              event_date: date,
              doc_date: date,
              currency: currencyAbbrev,
              amount: entry.amount,
              rate: 1,
            } as any;
              try {
                const jRes = await createJournal(journalPayload);

                // determine created trans_no from response
                const createdTransNo = jRes?.trans_no ?? jRes?.id ?? thisTransNo;

                // create corresponding WO costing record (0 = labour, 1 = overhead)
                try {
                  if (createdWoId) {
                    const costPayload = {
                      workorder_id: createdWoId,
                      cost_type: entry.note === "Labour" ? 0 : 1,
                      trans_type: 0,
                      trans_no: createdTransNo,
                      factor: 1,
                    } as any;
                    await createWOCosting(costPayload);
                  }
                } catch (wcErr) {
                  console.warn("Failed to create WO costing record:", wcErr);
                }

                // create audit trail record for this journal entry (type 0)
                try {
                  await auditTrailApi.create({
                    type: 0,
                    trans_no: createdTransNo,
                    user: user?.id ?? (Number(localStorage.getItem("userId")) || null),
                    stamp: new Date().toISOString(),
                    description: "",
                    fiscal_year: fiscalYearIdForAudit ?? null,
                    gl_date: date,
                    gl_seq: 0,
                  });
                } catch (atJErr) {
                  console.warn("Failed to create audit trail for journal:", atJErr);
                }
              } catch (jErr) {
                console.warn("Failed to create journal entry:", jErr, journalPayload);
              }
            currentTransNo += 1;
          }
          // create a comment record if memo was provided
          if (memo && String(memo).trim() !== "") {
            try {
              const commentPayload = {
                type: 26,
                id: createdWoId,
                date_: date,
                memo_: memo,
              };
              await createComment(commentPayload);
            } catch (cErr) {
              console.warn("Failed to create comment for work order:", cErr);
            }
          }
          // create a WO manufacture record for this work order and capture its id
          let createdWoManId: any = null;
          try {
            if (createdWoId) {
              const woManPayload = {
                reference: reference,
                workorder_id: createdWoId,
                quantity: Number(quantity) || 0,
                date: date,
              } as any;
              const manRes = await createWoManufacture(woManPayload);
              console.debug("WO manufacture create response:", manRes);
              createdWoManId = manRes?.id ?? manRes?.workmanufacture_id ?? manRes?.wo_manufacture_id ?? manRes?.trans_no ?? manRes?.insertId ?? null;
            }
          } catch (mErr) {
            console.warn("Failed to create WO manufacture record:", mErr);
          }
          // create WO requirement records by expanding BOM components where parent == selected item
          try {
            const parentCode = String(itemCode || selectedItem || "");
            if (parentCode) {
              const allBoms = await getBoms();
              const matches = Array.isArray(allBoms) ? allBoms.filter((b: any) => String(b.parent) === parentCode) : [];
              for (const bom of matches) {
                try {
                  const componentId = bom.component ?? bom.component_stock_id ?? bom.component_id ?? "";
                  const workCentre = Number(bom.work_centre ?? bom.work_centre_id) || 0;
                  const unitsReq = Number(bom.quantity ?? bom.units_req ?? bom.qty) || 0;
                  const locCode = bom.loc_code ?? bom.loccode ?? "";
                  const unitsIssued = Number(quantity) || 0;

                  // find material/unit cost for the component from items list
                  const compItem = (items || []).find((it: any) => String(it.stock_id ?? it.id) === String(componentId));
                  const unitCostRaw = compItem?.material_cost ?? compItem?.materialCost ?? compItem?.standard_cost ?? compItem?.unit_cost ?? compItem?.cost ?? 0;
                  const unitCost = Number(unitCostRaw) || 0;

                  const reqPayload = {
                    workorder_id: createdWoId,
                    stock_id: String(componentId),
                    work_centre: workCentre,
                    units_req: unitsReq,
                    unit_cost: unitCost,
                    loc_code: String(locCode),
                    units_issued: unitsIssued,
                  } as any;

                  await createWoRequirement(reqPayload);

                  // create corresponding stock_move record for this BOM component
                  try {
                    const stockMovePayload = {
                      trans_no: createdWoManId,
                      stock_id: String(componentId),
                      type: 29,
                      loc_code: String(locCode),
                      tran_date: date,
                      price: 0,
                      reference: "",
                      qty: Number(quantity) ? -Math.abs(Number(quantity)) : 0,
                      standard_cost: unitCost,
                    } as any;
                    console.debug("Creating stock_move with payload:", stockMovePayload);
                    const smRes = await createStockMove(stockMovePayload);
                    console.debug("Stock move create response:", smRes);
                  } catch (smErr) {
                    console.warn("Failed to create stock_move for BOM component:", smErr, bom);
                  }
                } catch (reqErr) {
                  console.warn("Failed to create WO requirement for BOM record:", reqErr, bom);
                }
              }
            }
          } catch (bErr) {
            console.warn("Failed to expand BOM into WO requirements:", bErr);
          }

          // create stock_move record for the manufactured item itself
          try {
            if (createdWoId) {
              const mainItemId = String(itemCode || selectedItem || "");
              const mainItem = (items || []).find((it: any) => String(it.stock_id ?? it.id) === mainItemId);
              const mainMaterialCost = Number(mainItem?.material_cost ?? mainItem?.materialCost ?? mainItem?.standard_cost ?? mainItem?.unit_cost ?? 0) || 0;

              const mainStockMovePayload = {
                trans_no: createdWoId,
                stock_id: mainItemId,
                type: 26,
                loc_code: String(destinationLocation || ""),
                tran_date: date,
                price: 0,
                reference: reference || "",
                qty: Number(quantity) || 0,
                standard_cost: mainMaterialCost,
              } as any;

              console.debug("Creating stock_move for manufactured item:", mainStockMovePayload);
              const mainSmRes = await createStockMove(mainStockMovePayload);
              console.debug("Manufactured item stock_move response:", mainSmRes);
              try {
                await auditTrailApi.create({
                  type: 29,
                  trans_no: createdWoManId,
                  user: user?.id ?? (Number(localStorage.getItem("userId")) || null),
                  stamp: new Date().toISOString(),
                  description: "Production",
                  fiscal_year: fiscalYearIdForAudit ?? null,
                  gl_date: date,
                  gl_seq: 0,
                });
              } catch (atProdErr) {
                console.warn("Failed to create audit trail for production stock move:", atProdErr);
              }
            }
          } catch (mainSmErr) {
            console.warn("Failed to create stock_move for manufactured item:", mainSmErr);
          }
        } catch (err) {
          console.warn("Failed to prepare journal entries:", err);
        }
      })();

      navigate("/manufacturing/transactions/work-order-entry/success", { state: { reference, id: createdWoId } });
    } catch (error: any) {
      console.error("Error creating work order:", error);
      setSaveError(error?.message || JSON.stringify(error) || "Failed to create work order");
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Work Order Entry" },
  ];

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
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
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>

      {/* Work Order Form */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Reference"
              fullWidth
              size="small"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Type"
              fullWidth
              size="small"
              value={type}
              onChange={(e) => setType(Number((e.target as HTMLInputElement).value))}
            >
              <MenuItem value={0}>Assemble</MenuItem>
              <MenuItem value={1}>Unassemble</MenuItem>
              <MenuItem value={2}>Advanced Manufacture</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Item Code"
                  fullWidth
                  size="small"
                  value={itemCode}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Select Item"
                  fullWidth
                  size="small"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                >
                  <MenuItem value="">Select item</MenuItem>
                  {manufacturableItems && manufacturableItems.length > 0 ? (
                    (() => {
                      return Object.entries(
                        manufacturableItems.reduce((groups: Record<string, any[]>, item) => {
                          const catId = item.category_id || "Uncategorized";
                          if (!groups[catId]) groups[catId] = [];
                          groups[catId].push(item);
                          return groups;
                        }, {} as Record<string, any[]>)
                      ).map(([categoryId, groupedItems]: [string, any[]]) => {
                        const category = categories.find(cat => cat.category_id === Number(categoryId));
                        const categoryLabel = category ? category.description : `Category ${categoryId}`;
                        return [
                          <ListSubheader key={`cat-${categoryId}`}>
                            {categoryLabel}
                          </ListSubheader>,
                          groupedItems.map((item) => {
                            const stockId = item.stock_id ?? item.id ?? item.stock_master_id ?? item.item_id ?? 0;
                            const key = stockId;
                            const label = item.item_name ?? item.name ?? item.description ?? String(stockId);
                            const value = String(stockId);
                            return (
                              <MenuItem key={String(key)} value={value}>
                                {label}
                              </MenuItem>
                            );
                          })
                        ];
                      });
                    })()
                  ) : (
                    <MenuItem disabled value="">
                      No items
                    </MenuItem>
                  )}
                </TextField>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Destination Location"
              fullWidth
              size="small"
              value={destinationLocation}
              onChange={(e) => setDestinationLocation(e.target.value)}
            >
              <MenuItem value="">Select location</MenuItem>
              {(locations || []).map((loc: any) => (
                <MenuItem key={loc.loc_code} value={loc.loc_code}>{loc.location_name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {Number(type) === 2 ? (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Quantity Required"
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={quantity}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || v === "-") return setQuantity("");
                    const n = Number(v);
                    if (isNaN(n)) return;
                    setQuantity(String(Math.max(0, n)));
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  size="small"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date Required By"
                  type="date"
                  fullWidth
                  size="small"
                  value={dateRequiredBy}
                  onChange={(e) => setDateRequiredBy(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Memo"
                  fullWidth
                  multiline
                  rows={3}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Enter memo or notes..."
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Quantity"
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={quantity}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || v === "-") return setQuantity("");
                    const n = Number(v);
                    if (isNaN(n)) return;
                    setQuantity(String(Math.max(0, n)));
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  size="small"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Labour Cost"
                  fullWidth
                  size="small"
                  type="number"
                  value={labourCost}
                  onChange={(e) => setLabourCost(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Credit Labour Account"
                  fullWidth
                  size="small"
                  value={creditLabourAccount}
                  onChange={(e) => {
                    setCreditLabourAccount(e.target.value);
                    setOpenLabourAccountSelect(false);
                  }}
                  SelectProps={{
                    open: openLabourAccountSelect,
                    onOpen: () => setOpenLabourAccountSelect(true),
                    onClose: () => setOpenLabourAccountSelect(false),
                    renderValue: (value: any) => {
                      if (!value) return "";
                      const found = (chartMasters as any[]).find((c: any) => String(c.account_code) === String(value));
                      return found ? `${found.account_name} - ${found.account_code}` : String(value);
                    },
                  }}
                >
                  <MenuItem value="" onClick={() => {
                    setCreditLabourAccount("");
                    setOpenLabourAccountSelect(false);
                  }}>
                    Select account
                  </MenuItem>
                  {Object.entries(groupedChartMasters).map(([typeText, accounts]) => (
                    <React.Fragment key={typeText}>
                      <ListSubheader>{typeText}</ListSubheader>
                      {accounts.map((acc: any) => (
                        <MenuItem
                          key={String(acc.account_code)}
                          value={String(acc.account_code)}
                          onClick={() => {
                            setCreditLabourAccount(String(acc.account_code));
                            setOpenLabourAccountSelect(false);
                          }}
                        >
                          {acc.account_name} {acc.account_code ? ` - ${acc.account_code}` : ""}
                        </MenuItem>
                      ))}
                    </React.Fragment>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Overhead Cost"
                  fullWidth
                  size="small"
                  type="number"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Credit Overhead Account"
                  fullWidth
                  size="small"
                  value={creditOverheadAccount}
                  onChange={(e) => setCreditOverheadAccount(e.target.value)}
                  SelectProps={{
                    open: openOverheadAccountSelect,
                    onOpen: () => setOpenOverheadAccountSelect(true),
                    onClose: () => setOpenOverheadAccountSelect(false),
                    renderValue: (value: any) => {
                      if (!value) return "";
                      const found = (chartMasters as any[]).find((c: any) => String(c.account_code) === String(value));
                      return found ? `${found.account_name} - ${found.account_code}` : String(value);
                    },
                  }}
                >
                  <MenuItem value="" onClick={() => {
                    setCreditOverheadAccount("");
                    setOpenOverheadAccountSelect(false);
                  }}>
                    Select account
                  </MenuItem>
                  {Object.entries(groupedChartMasters).map(([typeText, accounts]) => (
                    <React.Fragment key={typeText}>
                      <ListSubheader>{typeText}</ListSubheader>
                      {accounts.map((acc: any) => (
                        <MenuItem
                          key={String(acc.account_code)}
                          value={String(acc.account_code)}
                          onClick={() => {
                            setCreditOverheadAccount(String(acc.account_code));
                            setOpenOverheadAccountSelect(false);
                          }}
                        >
                          {acc.account_name} {acc.account_code ? ` - ${acc.account_code}` : ""}
                        </MenuItem>
                      ))}
                    </React.Fragment>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Memo"
                  fullWidth
                  multiline
                  rows={3}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Enter memo or notes..."
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Success/Error Messages */}
      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {saveError}
        </Alert>
      )}

      {/* Submit Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={isSaving}
          onClick={handleAddWorkOrder}
        >
          {isSaving ? "Adding..." : "Add Work Order"}
        </Button>
      </Box>
    </Stack>
  );
}
