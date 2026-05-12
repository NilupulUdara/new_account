import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: JSX.Element;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, iconColor = "#3b82f6" }) => {
  const isPositive = change >= 0;
  
  return (
    <Paper
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        height: "100%",
        transition: "0.3s",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 3,
            width: 48,
            height: 48,
            backgroundColor: `${iconColor}15`,
            color: iconColor,
          }}
        >
          {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 24 } })}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 0.5,
            borderRadius: 2,
            backgroundColor: isPositive ? "#ecfdf5" : "#fef2f2",
            color: isPositive ? "#10b981" : "#ef4444",
          }}
        >
          {isPositive ? <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5 }} />}
          <Typography variant="caption" fontWeight="bold">
            {Math.abs(change)}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" fontWeight="medium">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
};

export default StatCard;
