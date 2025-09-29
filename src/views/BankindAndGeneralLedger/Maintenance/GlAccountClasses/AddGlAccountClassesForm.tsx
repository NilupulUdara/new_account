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
    FormHelperText,
    Button,
    Paper,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";

interface GlAccountClassData {
    id: string;
    className: string;
    classType: string;
}

export default function AddGlAccountClassesForm() {
    const [formData, setFormData] = useState<GlAccountClassData>({
        id: "",
        className: "",
        classType: "",
    });

    const [errors, setErrors] = useState<Partial<GlAccountClassData>>({});
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const handleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validate = () => {
        const newErrors: Partial<GlAccountClassData> = {};
        if (!formData.id) newErrors.id = "Class ID is required";
        if (!formData.className) newErrors.className = "Class name is required";
        if (!formData.classType) newErrors.classType = "Select class type";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            console.log("Submitted GL Account Class:", formData);
            alert("GL Account Class added successfully!");
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
                    Add GL Account Classes
                </Typography>

                <Stack spacing={2}>
                    <TextField
                        label="ID"
                        name="id"
                        size="small"
                        fullWidth
                        value={formData.id}
                        onChange={handleInputChange}
                        error={!!errors.id}
                        helperText={errors.id || " "}
                    />

                    <TextField
                        label="Class Name"
                        name="className"
                        size="small"
                        fullWidth
                        value={formData.className}
                        onChange={handleInputChange}
                        error={!!errors.className}
                        helperText={errors.className || " "}
                    />

                    <FormControl size="small" fullWidth error={!!errors.classType}>
                        <InputLabel>Class Type</InputLabel>
                        <Select
                            name="subGroup"
                            value={formData.classType}
                            onChange={handleSelectChange}
                            label="Sub Group"
                        >
                            <MenuItem value="Assets">Assets</MenuItem>
                            <MenuItem value="Liabilities">Liabilities</MenuItem>
                            <MenuItem value="Income">Income</MenuItem>
                            <MenuItem value="Costs">Costs</MenuItem>
                        </Select>
                        <FormHelperText>{errors.classType || " "}</FormHelperText>
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
                    <Button onClick={() => window.history.back()}>Back</Button>

                    <Button
                        variant="contained"
                        fullWidth={isMobile}
                        sx={{ backgroundColor: "var(--pallet-blue)" }}
                        onClick={handleSubmit}
                    >
                        Add New
                    </Button>
                </Box>
            </Paper>
        </Stack>
    );
}
