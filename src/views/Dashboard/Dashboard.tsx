import React from 'react';
import { Box, Grid, Typography, Card, CardContent, useTheme, Stack } from '@mui/material';
import StatCard from '../../components/StatCard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StoreIcon from '@mui/icons-material/Store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import CustomPieChart from '../../components/CustomPieChart';

const barData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 5000, profit: 4800 },
  { name: 'Apr', revenue: 2780, profit: 3908 },
  { name: 'May', revenue: 1890, profit: 4800 },
  { name: 'Jun', revenue: 2390, profit: 3800 },
];

const pieData = [
  { name: 'Electronics', value: 400 },
  { name: 'Fashion', value: 300 },
  { name: 'Home & Garden', value: 300 },
  { name: 'Sports', value: 200 },
];

const Dashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
            Grow Ledger Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening today in your accounts.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Revenue" 
            value="$54,230" 
            change={12.5} 
            icon={<MonetizationOnIcon />} 
            iconColor="#3b82f6" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Sales" 
            value="1,240" 
            change={8.2} 
            icon={<ShoppingCartIcon />} 
            iconColor="#10b981" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Customers" 
            value="842" 
            change={-3.4} 
            icon={<PeopleIcon />} 
            iconColor="#6366f1" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Store Traffic" 
            value="12,543" 
            change={24.8} 
            icon={<StoreIcon />} 
            iconColor="#f59e0b" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            borderRadius: 4, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#334155' }}>
                Revenue Performance
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                        padding: '12px'
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      content={({ payload }) => (
                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 2 }}>
                          {payload?.map((entry: any, index: number) => (
                            <Stack key={`item-${index}`} direction="row" alignItems="center" spacing={0.5}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                {entry.value}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="profit" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 4, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>
                Sales by Category
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current month distribution
              </Typography>
              <Box sx={{ mt: -2 }}>
                <CustomPieChart 
                  data={pieData} 
                  width="100%" 
                  height={380} 
                  innerRadius={70} 
                  outerRadius={100} 
                  colors={['#3b82f6', '#10b981', '#f59e0b', '#6366f1']}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
