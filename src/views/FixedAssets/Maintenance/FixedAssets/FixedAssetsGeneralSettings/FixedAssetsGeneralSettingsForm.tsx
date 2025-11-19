import React, { useEffect, useState } from "react";
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
  Grid,
  ListSubheader,
} from "@mui/material";
import theme from "../../../../../theme";
import { getItemTaxTypes } from "../../../../../api/ItemTaxType/ItemTaxTypeApi";
import { getChartMasters } from "../../../../../api/GLAccounts/ChartMasterApi";
import { getItemUnits } from "../../../../../api/ItemUnit/ItemUnitApi";
import { getItemCategories } from "../../../../../api/ItemCategories/ItemCategoriesApi";
import { createItem, getItemById, updateItem } from "../../../../../api/Item/ItemApi";
import { getInventoryLocations } from "../../../../../api/InventoryLocation/InventoryLocationApi";
import { createLocStock } from "../../../../../api/LocStock/LocStockApi";
import DatePickerComponent from "../../../../../components/DatePickerComponent";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
interface ItemGeneralSettingProps {
  itemId?: string | number;
}

export default function FixedAssetsGeneralSettingsForm({ itemId }: ItemGeneralSettingProps) {

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    12: "General and Administrative Expenses",
  };

  const [chartMasters, setChartMasters] = useState<any[]>([]);
  const [itemTaxTypes, setItemTaxTypes] = useState<any[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<any[]>([]);
  const [itemCategories, setItemCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleChange = (field: string, value: string | boolean | File | Date | null) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" }); // clear error
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
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

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      stock_id: formData.itemCode, // required
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


    try {
      const res = await createItem(payload); // your API call
      const newStockId = formData.itemCode;

      // Fetch inventory locations and create loc_stock records
      const locations = await getInventoryLocations();
      const locStockPromises = locations.map(location =>
        createLocStock({
          loc_code: location.loc_code,
          stock_id: newStockId,
          reorder_level: 0,
        })
      );
      await Promise.all(locStockPromises);

      alert("Fixed Asset added successfully!");
      console.log("Created:", res);
      queryClient.invalidateQueries({ queryKey: ["items"], exact: false });

      setFormData((prev) => ({
        ...prev,
        itemCode: "",
        itemName: "",
        description: "",
        imageFile: null,
      }));

      navigate("/itemsandinventory/maintenance/items");
    } catch (err) {
      console.error("Failed to create item:", err);
      alert("Failed to add Fixed Asset.");
    }
  };


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
          Fixed Asset Setup
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
                onChange={(e) => handleChange("itemCode", e.target.value)}
                size="small"
                fullWidth
                error={!!errors.itemCode}
                helperText={errors.itemCode}
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
                <FormHelperText>{errors.itemTaxType || " "}</FormHelperText>
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
                <FormControl size="small" fullWidth error={!!errors.salesAccount}>
                  <InputLabel>Sales Account</InputLabel>
                  <Select
                    name="salesAccount"
                    value={formData.salesAccount}
                    onChange={handleSelectChange}
                    label="Sales Account"
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
                                {acc.account_code}- {acc.account_name}
                              </Stack>
                            </MenuItem>
                          )),
                        ];
                      });
                    })()}
                  </Select>
                  <FormHelperText>{errors.salesAccount}</FormHelperText>
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
                  <FormHelperText>{errors.inventoryAccount || " "}</FormHelperText>
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
                  <FormHelperText>{errors.cogsAccount || " "}</FormHelperText>
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
                  <FormHelperText>{errors.inventoryAdjustmentAccount || " "}</FormHelperText>
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
            </Stack>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: theme.spacing(4),
            flexDirection: { xs: "column", sm: "row" },
            gap: theme.spacing(2),
          }}
        >
          <Button variant="outlined" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: theme.palette.primary.main }}
            onClick={handleSubmit}
          >
            Insert New Fixed Asset
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
