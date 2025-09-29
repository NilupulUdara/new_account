import React from "react";
import {
    Box,
    Stack,
    Typography,
    Button,
    Paper,
    Divider,
    TextField,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFiscalYear } from "../../../../api/FiscalYear/FiscalYearApi";
import { useNavigate } from "react-router";

interface FiscalYearFormData {
    fiscalYearFrom: string;
    fiscalYearTo: string;
}

export default function AddFiscalYear() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FiscalYearFormData>({
        defaultValues: {
            fiscalYearFrom: "",
            fiscalYearTo: "",
        },
    });

    const fiscalYearFrom = watch("fiscalYearFrom");

    const onSubmit = async (data: FiscalYearFormData) => {
        try {
            const response = await createFiscalYear({
                fiscal_year_from: data.fiscalYearFrom,
                fiscal_year_to: data.fiscalYearTo,
            });
            console.log("Fiscal Year created:", response);
            alert("Fiscal Year added successfully!");

            // Refresh react-query cache if you have a list
            queryClient.invalidateQueries({ queryKey: ["fiscalYears"] });
            queryClient.refetchQueries({ queryKey: ["fiscalYears"] });
            navigate("/setup/companysetup/fiscal-years");
        } catch (err: any) {
            alert("Error creating Fiscal Year: " + JSON.stringify(err));
        }
    };


    return (
        <Stack alignItems="center" sx={{ mt: 4, px: 2 }}>
            <Paper
                sx={{
                    p: theme.spacing(3),
                    width: "100%",
                    maxWidth: isMobile ? "100%" : "600px",
                    boxShadow: 2,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" sx={{ mb: 2, textAlign: isMobile ? "center" : "left" }}>
                    Fiscal Year Setup
                </Typography>

                <Stack spacing={3}>
                    <Divider />

                    <Controller
                        name="fiscalYearFrom"
                        control={control}
                        rules={{ required: "Fiscal Year Begin is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Fiscal Year Begin"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!errors.fiscalYearFrom}
                                helperText={errors.fiscalYearFrom?.message}
                            />
                        )}
                    />

                    <Controller
                        name="fiscalYearTo"
                        control={control}
                        rules={{
                            required: "Fiscal Year End is required",
                            validate: (value) =>
                                !fiscalYearFrom || value >= fiscalYearFrom
                                    ? true
                                    : "Fiscal Year End must be after Begin",
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Fiscal Year End"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!errors.fiscalYearTo}
                                helperText={errors.fiscalYearTo?.message}
                            />
                        )}
                    />
                </Stack>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        justifyContent: "space-between",
                        gap: 2,
                        mt: 3,
                    }}
                >
                    <Button
                        fullWidth={isMobile}
                        onClick={() => window.history.back()}
                        variant="outlined"
                    >
                        Back
                    </Button>

                    <Button
                        fullWidth={isMobile}
                        variant="contained"
                        sx={{ backgroundColor: "var(--pallet-blue)" }}
                        onClick={handleSubmit(onSubmit)}
                    >
                        Add New
                    </Button>
                </Box>
            </Paper>
        </Stack>
    );
}