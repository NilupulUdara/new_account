import React, { useMemo, useState } from "react";
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
  TableFooter,
  TablePagination,
  Paper,
  Typography,
  useMediaQuery,
  Theme,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import SearchBar from "../../../../components/SearchBar";
import theme from "../../../../theme";

import { getChartClasses } from "../../../../api/GLAccounts/ChartClassApi";
import { getChartTypes, deleteChartType } from "../../../../api/GLAccounts/ChartTypeApi";

// const getGlAccountGroupsList = async () => [
//   { id: 1, name: "Current Assets", subGroup: "", class: "Assets", status: "Active", },
//   { id: 2, name: "Inventory Assets", subGroup: "", class: "Assets", status: "Active", },
//   { id: 3, name: "Capital Assets", subGroup: "", class: "Assets", status: "Active", },
//   { id: 4, name: "Current Liabilties", subGroup: "", class: "Liabilities", status: "Inactive", },
//   { id: 5, name: "Long Term Liabilties", subGroup: "", class: "Liabilities", status: "Active", },
//   { id: 6, name: "Share Capital", subGroup: "", class: "Liabilities", status: "Active", },
//   { id: 7, name: "Retain Earnings", subGroup: "", class: "Income", status: "Inactive", },
//   { id: 8, name: "Sales Revenue", subGroup: "", class: "Income", status: "Active", },
//   { id: 9, name: "Other Revenue", subGroup: "", class: "Costs", status: "Inactive", },
//   { id: 10, name: "Cost of Goods Sold", subGroup: "", class: "Costs", status: "Active", },

// ];

function GlAccountGroupsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: chartTypesData = [] } = useQuery({
    queryKey: ["chartTypes"],
    queryFn: getChartTypes,
    refetchOnMount: true,
  });

  const { data: chartClassesData = [] } = useQuery({
    queryKey: ["chartClasses"],
    queryFn: getChartClasses,
    refetchOnMount: true,
  });

  // Map class_id -> class_name AND parent -> parent_name
  const mappedGroups = useMemo(() => {
    if (!chartTypesData || !chartClassesData) return [];

    return chartTypesData.map((item: any) => {
      // find class name
      const matchedClass = chartClassesData.find(
        (cc: any) => cc.cid === item.class_id
      );

      // find parent name from same list
      const parentGroup = chartTypesData.find(
        (g: any) => String(g.id) === String(item.parent)
      );

      return {
        ...item,
        className: matchedClass ? matchedClass.class_name : `Unknown (${item.class_id})`,
        parentName: parentGroup ? parentGroup.name : "-", // ✅ map parent id to name
      };
    });
  }, [chartTypesData, chartClassesData]);

  // Filter: search + showInactive toggle
  const filteredGroups = useMemo(() => {
    let filtered = mappedGroups;
    if (!showInactive) filtered = filtered.filter((item: any) => item.inactive === 0);

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item: any) =>
          (item.name ?? "").toLowerCase().includes(lowerQuery) ||
          (item.className ?? "").toLowerCase().includes(lowerQuery) ||
          (item.parent ?? "").toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [mappedGroups, searchQuery, showInactive]);

  const paginatedGroups = useMemo(() => {
    if (rowsPerPage === -1) return filteredGroups;
    return filteredGroups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredGroups, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this GL Account Group?")) {
      try {
        await deleteChartType(id);
        alert("Deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["chartTypes"] });
      } catch (error) {
        alert("Failed to delete GL Account Group!");
      }
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "GL Account Groups" },
  ];

  return (
    <Stack>
      {/* Header */}
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
          <PageTitle title="GL Account Groups" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/bankingandgeneralledger/maintenance/add-gl-account-groups")}
          >
            Add GL Account Groups
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Stack>
      </Box>

      {/* Search + Show Inactive Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          mb: 2,
          width: "100%",
          alignItems: "center",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
          }
          label="Show also Inactive"
        />

        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search..."
          />
        </Box>
      </Box>

      {/* Table */}
      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
        >
          <Table aria-label="gl account groups table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Group ID</TableCell>
                <TableCell>Group Name</TableCell>
                <TableCell>Subgroup of</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedGroups.length > 0 ? (
                paginatedGroups.map((item: any) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.parentName}</TableCell>
                    <TableCell>{item.className}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate(`/bankingandgeneralledger/maintenance/update-gl-account-groups/${item.id}`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={10}
                  count={filteredGroups.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  showFirstButton
                  showLastButton
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
}

export default GlAccountGroupsTable;