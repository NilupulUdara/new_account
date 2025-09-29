import React, { useState } from "react";
import {
    Box,
    Stack,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Paper,
    FormHelperText,
    SelectChangeEvent,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import theme from "../../../../theme";

interface GlAccountFormData {
    accountCode: string;
    accountCode2: string;
    accountName: string;
    accountGroup: string;
    accountTags: string;
    accountStatus: string;
}

export default function AddGlAccount() {
    const [formData, setFormData] = useState<GlAccountFormData>({
        accountCode: "",
        accountCode2: "",
        accountName: "",
        accountGroup: "",
        accountTags: "",
        accountStatus: "",
    });

    const [errors, setErrors] = useState<Partial<GlAccountFormData>>({});
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
    const navigate = useNavigate();
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validate = () => {
        const newErrors: Partial<GlAccountFormData> = {};
        if (!formData.accountCode) newErrors.accountCode = "Account Code is required";
        if (!formData.accountCode2) newErrors.accountCode2 = "Account Code 2 is required";
        if (!formData.accountName) newErrors.accountName = "Account Name is required";
        if (!formData.accountGroup) newErrors.accountGroup = "Account Group is required";
        if (!formData.accountTags) newErrors.accountTags = "Account Tags are required";
        if (!formData.accountStatus) newErrors.accountStatus = "Account Status is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            console.log("GL Account Submitted:", formData);
            alert("GL Account added successfully!");
            setFormData({
                accountCode: "",
                accountCode2: "",
                accountName: "",
                accountGroup: "",
                accountTags: "",
                accountStatus: "",
            });
        }
    };

    return (
        <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
            <Paper
                sx={{
                    p: theme.spacing(3),
                    maxWidth: "600px",
                    width: "100%",
                    boxShadow: 2,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
                    Add GL Account
                </Typography>

                <Stack spacing={2}>
                    <TextField
                        label="Account Code"
                        name="accountCode"
                        size="small"
                        fullWidth
                        value={formData.accountCode}
                        onChange={handleInputChange}
                        error={!!errors.accountCode}
                        helperText={errors.accountCode}
                    />

                    <TextField
                        label="Account Code 2"
                        name="accountCode2"
                        size="small"
                        fullWidth
                        value={formData.accountCode2}
                        onChange={handleInputChange}
                        error={!!errors.accountCode2}
                        helperText={errors.accountCode2}
                    />

                    <TextField
                        label="Account Name"
                        name="accountName"
                        size="small"
                        fullWidth
                        value={formData.accountName}
                        onChange={handleInputChange}
                        error={!!errors.accountName}
                        helperText={errors.accountName}
                    />

                    <TextField
                        label="Account Group"
                        name="accountGroup"
                        size="small"
                        fullWidth
                        value={formData.accountGroup}
                        onChange={handleInputChange}
                        error={!!errors.accountGroup}
                        helperText={errors.accountGroup}
                    />

                    <TextField
                        label="Account Tags"
                        name="accountTags"
                        size="small"
                        fullWidth
                        value={formData.accountTags}
                        onChange={handleInputChange}
                        error={!!errors.accountTags}
                        helperText={errors.accountTags}
                    />

                    <FormControl size="small" fullWidth error={!!errors.accountStatus}>
                        <InputLabel>Account Status</InputLabel>
                        <Select
                            name="accountStatus"
                            value={formData.accountStatus}
                            onChange={handleSelectChange}
                            label="Account Status"
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                        <FormHelperText>{errors.accountStatus}</FormHelperText>
                    </FormControl>
                </Stack>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 3,
                        flexDirection: isMobile ? "column" : "row",
                        gap: isMobile ? 2 : 0,
                    }}
                >
                    <Button onClick={() => navigate("/bankingandgeneralledger/maintenance/")}>Back</Button>

                    <Button
                        variant="contained"
                        fullWidth={isMobile}
                        sx={{ backgroundColor: "var(--pallet-blue)" }}
                        onClick={handleSubmit}
                    >
                        Add GL Account
                    </Button>
                </Box>
            </Paper>
        </Stack>
    );
}
