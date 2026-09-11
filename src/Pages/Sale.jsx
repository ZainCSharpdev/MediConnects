import { useState, useEffect } from "react";
import { getSales } from "../API/sale";
import { getSaleDetailsBySaleId } from "../API/saledetails";
import { getMedicines } from "../API/medicine";
import {
  IndianRupee,
  TrendingUp,
  ReceiptText,
  Search,
  Eye,
  X,
  Printer
} from "lucide-react";

function Sale() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemCounts, setItemCounts] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [medicinesMap, setMedicinesMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesData, medsData] = await Promise.all([
          getSales().catch(() => []),
          getMedicines().catch(() => [])
        ]);

        setSales(salesData);

        const medMap = {};
        const safeMeds = Array.isArray(medsData) ? medsData : medsData?.medicines || [];
        safeMeds.forEach((m) => {
          medMap[m.medicineId || m.id] = m.medicineName || m.name;
        });
        setMedicinesMap(medMap);

        const counts = {};
        for (const sale of salesData) {
          try {
            const details = await getSaleDetailsBySaleId(sale.saleId);
            counts[sale.saleId] = details.reduce((sum, d) => sum + d.qty, 0);
          } catch (err) {
            counts[sale.saleId] = 0;
            console.error("Count sale error", err);
          }
        }
        setItemCounts(counts);
      } catch (err) {
        console.error("Error loading sales data: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = sales.reduce((sum, s) => sum + (s.netAmount || s.totalAmount || 0), 0);
  const totalBills = sales.length;
  const today = new Date().toLocaleDateString("en-IN");
  const todayRevenue = sales
    .filter((s) => new Date(s.saleDate).toLocaleDateString("en-IN") === today)
    .reduce((sum, s) => sum + (s.netAmount || s.totalAmount || 0), 0);
  const averageBill = totalBills > 0 ? totalRevenue / totalBills : 0;

  const handleViewItems = async (sale) => {
    try {
      const items = await getSaleDetailsBySaleId(sale.saleId);
      setSelectedItems(items);
      setSelectedSale(sale);
    } catch (err) {
      console.error("Error fetching sale details:", err);
    }
  };

  const handleCloseModal = () => {
    setSelectedSale(null);
    setSelectedItems([]);
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="sale-container">
      <h2 className="sale-title">Sales</h2>
      <p className="sale-subtitle">{totalBills} invoices recorded</p>

      <div className="cards">
        <div className="card">
          <h4 className="card-title">
            Total Revenue <IndianRupee size={35} className="sale-icon total-icon"/>
          </h4>
          <p className="sale-price">₹{totalRevenue.toFixed(2)}</p>
          <p className="discription">Across {totalBills} bills</p>
        </div>
        <div className="card">
          <h4 className="card-title">
            Today’s Revenue <TrendingUp size={35} className="sale-icon revenue-icon"/>
          </h4>
          <p className="sale-price">₹{todayRevenue.toFixed(2)}</p>
          <p className="discription">Bills closed today</p>
        </div>
        <div className="card">
          <h4 className="card-title">
            Average Bill <ReceiptText size={35} className="sale-icon average-icon"/>
          </h4>
          <p className="sale-price">₹{averageBill.toFixed(2)}</p>
          <p className="discription">Per invoice value</p>
        </div>
      </div>

      <div className="sale-search-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search by invoice, customer or medicine..."
          className="sale-search"
        />
      </div>

      <div className="sale-table-container">
        <table className="sale-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th className="text-right">View</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.saleId}>
                <td>{sale.invoice}</td>
                <td>{new Date(sale.saleDate).toLocaleString("en-IN")}</td>
                <td>{sale.customerName}</td>
                <td>
                  <span className="badge badge-gray">
                    {itemCounts[sale.saleId] || 0} items
                  </span>
                </td>
                <td>
                  <span className="badge badge-green">{sale.method || sale.paymentMode || 'Cash'}</span>
                </td>
                <td className="cell-title">₹{(sale.netAmount || sale.totalAmount || 0).toFixed(2)}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleViewItems(sale)}
                    className="action-btn"
                  >
                    <Eye size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Blurred Backdrop Modal with Enclosed Receipt Card & Table Structure */}
      {selectedSale && (
        <div className="modal-backdrop">
          <div className="invoice-modal-card">
            <div className="invoice-modal-header">
              <div>
                <h3>Invoice {selectedSale.invoice}</h3>
                <p className="invoice-subtext">MediConnects Pharmacy · GSTIN 19ABCDE1234F1Z5</p>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>

            <div className="invoice-inner-box">
              <div className="invoice-receipt-card">
                <div className="invoice-customer-row">
                  <div>
                    <h4 className="invoice-customer-name">{selectedSale.customerName || "Walk-in Customer"}</h4>
                    <p className="invoice-date-text">
                      {new Date(selectedSale.saleDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}, {new Date(selectedSale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="badge badge-teal">{selectedSale.method || selectedSale.paymentMode || 'Cash'}</span>
                </div>

                <table className="invoice-items-table">
                  <thead>
                    <tr>
                      <th>ITEM</th>
                      <th className="col-qty">QTY</th>
                      <th className="col-amount">AMOUNT</th>
                    </tr>
                  </thead>
                </table>

                <div className="invoice-items-scroll-container">
                  <table className="invoice-items-table">
                    <tbody>
                      {selectedItems.map((item, idx) => {
                        const lineTotal = (item.qty || 1) * (item.unitPrice || 0);
                        const resolvedName = medicinesMap[item.medicineId] || item.medicineName || `Medicine #${item.medicineId}`;
                        return (
                          <tr key={idx}>
                            <td>
                              <p className="invoice-item-name">{resolvedName}</p>
                              <p className="invoice-item-unit">₹{(item.unitPrice || 0).toFixed(2)} / unit</p>
                            </td>
                            <td className="col-qty invoice-item-qty">{item.qty}</td>
                            <td className="col-amount invoice-item-amount">₹{lineTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="invoice-totals-section">
                  <div className="invoice-calc-row">
                    <span>Subtotal</span>
                    <span>₹{(selectedSale.totalAmount || selectedSale.netAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="invoice-calc-row">
                    <span>GST (5%)</span>
                    <span>₹{(selectedSale.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="invoice-calc-row invoice-grand-total">
                    <span>Total</span>
                    <span>₹{(selectedSale.netAmount || selectedSale.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                <p className="invoice-footer-note">Thank you for shopping at MediConnects. Get well soon!</p>
              </div>
            </div>

            <div className="invoice-modal-actions">
              <button className="btn-secondary" onClick={() => window.print()}>
                <Printer size={16} /> Print
              </button>
              <button className="btn-primary" onClick={handleCloseModal}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sale;