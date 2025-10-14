import React, { useEffect, useState } from "react";
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
import { getChartClasses } from "../../../../api/GLAccounts/ChartClassApi";
import { getChartTypes, createChartType } from "../../../../api/GLAccounts/ChartTypeApi";

interface GlAccountGroupData {
    id: string;
    name: string;
    subGroup: string;
    class: string;
}

export default function AddGlAccountGroupsForm() {
    const [formData, setFormData] = useState<GlAccountGroupData>({
        id: "",
        name: "",
        subGroup: "",
        class: "",
    });

    const [chartClasses, setChartClasses] = useState<any[]>([]);
    const [chartTypes, setChartTypes] = useState<any[]>([]);
    const [errors, setErrors] = useState<Partial<GlAccountGroupData>>({});
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

    useEffect(() => {
        const fetchChartClasses = async () => {
            try {
                const data = await getChartClasses();
                setChartClasses(data);
            } catch (error) {
                console.error("Failed to load chart classes:", error);
            }
        };

        fetchChartClasses();
    }, []);

    useEffect(() => {
        const fetchChartTypes = async () => {
            try {
                const data = await getChartTypes();
                setChartTypes(data);
            } catch (error) {
                console.error("Failed to load chart types:", error);
            }
        };

        fetchChartTypes();
    }, []);

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
        const newErrors: Partial<GlAccountGroupData> = {};
        if (!formData.id) newErrors.id = "ID is required";
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.subGroup) newErrors.subGroup = "Sub Group is required";
        if (!formData.class) newErrors.class = "Class is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validate()) {
            try {
                const payload = {
                    id: formData.id,
                    name: formData.name,
                    parent: formData.subGroup === "None" ? null : formData.subGroup,
                    class_id: formData.class,
                };

                const res = await createChartType(payload);
                console.log("Saved GL Account Group:", res);

                alert("GL Account Group added successfully!");
                setFormData({ id: "", name: "", subGroup: "", class: "" }); // clear form

            } catch (error: any) {
                console.error("Error saving GL Account Group:", error);
                alert("Failed to save GL Account Group. Please try again.");
            }
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
                    Add GL Account Groups
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
                        label="Name"
                        name="name"
                        size="small"
                        fullWidth
                        value={formData.name}
                        onChange={handleInputChange}
                        error={!!errors.name}
                        helperText={errors.name || " "}
                    />

                    <FormControl size="small" fullWidth error={!!errors.subGroup}>
                        <InputLabel>Sub Group of</InputLabel>
                        <Select
                            name="subGroup"
                            value={formData.subGroup}
                            onChange={handleSelectChange}
                            label="Sub Group of"
                        >
                            <MenuItem value="None">None</MenuItem>
                            {chartTypes
                                .slice() // copy array to avoid mutating original
                                .sort((a, b) => Number(a.id) - Number(b.id))
                                .map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.id} - {type.name}
                                    </MenuItem>
                                ))}
                        </Select>
                        <FormHelperText>{errors.subGroup || " "}</FormHelperText>
                    </FormControl>

                    <FormControl size="small" fullWidth error={!!errors.class}>
                        <InputLabel>Class</InputLabel>
                        <Select
                            name="class"
                            value={formData.class}
                            onChange={handleSelectChange}
                            label="Class"
                        >
                            {chartClasses.map((chartClass) => (
                                <MenuItem key={chartClass.cid} value={chartClass.cid}>
                                    {chartClass.class_name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errors.class || " "}</FormHelperText>
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
