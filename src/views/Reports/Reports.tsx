import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageTitle from "../../components/PageTitle";
import Breadcrumb from "../../components/BreadCrumb";
import { useNavigate } from "react-router-dom";
import { reportClasses } from "./reportClasses"; // <-- your external list

// Dynamic form loader
const formLoader = async (className: string, reportName: string) => {
  return await import(
    `./forms/${className}/${reportName.replace(/ /g, "")}Form.tsx`
  );
};

export default function Reports() {
  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedReport, setSelectedReport] = useState("");
  const [LoadedForm, setLoadedForm] = useState<React.ComponentType | null>(
    null
  );

  // Load form after clicking report
  const handleReportClick = async (report: string) => {
    setSelectedReport(report);
    setLoadedForm(null);

    try {
      const module = await formLoader(
        selectedClass.toLowerCase().replace(/ /g, ""),
        report.replace(/ /g, "")
      );
      setLoadedForm(() => module.default);
    } catch (error) {
      console.error("Form load failed", error);
      setLoadedForm(() => null);
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Reports" },
  ];

  return (
    <Stack spacing={2}>
      {/* Header */}
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
          <PageTitle title="Reports" />
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

      {/* 3-Column Layout */}
      <Grid container spacing={2}>
        {/*  Left Column — Report Classes */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "var(--pallet-dark-blue)",
              }}
            >
              Report Classes
            </Typography>

            <Divider sx={{ mb: 1 }} />

            <List>
              {Object.keys(reportClasses).map((cls) => (
                <ListItemButton
                  key={cls}
                  selected={selectedClass === cls}
                  onClick={() => {
                    setSelectedClass(cls);
                    setSelectedReport("");
                    setLoadedForm(null);
                  }}
                  sx={{
                    borderRadius: 1,
                    "&.Mui-selected": {
                      backgroundColor: "var(--pallet-light-blue)",
                    },
                  }}
                >
                  <ListItemText primary={cls} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/*  Middle Column — Reports for Class */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, minHeight: "450px" }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "var(--pallet-dark-blue)",
              }}
            >
              Reports For Class: {selectedClass || "-"}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {selectedClass ? (
              <List>
                {reportClasses[selectedClass].map((report) => (
                  <ListItemButton
                    key={report}
                    selected={selectedReport === report}
                    onClick={() => handleReportClick(report)}
                    sx={{
                      borderRadius: 1,
                      "&.Mui-selected": {
                        backgroundColor: "var(--pallet-light-blue)",
                      },
                    }}
                  >
                    <ListItemText primary={report} />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                Select a report class to view reports.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/*  Right Column — Loaded Dynamic Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, minHeight: "450px" }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "var(--pallet-dark-blue)",
              }}
            >
              {selectedReport || "Report Form"}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {LoadedForm ? (
              <LoadedForm />
            ) : selectedReport ? (
              <Typography color="text.secondary">
                Loading form for "{selectedReport}"...
              </Typography>
            ) : (
              <Typography color="text.secondary">
                Select a report to load its form.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
