import React, { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";

interface DimensionFormData {
  dimensionReference: string;
  name: string;
  type: string;
  startDate: string;
  dateRequiredBy: string;
  tags: string;
  memo: string;
}

function DimensionEntry() {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<DimensionFormData>({
    dimensionReference: "",
    name: "",
    type: "",
    startDate: "",
    dateRequiredBy: "",
    tags: "",
    memo: "",
  });

  const { data: tags = [] } = useQuery({ queryKey: ["dimensionTags"], queryFn: getTags });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Dimension Entry form data:", formData);
    // TODO: Submit form data
    navigate("/dimension/transactions/dimension-entry/success", { state: { reference: formData.dimensionReference } });
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Dimension Entry" },
  ];

  return (
    <Stack>
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          marginY: 2,
          borderRadius: 1,
          overflowX: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <PageTitle title="Dimension Entry" />
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

      {/* Form */}
      <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
        <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Dimension Reference"
              name="dimensionReference"
              size="small"
              fullWidth
              value={formData.dimensionReference}
              onChange={handleInputChange}
            />

            <TextField
              label="Name"
              name="name"
              size="small"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select name="type" value={formData.type} onChange={handleSelectChange} label="Type">
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              size="small"
              fullWidth
              value={formData.startDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Date required by"
              name="dateRequiredBy"
              type="date"
              size="small"
              fullWidth
              value={formData.dateRequiredBy}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Tags</InputLabel>
              <Select name="tags" value={formData.tags} onChange={handleSelectChange} label="Tags">
                {tags.map((tag: any) => (
                  <MenuItem key={tag.id} value={tag.id}>{tag.tagName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Memo"
              name="memo"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={formData.memo}
              onChange={handleInputChange}
            />
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: "var(--pallet-blue)" }}
              onClick={handleSubmit}
            >
              Add New
            </Button>
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}

export default DimensionEntry;
