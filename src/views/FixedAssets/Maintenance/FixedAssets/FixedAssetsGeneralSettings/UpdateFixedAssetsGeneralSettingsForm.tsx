import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
  Grid,
  ListSubheader,
} from "@mui/material";
import theme from "../../../../../theme";
import DatePickerComponent from "../../../../../components/DatePickerComponent";
import { getChartMasters } from "../../../../../api/GLAccounts/ChartMasterApi";
import { getItemUnits } from "../../../../../api/ItemUnit/ItemUnitApi";
import { getItemTaxTypes } from "../../../../../api/ItemTaxType/ItemTaxTypeApi";
import { getItemCategories } from "../../../../../api/ItemCategories/ItemCategoriesApi";
import { getItemById, updateItem, deleteItem } from "../../../../../api/Item/ItemApi";
import { useNavigate, useParams } from "react-router-dom";
import { getItemTypes } from "../../../../../api/ItemType/ItemType";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

interface ItemGeneralSettingProps {
  itemId: string | number; //  always required now
}

export default function UpdateFixedAssetsGeneralSettingsForm({ itemId }: ItemGeneralSettingProps) {
  const [formData, setFormData] = useState({
    itemCode: "",
    itemName: "",
    description: "",
    category: "",
    itemTaxType: "",
    unitOfMeasure: "",
    fixedAssetClass: "",
    depreciationMethod: "",
    baseRate: "",
    rateMultiplier: "",
    depreciationStart: null as Date | null,
    dimension: "",
    salesAccount: "",
    assetAccount: "",
    depreciationCostAccount: "",
    depreciationDisposalAccount: "",
    imageFile: null as File | null,
    itemStatus: "",
  });

  const accountTypeMap: { [key: number]: string } = {
    1: "Current Assets",
    2: "Inventory Assets",
    3: "Capital Assets",
    4: "Current Liabilities",
    5: "Long Term Liabilities",
    6: "Share Capital",
    7: "Retained Earnings",
    8: "Sales Revenue",
    9: "Other Revenue",
    10: "Cost of Good Sold",
    11: "Payroll Expenses",
    12: "General and Adminitrative Expenses",
  };

  const [itemTypes, setItemTypes] = useState<any[]>([]);
  const [chartMasters, setChartMasters] = useState<any[]>([]);
  const [itemTaxTypes, setItemTaxTypes] = useState<any[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<any[]>([]);
  const [itemCategories, setItemCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const queryClient = useQueryClient();

  // 🔹 preload existing item
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [chartMastersRes, taxTypesRes, unitsRes, itemCategoriesRes] = await Promise.all([
          getChartMasters(),
          getItemTaxTypes(),
          getItemUnits(),
          getItemCategories(),
        ]);

        const filteredTaxTypes = (taxTypesRes || []).filter((type) => !type.inactive);
        const filteredUnits = (unitsRes || []).filter((unit) => !unit.inactive);
        const filteredItemCategories = (itemCategoriesRes || []).filter((cat) => !cat.inactive);

        setChartMasters(chartMastersRes || []);
        setItemTaxTypes(filteredTaxTypes);
        setUnitsOfMeasure(filteredUnits);
        setItemCategories(filteredItemCategories);

        // Set default values for dropdowns
        setFormData((prev) => ({
          ...prev,
          // use category_id (API uses this key) for defaults
          category: filteredItemCategories.length > 0 ? String(filteredItemCategories[0].category_id ?? filteredItemCategories[0].id) : "",
          itemTaxType: filteredTaxTypes.length > 0 ? String(filteredTaxTypes[0].id) : "",
          unitOfMeasure: filteredUnits.length > 0 ? String(filteredUnits[0].id) : "",
          salesAccount: chartMastersRes.find((acc) => acc.account_code === "4010")?.account_code || "",
          assetAccount: chartMastersRes.find((acc) => acc.account_code === "1510")?.account_code || "",
          depreciationCostAccount: chartMastersRes.find((acc) => acc.account_code === "5010")?.account_code || "",
          depreciationDisposalAccount: chartMastersRes.find((acc) => acc.account_code === "5040")?.account_code || "",
        }));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // fetch the specific item by id and populate form
  const {
    data: itemData,
    isLoading: itemLoading,
    isError: itemError,
    error: itemFetchError,
  } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItemById(itemId),
    enabled: !!itemId,
  });

  // map fetched itemData into form state
  useEffect(() => {
    if (!itemData) return;
    const data = itemData as any;
    setFormData((prev) => ({
      ...prev,
      itemCode: data.stock_id ?? "",
      itemName: data.description ?? "",
      description: data.long_description ?? "",
      category: data.category_id ? String(data.category_id) : prev.category || "",
      itemTaxType: data.tax_type_id ? String(data.tax_type_id) : prev.itemTaxType || "",
      unitOfMeasure: data.units ? String(data.units) : prev.unitOfMeasure || "",
      fixedAssetClass: data.fa_class_id ?? "",
      depreciationMethod: data.depreciation_method ?? "",
      baseRate: data.depreciation_rate ? String(data.depreciation_rate) : "",
      rateMultiplier: data.depreciation_factor ? String(data.depreciation_factor) : "",
      depreciationStart: data.depreciation_start ? new Date(data.depreciation_start) : null,
      dimension: "", // assuming not in API yet
      salesAccount: data.sales_account ?? prev.salesAccount ?? "",
      assetAccount: data.inventory_account ?? prev.assetAccount ?? "",
      depreciationCostAccount: data.cogs_account ?? prev.depreciationCostAccount ?? "",
      depreciationDisposalAccount: data.adjustment_account ?? prev.depreciationDisposalAccount ?? "",
      itemStatus: data.inactive ? "Inactive" : "Active",
    }));
  }, [itemData]);

  // mutation to update item
  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateItem(itemId, payload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["items"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["item", itemId], exact: true });
      alert("Fixed Asset updated successfully!");
    },
    onError: (err: any) => {
      console.error("Failed to update fixed asset:", err);
      alert("Failed to update fixed asset");
    },
  });

  const handleChange = (field: string, value: string | boolean | File | Date | null) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!formData.itemCode) tempErrors.itemCode = "Item Code is required";
    if (!formData.itemName) tempErrors.itemName = "Item Name is required";
    if (!formData.description) tempErrors.description = "Description is required";
    if (!formData.category) tempErrors.category = "Category is required";
    if (!formData.itemTaxType) tempErrors.itemTaxType = "Item Tax Type is required";
    if (!formData.unitOfMeasure) tempErrors.unitOfMeasure = "Unit of Measure is required";
    if (!formData.salesAccount) tempErrors.salesAccount = "Sales Account is required";
    if (!formData.assetAccount) tempErrors.assetAccount = "Asset Account is required";
    if (!formData.depreciationCostAccount) tempErrors.depreciationCostAccount = "Depreciation Cost Account is required";
    if (!formData.depreciationDisposalAccount) tempErrors.depreciationDisposalAccount = "Depreciation/Disposal Account is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validate()) return;
    const payload = {
      stock_id: formData.itemCode,
      category_id: parseInt(formData.category),
      tax_type_id: parseInt(formData.itemTaxType),
      description: formData.itemName,
      long_description: formData.description,
      units: parseInt(formData.unitOfMeasure),
      sales_account: formData.salesAccount,
      inventory_account: formData.assetAccount,
      cogs_account: formData.depreciationCostAccount,
      adjustment_account: formData.depreciationDisposalAccount,
      inactive: formData.itemStatus === "Inactive" ? 1 : 0,
      purchase_cost: 0,
      material_cost: 0,
      labour_cost: 0,
      overhead_cost: 0,
      depreciation_method: formData.depreciationMethod,
      depreciation_rate: parseFloat(formData.baseRate) || 0,
      depreciation_factor: parseFloat(formData.rateMultiplier) || 0,
      depreciation_start: formData.depreciationStart ? formData.depreciationStart.toISOString().split('T')[0] : "2020-10-10",
      depreciation_date: "2020-10-10",
      fa_class_id: formData.fixedAssetClass,
      imageFile: formData.imageFile
    };
    updateMutation.mutate(payload);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleClone = () => {
    const cloned = { ...formData, itemCode: formData.itemCode + "-CLONE" };
    console.log("Cloned Fixed Asset:", cloned);
    alert("Fixed Asset cloned! Please edit before saving.");
    setFormData(cloned);
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"], exact: false });
      alert("Fixed Asset deleted successfully!");
    },
    onError: (err) => {
      console.error("Failed to delete fixed asset:", err);
      alert("Failed to delete fixed asset!");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this fixed asset?")) {
      deleteMutation.mutate();
    }
  };

  // show loading / error for fetch-item
  if (itemLoading) {
    return (
      <Stack alignItems="center" sx={{ p: { xs: 2, md: 3 } }}>
        <Typography>Loading item...</Typography>
      </Stack>
    );
  }
  if (itemError) {
    return (
      <Stack alignItems="center" sx={{ p: { xs: 2, md: 3 } }}>
        <Typography color="error">Failed to load item</Typography>
      </Stack>
    );
  }
  return (
    <Stack alignItems="center" sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          p: theme.spacing(3),
          boxShadow: theme.shadows[2],
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h5" sx={{ mb: theme.spacing(3), textAlign: "center" }}>
          Update Fixed Asset
        </Typography>

        <Grid container spacing={4}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">General</Typography>
              <Divider />
              <TextField
                label="Item Code"
                value={formData.itemCode}
                size="small"
                fullWidth
                error={!!errors.itemCode}
                helperText={errors.itemCode}
                // Make item code non-editable but selectable (readOnly).
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Name"
                value={formData.itemName}
                onChange={(e) => handleChange("itemName", e.target.value)}
                size="small"
                fullWidth
                error={!!errors.itemName}
                helperText={errors.itemName}
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                size="small"
                fullWidth
                error={!!errors.description}
                helperText={errors.description}
              />
              <FormControl size="small" fullWidth error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  name="category"
                  onChange={handleSelectChange} // same as other dropdowns
                >
                  {itemCategories.map((cat) => (
                    <MenuItem key={cat.category_id} value={String(cat.category_id ?? cat.id)}>
                      {cat.description}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.category}</FormHelperText>
              </FormControl>
              <FormControl size="small" fullWidth error={!!errors.itemTaxType}>
                <InputLabel>Item Tax Type</InputLabel>
                <Select
                  name="itemTaxType"
                  value={formData.itemTaxType}
                  onChange={handleSelectChange}
                  label="Item Tax Type"
                >
                  {itemTaxTypes.map((type) => (
                    <MenuItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.itemTaxType}</FormHelperText>
              </FormControl>
              <FormControl size="small" fullWidth error={!!errors.unitOfMeasure}>
                <InputLabel>Unit of Measure</InputLabel>
                <Select
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleSelectChange}
                  label="Unit of Measure"
                >
                  {unitsOfMeasure.map((unit) => (
                    <MenuItem key={unit.id} value={String(unit.id)}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.unitOfMeasure}</FormHelperText>
              </FormControl>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Depreciation</Typography>
              <Divider />

              <FormControl size="small" fullWidth>
                <InputLabel>Fixed Asset Class</InputLabel>
                <Select
                  name="fixedAssetClass"
                  value={formData.fixedAssetClass}
                  onChange={handleSelectChange}
                  label="Fixed Asset Class"
                >
                  <MenuItem value="tangible">Tangible</MenuItem>
                  <MenuItem value="intangible">Intangible</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Depreciation Method</InputLabel>
                <Select
                  name="depreciationMethod"
                  value={formData.depreciationMethod}
                  onChange={handleSelectChange}
                  label="Depreciation Method"
                >
                  <MenuItem value="straight-line">Straight Line</MenuItem>
                  <MenuItem value="declining-balance">Declining Balance</MenuItem>
                  <MenuItem value="units-of-production">Units of Production</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Base Rate"
                value={formData.baseRate}
                onChange={(e) => handleChange("baseRate", e.target.value)}
                size="small"
                fullWidth
                type="number"
              />

              <TextField
                label="Rate Multiplier"
                value={formData.rateMultiplier}
                onChange={(e) => handleChange("rateMultiplier", e.target.value)}
                size="small"
                fullWidth
                type="number"
              />

              <DatePickerComponent
                label="Depreciation Start"
                value={formData.depreciationStart}
                onChange={(date) => handleChange("depreciationStart", date)}
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Dimension</Typography>
              <Divider />

              <FormControl size="small" fullWidth>
                <InputLabel>Dimension</InputLabel>
                <Select
                  name="dimension"
                  value={formData.dimension}
                  onChange={handleSelectChange}
                  label="Dimension"
                >
                  <MenuItem value="dimension1">Dimension 1</MenuItem>
                  <MenuItem value="dimension2">Dimension 2</MenuItem>
                  <MenuItem value="dimension3">Dimension 3</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* GL Accounts */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <Stack spacing={2}>
                <Typography variant="subtitle1">GL Account</Typography>
                <Divider />
                {/* Sales Account */}
                <FormControl size="small" fullWidth error={!!errors.salesAccount}>
                  <InputLabel>Sales Account</InputLabel>
                  <Select
                    name="salesAccount"
                    value={formData.salesAccount}
                    onChange={handleSelectChange}
                    label="Sales Account"
                  >
                    {Object.entries(
                      chartMasters.reduce((acc: any, item: any) => {
                        const type = item.account_type || "Unknown";
                        if (!acc[type]) acc[type] = [];
                        acc[type].push(item);
                        return acc;
                      }, {})
                    ).flatMap(([typeKey, accounts]: any) => {
                      const typeText = accountTypeMap[Number(typeKey)] || "Unknown";
                      return [
                        <ListSubheader key={`header-${typeKey}`}>
                          {typeText}
                        </ListSubheader>,
                        ...accounts.map((acc: any) => (
                          <MenuItem
                            key={acc.account_code}
                            value={acc.account_code}
                          >
                            {acc.account_code} - {acc.account_name}
                          </MenuItem>
                        )),
                      ];
                    })}
                  </Select>
                  <FormHelperText>{errors.salesAccount || " "}</FormHelperText>
                </FormControl>

                <FormControl size="small" fullWidth error={!!errors.assetAccount}>
                  <InputLabel>Asset Account</InputLabel>
                  <Select
                    name="assetAccount"
                    value={formData.assetAccount}
                    onChange={handleSelectChange}
                    label="Asset Account"
                  >
                    {(() => {
                      const groupedAccounts: { [key: string]: any[] } = {};
                      chartMasters.forEach((acc) => {
                        const type = acc.account_type || "Unknown";
                        if (!groupedAccounts[type]) groupedAccounts[type] = [];
                        groupedAccounts[type].push(acc);
                      });

                      return Object.entries(groupedAccounts).flatMap(([typeKey, accounts]) => {
                        const typeText = accountTypeMap[Number(typeKey)] || "Unknown";
                        return [
                          <ListSubheader key={`header-${typeKey}`}>{typeText}</ListSubheader>,
                          ...accounts.map((acc) => (
                            <MenuItem key={acc.account_code} value={acc.account_code}>
                              <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                                {acc.account_code} - {acc.account_name}
                              </Stack>
                            </MenuItem>
                          )),
                        ];
                      });
                    })()}
                  </Select>
                  <FormHelperText>{errors.assetAccount || " "}</FormHelperText>
                </FormControl>

                <FormControl size="small" fullWidth error={!!errors.depreciationCostAccount}>
                  <InputLabel>Depreciation Cost Account</InputLabel>
                  <Select
                    name="depreciationCostAccount"
                    value={formData.depreciationCostAccount}
                    onChange={handleSelectChange}
                    label="Depreciation Cost Account"
                  >
                    {(() => {
                      const groupedAccounts: { [key: string]: any[] } = {};
                      chartMasters.forEach((acc) => {
                        const type = acc.account_type || "Unknown";
                        if (!groupedAccounts[type]) groupedAccounts[type] = [];
                        groupedAccounts[type].push(acc);
                      });

                      return Object.entries(groupedAccounts).flatMap(([typeKey, accounts]) => {
                        const typeText = accountTypeMap[Number(typeKey)] || "Unknown";
                        return [
                          <ListSubheader key={`header-${typeKey}`}>{typeText}</ListSubheader>,
                          ...accounts.map((acc) => (
                            <MenuItem key={acc.account_code} value={acc.account_code}>
                              <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                                {acc.account_code} - {acc.account_name}
                              </Stack>
                            </MenuItem>
                          )),
                        ];
                      });
                    })()}
                  </Select>
                  <FormHelperText>{errors.depreciationCostAccount || " "}</FormHelperText>
                </FormControl>

                <FormControl size="small" fullWidth error={!!errors.depreciationDisposalAccount}>
                  <InputLabel>Depreciation/Disposal Account</InputLabel>
                  <Select
                    name="depreciationDisposalAccount"
                    value={formData.depreciationDisposalAccount}
                    onChange={handleSelectChange}
                    label="Depreciation/Disposal Account"
                  >
                    {(() => {
                      const groupedAccounts: { [key: string]: any[] } = {};
                      chartMasters.forEach((acc) => {
                        const type = acc.account_type || "Unknown";
                        if (!groupedAccounts[type]) groupedAccounts[type] = [];
                        groupedAccounts[type].push(acc);
                      });

                      return Object.entries(groupedAccounts).flatMap(([typeKey, accounts]) => {
                        const typeText = accountTypeMap[Number(typeKey)] || "Unknown";
                        return [
                          <ListSubheader key={`header-${typeKey}`}>{typeText}</ListSubheader>,
                          ...accounts.map((acc) => (
                            <MenuItem key={acc.account_code} value={acc.account_code}>
                              <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                                {acc.account_code} - {acc.account_name}
                              </Stack>
                            </MenuItem>
                          )),
                        ];
                      });
                    })()}
                  </Select>
                  <FormHelperText>{errors.depreciationDisposalAccount || " "}</FormHelperText>
                </FormControl>


              </Stack>


              {/* Other */}

              <Stack spacing={2}>
                <Typography variant="subtitle1">Other</Typography>
                <Divider />
                <Button
                  variant="outlined"
                  component="label"
                >
                  Upload Image (.jpg)
                  <input
                    type="file"
                    hidden
                    accept=".jpg"
                    onChange={(e) => handleChange("imageFile", e.target.files ? e.target.files[0] : null)}
                  />
                </Button>
                <FormControl size="small" fullWidth>
                  <InputLabel>Item Status</InputLabel>
                  <Select
                    value={formData.itemStatus}
                    onChange={(e) => handleChange("itemStatus", e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Values */}
              <Stack spacing={2}>
                <Typography variant="subtitle1">Values</Typography>
                <Divider />
                <Typography>Initial Value:</Typography>
                <Typography>Depreciations:</Typography>
                <Typography>Current Value:</Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: theme.spacing(4),
            flexDirection: { xs: "column", sm: "row" },
            gap: theme.spacing(2),
          }}
        >
          <Button variant="outlined" sx={{ width: '140px' }} onClick={() => window.history.back()}>
            Back
          </Button>
          <Button variant="contained" color="primary" sx={{ width: '140px' }} onClick={handleUpdate}>
            Update Fixed Asset
          </Button>
          <Button variant="contained" color="secondary" sx={{ width: '140px' }} onClick={handleClone}>
            Clone Fixed Asset
          </Button>
          <Button variant="outlined" color="error" sx={{ width: '140px' }} onClick={handleDelete}>
            Delete Fixed Asset
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
