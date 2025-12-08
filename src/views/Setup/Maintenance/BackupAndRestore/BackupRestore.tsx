import React, { useState } from "react";
import {
    Box,
    Stack,
    Typography,
    TextField,
    Button,
    Divider,
    Grid,
    MenuItem,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
} from "@mui/material";
import theme from "../../../../theme";

export default function BackupRestore() {
    const [formData, setFormData] = useState({
        comments: "",
        compression: "No",
        file: null as File | null,
    });

    const handleChange = (field: string, value: string | File | null) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            handleChange("file", event.target.files[0]);
        }
    };

    const handleCreateBackup = () => {
        console.log(`Create backup requested`, { comments: formData.comments, compression: formData.compression });
    };

    const handleAction = (action: string, id?: number | null) => {
        console.log(`Action: ${action}`, { id });
        if (action === "Delete Backup" && id != null) {
            setBackups((prev) => prev.filter((b) => b.id !== id));
        }
        // other actions can be implemented here (view/download/restore)
    };

    const [securitySetting, setSecuritySetting] = useState("Protect Security Settings");
    const [backups, setBackups] = useState<Array<any>>([
        { id: 1, name: "backup_2025-12-08.sql", size: "2.1 MB", createdAt: "2025-12-08 10:12" },
        { id: 2, name: "backup_2025-12-01.sql.gz", size: "800 KB", createdAt: "2025-12-01 09:05" },
    ]);
    const [selectedBackupId, setSelectedBackupId] = useState<number | null>(null);

    return (
        <Stack alignItems="center" sx={{ p: { xs: 2, md: 3 } }}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "900px",
                    p: theme.spacing(3),
                    boxShadow: theme.shadows[2],
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{ mb: theme.spacing(3), textAlign: "center" }}
                >
                    Backup & Restore Database
                </Typography>

                <Grid container spacing={4}>
                    {/* Create Backup Section */}
                    <Grid item xs={12}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Create Backup</Typography>
                            <Divider />

                            <TextField
                                label="Comments"
                                value={formData.comments}
                                onChange={(e) => handleChange("comments", e.target.value)}
                                size="small"
                                fullWidth
                            />

                            <TextField
                                select
                                label="Compression"
                                value={formData.compression}
                                onChange={(e) => handleChange("compression", e.target.value)}
                                size="small"
                                fullWidth
                            >
                                <MenuItem value={"No"}>No</MenuItem>
                                <MenuItem value={"zip"}>zip</MenuItem>
                                <MenuItem value={"gzip"}>gzip</MenuItem>
                            </TextField>

                            <Button
                                variant="contained"
                                sx={{ backgroundColor: theme.palette.primary.main }}
                                onClick={handleCreateBackup}
                            >
                                Create Backup
                            </Button>
                        </Stack>
                    </Grid>

                    {/* Backup Scripts Maintenance Section */}
                    <Grid item xs={12}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Backup Scripts Maintenance</Typography>
                            <Divider /> 

                            <TableContainer component={Paper} sx={{ mt: 1 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>File Name</TableCell>
                                            <TableCell>Size</TableCell>
                                            <TableCell>Created At</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {backups.map((b) => {
                                            const selected = selectedBackupId === b.id;
                                            return (
                                                <TableRow
                                                    key={b.id}
                                                    onClick={() => setSelectedBackupId(b.id)}
                                                    sx={{ cursor: 'pointer', backgroundColor: selected ? theme.palette.action.selected : 'inherit' }}
                                                >
                                                    <TableCell>{b.name}</TableCell>
                                                    <TableCell>{b.size}</TableCell>
                                                    <TableCell>{b.createdAt}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {backups.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">No backups found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: theme.spacing(1), flexWrap: 'wrap' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleAction("View Backup", selectedBackupId)}
                                        disabled={selectedBackupId == null}
                                    >
                                        View Backup
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleAction("Download Backup", selectedBackupId)}
                                        disabled={selectedBackupId == null}
                                    >
                                        Download Backup
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleAction("Restore Backup", selectedBackupId)}
                                        disabled={selectedBackupId == null}
                                    >
                                        Restore Backup
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleAction("Delete Backup", selectedBackupId)}
                                        disabled={selectedBackupId == null}
                                    >
                                        Delete Backup
                                    </Button>
                                </Box>

                                <Box>
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            value={securitySetting}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSecuritySetting(val);
                                                handleAction(val);
                                            }}
                                        >
                                            <FormControlLabel value="Update Security Settings" control={<Radio />} label="Update Security Settings" />
                                            <FormControlLabel value="Protect Security Settings" control={<Radio />} label="Protect Security Settings" />
                                        </RadioGroup>
                                    </FormControl>
                                </Box>
                            </Stack>

                            {/* File upload */}
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button variant="outlined" component="label">
                                    Choose File
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                <Typography variant="body2">
                                    {formData.file ? formData.file.name : "No file chosen"}
                                </Typography>
                            </Stack>

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
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => window.history.back()}
                                >
                                    Back
                                </Button>

                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: theme.palette.primary.main }}
                                    fullWidth
                                    onClick={() => handleAction("Upload File")}
                                >
                                    Upload File
                                </Button>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Stack>
    );
}
