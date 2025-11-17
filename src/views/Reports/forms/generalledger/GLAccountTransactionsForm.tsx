import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  ListSubheader,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getTransTypes } from "../../../../api/Reflines/TransTypesApi";

interface GLAccountTransactionFormData {
  startDate: string;
  endDate: string;
  fromAccount: string;
  toAccount: string;
  dimension: string;
  comments: string;
  orientation: string;
  destination: string;
}

export default function GLAccountTransactionsForm() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<GLAccountTransactionFormData>({
    startDate: "",
    endDate: "",
    fromAccount: "",
    toAccount: "",
    dimension: "",
    comments: "",
    orientation: "Portrait",
    destination: "Print",
  });

  const [errors, setErrors] = useState<Partial<GLAccountTransactionFormData>>({});
  const [loading, setLoading] = useState(false);
  const [openFromAccountSelect, setOpenFromAccountSelect] = useState(false);
  const [openToAccountSelect, setOpenToAccountSelect] = useState(false);
  const [dimensions] = useState<any[]>([
    { id: '1', name: 'Dimension 1' },
    { id: '2', name: 'Dimension 2' },
  ]);

  // Fetch GL accounts for Account dropdowns
  const { data: chartMasters = [] } = useQuery({
    queryKey: ["chartMasters"],
    queryFn: () => import("../../../../api/GLAccounts/ChartMasterApi").then(m => m.getChartMasters()),
  });

  // Set default values when data loads
  useEffect(() => {
    if (chartMasters.length > 0 && dimensions.length > 0 && !formData.fromAccount) {
      setFormData(prev => ({
        ...prev,
        fromAccount: String(chartMasters[0].account_code),
        toAccount: String(chartMasters[0].account_code),
        dimension: String(dimensions[0]?.id || ""),
      }));
    }
  }, [chartMasters, dimensions]);

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

  // Fetch transaction types (keeping this for now, might be removed later)
  const { data: transTypes = [] } = useQuery({
    queryKey: ["transTypes"],
    queryFn: getTransTypes,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Simple validation
  const validate = () => {
    let newErrors: Partial<GLAccountTransactionFormData> = {};

    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;

    console.log("GENERATING REPORT WITH DATA:", formData);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper
        sx={{
          p: 3,
          maxWidth: "650px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}
        >
          GL Account Transaction Report
        </Typography>

        <Stack spacing={2}>
          {/* Start Date */}
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            error={!!errors.startDate}
            helperText={errors.startDate}
          />

          {/* End Date */}
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            error={!!errors.endDate}
            helperText={errors.endDate}
          />

          {/* From Account dropdown */}
          <TextField
            select
            fullWidth
            label="From Account"
            value={formData.fromAccount}
            size="small"
            onChange={(e) => {
              setFormData({ ...formData, fromAccount: e.target.value });
              setOpenFromAccountSelect(false);
            }}
            SelectProps={{
              open: openFromAccountSelect,
              onOpen: () => setOpenFromAccountSelect(true),
              onClose: () => setOpenFromAccountSelect(false),
              renderValue: (value: any) => {
                const found = (chartMasters as any[]).find((c: any) => String(c.account_code) === String(value));
                return found ? `${found.account_name} - ${found.account_code}` : String(value);
              },
            }}
          >
            {Object.entries(groupedChartMasters).map(([typeText, accounts]) => (
              <React.Fragment key={typeText}>
                <ListSubheader>{typeText}</ListSubheader>
                {accounts.map((acc: any) => (
                  <MenuItem
                    key={String(acc.account_code)}
                    value={String(acc.account_code)}
                    onClick={() => {
                      setFormData({ ...formData, fromAccount: String(acc.account_code) });
                      setOpenFromAccountSelect(false);
                    }}
                  >
                    {acc.account_name} {acc.account_code ? ` - ${acc.account_code}` : ""}
                  </MenuItem>
                ))}
              </React.Fragment>
            ))}
          </TextField>

          {/* To Account dropdown */}
          <TextField
            select
            fullWidth
            label="To Account"
            value={formData.toAccount}
            size="small"
            onChange={(e) => {
              setFormData({ ...formData, toAccount: e.target.value });
              setOpenToAccountSelect(false);
            }}
            SelectProps={{
              open: openToAccountSelect,
              onOpen: () => setOpenToAccountSelect(true),
              onClose: () => setOpenToAccountSelect(false),
              renderValue: (value: any) => {
                const found = (chartMasters as any[]).find((c: any) => String(c.account_code) === String(value));
                return found ? `${found.account_name} - ${found.account_code}` : String(value);
              },
            }}
          >
            {Object.entries(groupedChartMasters).map(([typeText, accounts]) => (
              <React.Fragment key={typeText}>
                <ListSubheader>{typeText}</ListSubheader>
                {accounts.map((acc: any) => (
                  <MenuItem
                    key={String(acc.account_code)}
                    value={String(acc.account_code)}
                    onClick={() => {
                      setFormData({ ...formData, toAccount: String(acc.account_code) });
                      setOpenToAccountSelect(false);
                    }}
                  >
                    {acc.account_name} {acc.account_code ? ` - ${acc.account_code}` : ""}
                  </MenuItem>
                ))}
              </React.Fragment>
            ))}
          </TextField>

          {/* Dimension dropdown */}
          <TextField
            label="Dimension"
            name="dimension"
            size="small"
            fullWidth
            select
            value={formData.dimension}
            onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
          >
            <MenuItem value="no">No Dimension Filter</MenuItem>
            {dimensions.map((dimension) => (
              <MenuItem key={dimension.id} value={dimension.id}>
                {dimension.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Comments */}
          <TextField
            label="Comments"
            name="comments"
            size="small"
            fullWidth
            multiline
            minRows={3}
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          />

          {/* Orientation */}
          <TextField
            label="Orientation"
            name="orientation"
            size="small"
            fullWidth
            select
            value={formData.orientation}
            onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
          >
            <MenuItem value="Portrait">Portrait</MenuItem>
            <MenuItem value="Landscape">Landscape</MenuItem>
          </TextField>

          {/* Destination */}
          <TextField
            label="Destination"
            name="destination"
            size="small"
            fullWidth
            select
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          >
            <MenuItem value="Print">PDF/Printer</MenuItem>
            <MenuItem value="Excel">Excel</MenuItem>
          </TextField>
        </Stack>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button onClick={() => window.history.back()}>Back</Button>

          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleGenerate}
          >
            Generate
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
