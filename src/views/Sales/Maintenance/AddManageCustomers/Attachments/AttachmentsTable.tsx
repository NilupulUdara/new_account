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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../../components/BreadCrumb";
import PageTitle from "../../../../../components/PageTitle";
import theme from "../../../../../theme";
import SearchBar from "../../../../../components/SearchBar";

interface AttachmentsProps {
  customerId?: string | number;
}

// Mock API
const getAttachments = async () => [
  {
    id: 1,
    docTitle: "Invoice 001",
    filename: "invoice001.pdf",
    size: "250KB",
    filetype: "PDF",
    docDate: "2025-09-01",
    inactive: false,
  },
  {
    id: 2,
    docTitle: "Report Q2",
    filename: "report_q2.xlsx",
    size: "1.2MB",
    filetype: "Excel",
    docDate: "2025-08-15",
    inactive: true,
  },
];

export default function AttachmentsTable({ customerId }: AttachmentsProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    getAttachments().then((data) => setAttachments(data));
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    let data = showInactive ? attachments : attachments.filter((a) => !a.inactive);

    if (searchQuery.trim() !== "") {
      const lower = searchQuery.toLowerCase();
      data = data.filter(
        (a) =>
          a.docTitle.toLowerCase().includes(lower) ||
          a.filename.toLowerCase().includes(lower) ||
          a.size.toLowerCase().includes(lower) ||
          a.filetype.toLowerCase().includes(lower) ||
          a.docDate.toLowerCase().includes(lower) ||
          a.id.toString().includes(lower)
      );
    }

    return data;
  }, [attachments, showInactive, searchQuery]);

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

  const handleDelete = (id: number) => {
    alert(`Delete attachment with id: ${id}`);
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Attachments" },
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
          <PageTitle title="Attachments" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/sales/maintenance/add-and-manage-customers/add-attachments")}
          >
            Add Attachment
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/sales/maintenance/add-and-manage-customers")}
          >
            Back
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
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search Attachments"
          />
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}>
          <Table aria-label="attachments table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Doc Title</TableCell>
                <TableCell>Filename</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Filetype</TableCell>
                <TableCell>Doc Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((att) => (
                  <TableRow key={att.id} hover>
                    <TableCell>{att.id}</TableCell>
                    <TableCell>{att.docTitle}</TableCell>
                    <TableCell>{att.filename}</TableCell>
                    <TableCell>{att.size}</TableCell>
                    <TableCell>{att.filetype}</TableCell>
                    <TableCell>{att.docDate}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(
                            "/sales/maintenance/add-and-manage-customers/update-attachments/"
                            // `/sales/update-attachment/${att.id}`
                          )}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(att.id)}
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
    </Stack>
  );
}
