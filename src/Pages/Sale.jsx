import { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Button, TextField, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Modal, Divider, List, ListItem, ListItemText 
} from '@mui/material';
import { 
  PointOfSale, 
  Receipt, 
  LocalHospital, 
  Search, 
  Visibility, 
  Close, 
  Print,
  TrendingUp,
  AttachMoney,
  Description
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSales } from '../API/sale';       // Adjust path to your sales API file
import { getMedicines } from '../API/medicine';   // Adjust path to your products API file

export default function Sales() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sales, setSales] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state for viewing specific invoice
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch sales and products data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesData, productsData] = await Promise.all([
          getSales(),
          getMedicines()
        ]);

        setSales(Array.isArray(salesData) ? salesData : []);

        // Build a lookup dictionary for product IDs to map them to product names and prices
        const map = {};
        if (Array.isArray(productsData)) {
          productsData.forEach(p => {
            map[p.productId] = {
              name: p.productName,
              price: p.price
            };
          });
        }
        setProductsMap(map);
      } catch (err) {
        console.error("Failed to load sales or products data", err);
      }
    };

    fetchData();
  }, []);

  // Filter sales based on search query (Invoice, customer name, or mapped product names)
  const filteredSales = sales.filter(s => {
    const query = searchTerm.toLowerCase();
    const invoiceMatch = s.invoice?.toLowerCase().includes(query) || s.id?.toString().includes(query);
    const customerMatch = s.customerName?.toLowerCase().includes(query);
    
    // Also check if any item in the sale matches the product name
    const itemMatch = s.details?.some(d => {
      const prodInfo = productsMap[d.productId];
      return prodInfo && prodInfo.name.toLowerCase().includes(query);
    });

    return invoiceMatch || customerMatch || itemMatch;
  });

  // KPI Calculations
  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.sale?.netAmount || curr.netAmount || curr.total || 0), 0);
  const totalInvoices = sales.length;
  const averageBill = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  // Handle open modal view
  const handleOpenModal = (saleRecord) => {
    setSelectedInvoice(saleRecord);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f7f6', minHeight: '100vh' }}>
      
      {/* Sidebar Navigation */}
      <Box sx={{ width: 260, bgcolor: '#00332c', color: 'white', p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1 }}>
          <LocalHospital sx={{ color: '#00bfa5', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>QuickMart<br/><span style={{ fontSize: '11px', color: '#80cbc4' }}>POS SYSTEM</span></Typography>
        </Box>
        
        <List sx={{ flexGrow: 1 }}>
          <ListItem button onClick={() => navigate('/')} sx={{ borderRadius: 2, mb: 1, bgcolor: location.pathname === '/' ? '#00796b' : 'transparent', '&:hover': { bgcolor: '#004d40' } }}>
            <PointOfSale sx={{ mr: 2 }} /> <ListItemText primary="Billing / POS" />
          </ListItem>
          <ListItem button onClick={() => navigate('/sales')} sx={{ borderRadius: 2, mb: 1, bgcolor: location.pathname === '/sales' ? '#00796b' : 'transparent', '&:hover': { bgcolor: '#004d40' } }}>
            <Receipt sx={{ mr: 2 }} /> <ListItemText primary="Sales" />
          </ListItem>
        </List>
      </Box>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Header section */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111' }}>Sales</Typography>
          <Typography variant="body2" color="textSecondary">{totalInvoices} invoices recorded</Typography>
        </Box>

        {/* KPI Metric Cards */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Paper sx={{ flex: 1, p: 3, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>Total revenue</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>₹{totalRevenue.toFixed(2)}</Typography>
              <Typography variant="caption" color="textSecondary">Across {totalInvoices} bills</Typography>
            </Box>
            <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: '50%', color: '#2e7d32', display: 'flex' }}>
              <AttachMoney />
            </Box>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>Today's revenue</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>₹{totalRevenue.toFixed(2)}</Typography>
              <Typography variant="caption" color="textSecondary">Bills closed today</Typography>
            </Box>
            <Box sx={{ bgcolor: '#e0f2f1', p: 1.5, borderRadius: '50%', color: '#00796b', display: 'flex' }}>
              <TrendingUp />
            </Box>
          </Paper>

          <Paper sx={{ flex: 1, p: 3, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>Average bill</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>₹{averageBill.toFixed(2)}</Typography>
              <Typography variant="caption" color="textSecondary">Per invoice value</Typography>
            </Box>
            <Box sx={{ bgcolor: '#fff8e1', p: 1.5, borderRadius: '50%', color: '#f57f17', display: 'flex' }}>
              <Description />
            </Box>
          </Paper>
        </Box>

        {/* Search Bar filter */}
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <TextField 
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search by invoice, customer or medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search color="action" sx={{ mr: 1 }} /> }}
          />
        </Paper>

        {/* Sales Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>INVOICE</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>DATE & TIME</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>CUSTOMER</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ITEMS</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>PAYMENT</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>VIEW</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No sales records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((saleRecord, index) => {
                  const saleInfo = saleRecord.sale || saleRecord;
                  const details = saleRecord.details || saleRecord.items || [];
                  const invoiceId = saleInfo.invoice || `INV-107${index}`;
                  const customer = saleInfo.customerName || 'Walk-in Customer';
                  const dateStr = saleInfo.saleDate ? new Date(saleInfo.saleDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '30 Aug, 9:05 am';
                  const paymentMethod = saleInfo.method || 'Cash';
                  const totalAmt = saleInfo.netAmount || saleInfo.totalAmount || saleInfo.total || 0;
                  const itemCount = details.reduce((sum, d) => sum + (d.quantity || d.qty || 1), 0);

                  return (
                    <TableRow key={saleRecord.id || index} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{invoiceId}</TableCell>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell>{customer}</TableCell>
                      <TableCell>{itemCount} items</TableCell>
                      <TableCell>
                        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 2, fontSize: '12px', bgcolor: '#e0f2f1', color: '#00796b', fontWeight: 'bold' }}>
                          {paymentMethod}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>₹{totalAmt.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleOpenModal(saleRecord)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>

      {/* Invoice Details Modal with Blurred Background Backdrop */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="invoice-modal-title"
        slotProps={{
          backdrop: {
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(5px)', // Blurry background effect requested
            },
          },
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50px)',
          width: 580,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
          outline: 'none',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          {selectedInvoice && (() => {
            const sInfo = selectedInvoice.sale || selectedInvoice;
            const items = selectedInvoice.details || selectedInvoice.items || [];
            const invNum = sInfo.invoice || 'INV-1079';
            const custName = sInfo.customerName || 'Walk-in Customer';
            const taxVal = sInfo.tax || 0;
            const discountVal = sInfo.discount || 0;
            const subtotalVal = items.reduce((acc, item) => acc + (item.price || (item.unitPrice * item.quantity)), 0);
            const netVal = sInfo.netAmount || sInfo.totalAmount || (subtotalVal + taxVal - discountVal);

            return (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography id="invoice-modal-title" variant="h6" sx={{ fontWeight: 'bold' }}>
                      Invoice {invNum}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      QuickMart Pharmacy · GSTIN 19ABCDE1234F1Z5
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={handleCloseModal}>
                    <Close />
                  </IconButton>
                </Box>

                <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#fcfcfc' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{custName}</Typography>
                      <Typography variant="caption" color="textSecondary">30 Aug, 9:05 am</Typography>
                    </Box>
                    <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 2, fontSize: '12px', bgcolor: '#e0f2f1', color: '#00796b', fontWeight: 'bold' }}>
                      {sInfo.method || 'Card'}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', pb: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ITEM</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>QTY</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>AMOUNT</Typography>
                  </Box>

                  {items.map((item, idx) => {
                    // Map product ID to actual product name using our fetched dictionary lookup map
                    const prodDetails = productsMap[item.productId];
                    const productName = prodDetails ? prodDetails.name : `Product ID: ${item.productId}`;
                    const unitPrice = item.unitPrice || (prodDetails ? prodDetails.price : 0);
                    const lineTotal = item.price || (unitPrice * item.quantity);

                    return (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                        <Box sx={{ flex: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{productName}</Typography>
                          <Typography variant="caption" color="textSecondary">₹{unitPrice.toFixed(2)} / unit</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>{item.quantity}</Typography>
                        <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>₹{lineTotal.toFixed(2)}</Typography>
                      </Box>
                    );
                  })}

                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Subtotal</Typography>
                      <Typography variant="body2">₹{subtotalVal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Tax / GST</Typography>
                      <Typography variant="body2">₹{taxVal.toFixed(2)}</Typography>
                    </Box>
                    {discountVal > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                        <Typography variant="body2">Discount</Typography>
                        <Typography variant="body2">-₹{discountVal.toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#00796b' }}>₹{netVal.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Paper>

                <Typography variant="caption" align="center" display="block" color="textSecondary" sx={{ mb: 3 }}>
                  Thank you for shopping at QuickMart. Get well soon!
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<Print />}
                    onClick={handlePrint}
                    sx={{ borderColor: '#ccc', color: '#333' }}
                  >
                    Print
                  </Button>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={handleCloseModal}
                    sx={{ bgcolor: '#00796b', '&:hover': { bgcolor: '#004d40' } }}
                  >
                    Done
                  </Button>
                </Box>
              </>
            );
          })()}
        </Box>
      </Modal>

    </Box>
  );
}