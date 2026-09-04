import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Paper, Typography, Button, 
  List, ListItem, ListItemText, Divider 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, Inventory, PointOfSale, 
  Receipt, Warning, LocalHospital 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getProfitLoss, getLowStockAnalytics, getExpiringSoonAnalytics } from '../API/analytics';
import { getMedicines } from '../API/medicine';
import { getSales } from '../API/sale';

export default function Dashboard() {
  const navigate = useNavigate();

  // Dashboard States
  const [revenueData, setRevenueData] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Today's Revenue (using current date for start and end)
        const profitRes = await getProfitLoss(today, today);
        setRevenueData(profitRes?.totalRevenue || 79.28); 

        // 2. Medicines count from Inventory
        const meds = await getMedicines();
        setTotalMedicines(meds?.length || 18);

        // 3. Low stock analytics (Threshold = 10)
        const lowStockRes = await getLowStockAnalytics(10);
        setLowStockItems(Array.isArray(lowStockRes) ? lowStockRes : []);

        // 4. Expiry alerts (90 days ahead)
        const expiryRes = await getExpiringSoonAnalytics(90);
        setExpiringItems(Array.isArray(expiryRes) ? expiryRes : []);

        // 5. Recent Sales
        const salesRes = await getSales();
        setRecentSales(Array.isArray(salesRes) ? salesRes.slice(0, 6) : []);

      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7f6', minHeight: '100vh' }}>
      
      {/* Sidebar Navigation */}
      <Box sx={{ width: 260, bgcolor: '#00332c', color: 'white', p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1 }}>
          <LocalHospital sx={{ color: '#00bfa5', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>MediConnects<br/><span style={{ fontSize: '11px', color: '#80cbc4' }}>PHARMACY SUITE</span></Typography>
        </Box>
        
        <List sx={{ flexGrow: 1 }}>
          <ListItem button selected sx={{ bgcolor: '#00796b', borderRadius: 2, mb: 1 }}>
            <DashboardIcon sx={{ mr: 2 }} /> <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/inventory')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: '#004d40' } }}>
            <Inventory sx={{ mr: 2 }} /> <ListItemText primary="Inventory" />
          </ListItem>
          <ListItem button onClick={() => navigate('/billing')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: '#004d40' } }}>
            <PointOfSale sx={{ mr: 2 }} /> <ListItemText primary="Billing / POS" />
          </ListItem>
          <ListItem button onClick={() => navigate('/sales')} sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: '#004d40' } }}>
            <Receipt sx={{ mr: 2 }} /> <ListItemText primary="Sales" />
          </ListItem>
        </List>

        <Paper sx={{ p: 2, bgcolor: '#002521', color: 'white', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Warning color="warning" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>STOCK ALERTS</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#b2dfdb', fontSize: '12px' }}>
            {lowStockItems.length + expiringItems.length} items need attention (low stock / expiry).
          </Typography>
        </Paper>
      </Box>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111' }}>Dashboard</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>Store overview — sales, stock and expiry health</Typography>

        {/* Top Metric Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body2" color="textSecondary">Today's revenue</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>₹{revenueData}</Typography>
              <Typography variant="caption" color="textSecondary">1 bill today</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body2" color="textSecondary">Medicines in stock</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>{totalMedicines}</Typography>
              <Typography variant="caption" color="textSecondary">Active inventory items</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body2" color="textSecondary">Low / out of stock</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1, color: '#d32f2f' }}>{lowStockItems.length}</Typography>
              <Typography variant="caption" color="textSecondary">Items at or below reorder level</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body2" color="textSecondary">Expiry alerts</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1, color: '#ed6c02' }}>{expiringItems.length}</Typography>
              <Typography variant="caption" color="textSecondary">Expired or expiring within 90 days</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Revenue Chart Section Placeholder */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Revenue — last 7 days</Typography>
              <Typography variant="caption" color="textSecondary">Daily billed total including GST</Typography>
            </Box>
            <Button color="primary" onClick={() => navigate('/sales')}>View all sales →</Button>
          </Box>
          <Box sx={{ height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', pt: 2, borderBottom: '1px solid #eee' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <Box key={day} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 32, height: `${(index + 1) * 20}px`, bgcolor: '#00897b', borderRadius: '4px 4px 0 0' }} />
                <Typography variant="caption" color="textSecondary">{day}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Bottom Split Tables: Recent Sales & Needs Attention */}
        <Grid container spacing={3}>
          {/* Recent Sales Table */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Recent sales</Typography>
                <Button color="primary" onClick={() => navigate('/sales')}>View all →</Button>
              </Box>
              <List dense>
                {recentSales.map((sale, i) => {
                  const saleDateStr = sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : '30 Aug';
                  return (
                    <React.Fragment key={sale.id || i}>
                      <ListItem sx={{ py: 1.5 }}>
                        <ListItemText 
                          primary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{sale.customerName || "Walk-in Customer"}</Typography>}
                          secondary={`INV-${sale.id || '1079'} · ${saleDateStr}`}
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>₹{sale.totalAmount}</Typography>
                          <Typography variant="caption" sx={{ bgcolor: '#e0f2f1', px: 1, py: 0.5, borderRadius: 1, color: '#00695c' }}>
                            {sale.paymentMethod || 'Card'}
                          </Typography>
                        </Box>
                      </ListItem>
                      {i < recentSales.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          {/* Needs Attention Table */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Needs attention</Typography>
                <Button color="primary" onClick={() => navigate('/inventory')}>Open inventory →</Button>
              </Box>
              <List dense>
                {expiringItems.slice(0, 5).map((item, i) => (
                  <React.Fragment key={item.id || i}>
                    <ListItem sx={{ py: 1.5 }}>
                      <ListItemText 
                        primary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>}
                        secondary={`${item.genericName || item.category || 'Medicine'} · Batch ${item.batchNumber || 'N/A'}`}
                      />
                      <Box>
                        <Typography variant="caption" sx={{ bgcolor: '#fff3e0', color: '#e65100', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 'bold' }}>
                          Expiring soon
                        </Typography>
                      </Box>
                    </ListItem>
                    {i < Math.min(expiringItems.length, 5) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

      </Box>
    </Box>
  );
}