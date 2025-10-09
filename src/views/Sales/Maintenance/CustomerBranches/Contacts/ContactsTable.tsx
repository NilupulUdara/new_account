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
import {
  getCustomerContacts,
  deleteCustomerContact,
} from "../../../../../api/Customer/CustomerContactApi";
import DeleteConfirmationModal from "../../../../../components/DeleteConfirmationModal";
import ErrorModal from "../../../../../components/ErrorModal";

interface ContacsProps {
  customerId?: string | number;
}

export default function ContactsTable({ customerId }: ContacsProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // --- Delete Modal States ---
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getCustomerContacts(customerId);
        const mappedData = data.map((item: any) => ({
          id: item.id,
          reference: item.ref,
          fullName: item.name,
          phone: item.phone,
          secPhone: item.phone2,
          fax: item.fax,
          email: item.email,
        }));
        setContacts(mappedData);
      } catch (error: any) {
        console.error("Failed to load contacts:", error);
        setErrorMessage("Failed to load contacts. Please try again.");
        setErrorOpen(true);
      }
    };
    fetchContacts();
  }, [customerId]);

  // Filter by inactive & search
  const filteredData = useMemo(() => {
    let data = showInactive ? contacts : contacts.filter((c) => !c.inactive);

    if (searchQuery.trim() !== "") {
      const lower = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
          c.reference?.toLowerCase().includes(lower) ||
          c.fullName?.toLowerCase().includes(lower) ||
          c.phone?.toLowerCase().includes(lower) ||
          c.secPhone?.toLowerCase().includes(lower) ||
          c.fax?.toLowerCase().includes(lower) ||
          c.email?.toLowerCase().includes(lower)
      );
    }

    return data;
  }, [contacts, showInactive, searchQuery]);

  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) return filteredData;
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [page, rowsPerPage, filteredData]);

  const handleChangePage = (event: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Delete function with modal confirmation
  const handleDelete = async () => {
    if (!selectedContactId) return;
    try {
      await deleteCustomerContact(selectedContactId);
      setContacts((prev) => prev.filter((c) => c.id !== selectedContactId));
    } catch (error: any) {
      console.error("Delete failed:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to delete contact. Please try again."
      );
      setErrorOpen(true);
    } finally {
      setOpenDeleteModal(false);
      setSelectedContactId(null);
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Contacts" },
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
          <PageTitle title="Contacts" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              navigate("/sales/maintenance/customer-branches/add-customer-branches-contacts")
            }
          >
            Add Contact
          </Button>
        </Stack>
      </Box>

      {/* Checkbox + Search */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
          }
          label="Show Also Inactive"
        />
        <Box sx={{ width: isMobile ? "100%" : "300px" }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search Contacts"
          />
        </Box>
      </Stack>

      {/* Table */}
      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
        >
          <Table aria-label="contacts table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Reference</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Sec Phone</TableCell>
                <TableCell>Fax</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((contact) => (
                  <TableRow key={contact.id} hover>
                    <TableCell>{contact.reference}</TableCell>
                    <TableCell>{contact.fullName}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.secPhone}</TableCell>
                    <TableCell>{contact.fax}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate(
                              `/sales/maintenance/customer-branches/update-customer-branches-contacts/${contact.id}`
                            )
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setSelectedContactId(contact.id);
                            setOpenDeleteModal(true);
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={7}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={openDeleteModal}
        title="Delete Contact"
        content="Are you sure you want to delete this contact? This action cannot be undone."
        handleClose={() => setOpenDeleteModal(false)}
        handleReject={() => setSelectedContactId(null)}
        deleteFunc={handleDelete}
        onSuccess={() => console.log("Contact deleted successfully!")}
      />

      {/* Error Modal */}
      <ErrorModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
      />
    </Stack>
  );
}
