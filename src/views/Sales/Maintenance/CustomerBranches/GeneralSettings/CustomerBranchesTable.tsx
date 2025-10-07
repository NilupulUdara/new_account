import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Box,
  Button,
  Stack,
  TableFooter,
  TablePagination,
  Typography,
  useMediaQuery,
  Theme,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../../components/BreadCrumb";
import PageTitle from "../../../../../components/PageTitle";
import theme from "../../../../../theme";
import SearchBar from "../../../../../components/SearchBar";
import { getBranches, deleteBranch } from "../../../../../api/CustomerBranch/CustomerBranchApi";

interface CustomerBranchesTableProps {
  customerId: string | number;
}

export interface CustomerBranch {
  branch_code: number;
  debtor_no: number;
  br_name: string;
  branch_ref: string;
  br_address: string;
  sales_area?: number;
  sales_person: number;
  inventory_location: string;
  tax_group?: number;
  sales_account: string;
  sales_discount_account: string;
  receivables_account: string;
  payment_discount_account: string;
  shipping_company: number;
  br_post_address: string;
  sales_group: number;
  notes: string;
  bank_account?: string;
  inactive: boolean;
}

interface MappedBranch {
  id: number;
  shortName: string;
  name: string;
  contact: string;
  salesPerson: string;
  area: string;
  phone: string;
  fax: string;
  email: string;
  taxGroup: string;
  inactive: boolean;
}

export default function CustomerBranchesTable({ customerId }: CustomerBranchesTableProps) {
  const [branches, setBranches] = useState<MappedBranch[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data: CustomerBranch[] = await getBranches(customerId);
        // filter branches by selected customer
        const filtered = data.filter(b => b.debtor_no === customerId);
        // map only the filtered branches
        const mapped: MappedBranch[] = filtered.map((b) => ({
          id: b.branch_code,
          shortName: b.branch_ref,
          name: b.br_name,
          contact: "",
          salesPerson: String(b.sales_person),
          area: String(b.sales_area || ""),
          phone: "",
          fax: "",
          email: "",
          taxGroup: String(b.tax_group || ""),
          inactive: b.inactive,
        }));
        setBranches(mapped);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    };

    if (customerId) loadBranches();
  }, [customerId]);


  const filteredData = useMemo(() => {
    let data = showInactive ? branches : branches.filter((b) => !b.inactive);
    if (searchQuery.trim() !== "") {
      const lower = searchQuery.toLowerCase();
      data = data.filter(
        (b) =>
          b.shortName.toLowerCase().includes(lower) ||
          b.name.toLowerCase().includes(lower) ||
          b.contact.toLowerCase().includes(lower) ||
          b.salesPerson.toLowerCase().includes(lower) ||
          b.area.toLowerCase().includes(lower) ||
          b.phone.toLowerCase().includes(lower) ||
          b.fax.toLowerCase().includes(lower) ||
          b.email.toLowerCase().includes(lower) ||
          b.taxGroup.toLowerCase().includes(lower)
      );
    }
    return data;
  }, [branches, showInactive, searchQuery]);

  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) return filteredData;
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [page, rowsPerPage, filteredData]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      await deleteBranch(id);
      setBranches((prev) => prev.filter((b) => b.id !== id));
      alert("Branch deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete branch");
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Branches" },
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
          <PageTitle title="Customer Branches" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/sales/maintenance/customer-branches/add-general-settings/${customerId}`)}
          >
            Add Branch
          </Button>
        </Stack>
      </Box>

      {/* Checkbox & Search */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}
      >
        <FormControlLabel
          control={
            <Checkbox checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          }
          label="Show Also Inactive"
        />
        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search Branches" />
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
          <Table aria-label="branches table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Short Name</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Sales Person</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Phone No</TableCell>
                <TableCell>Fax No</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tax Group</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((branch) => (
                  <TableRow key={branch.id} hover>
                    <TableCell>{branch.shortName}</TableCell>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell>{branch.contact}</TableCell>
                    <TableCell>{branch.salesPerson}</TableCell>
                    <TableCell>{branch.area}</TableCell>
                    <TableCell>{branch.phone}</TableCell>
                    <TableCell>{branch.fax}</TableCell>
                    <TableCell>{branch.email}</TableCell>
                    <TableCell>{branch.taxGroup}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate(`/sales/maintenance/customer-branches/update-general-settings/${branch.id}`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(branch.id)}
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
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  showFirstButton
                  showLastButton
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
}
