import React, { useState } from "react";
import {
    Box,
    Stack,
    Typography,
    TextField,
    Button,
    Divider,
    Grid,
} from "@mui/material";
import theme from "../../../../theme";

export default function BackupRestore() {
    const [formData, setFormData] = useState({
        comments: "",
        compression: "",
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
        alert(`Backup created with comments: ${formData.comments}, compression: ${formData.compression}`);
    };

    const handleAction = (action: string) => {
        alert(`${action} clicked`);
    };

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
                    Backup & Restore
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
                                label="Compression"
                                value={formData.compression}
                                onChange={(e) => handleChange("compression", e.target.value)}
                                size="small"
                                fullWidth
                            />

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

                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                <Button
                                    variant="outlined"
                                    onClick={() => handleAction("View Backup")}
                                >
                                    View Backup
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleAction("Download Backup")}
                                >
                                    Download Backup
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleAction("Restore Backup")}
                                >
                                    Restore Backup
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleAction("Delete Backup")}
                                >
                                    Delete Backup
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleAction("Update Security Settings")}
                                >
                                    Update Security Settings
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleAction("Protect Security Settings")}
                                >
                                    Protect Security Settings
                                </Button>
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
