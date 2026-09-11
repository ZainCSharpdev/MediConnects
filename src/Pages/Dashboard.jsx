import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMedicineCount } from "../API/medicine";
import { getSales } from "../API/sale";
import {
  getLowStockAnalytics,
  getExpiringSoonAnalytics,
} from "../API/analytics";
import {
  Package,
  AlertTriangle,
  Calendar,
  ArrowRight,
  TrendingUp,
  ReceiptText,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayBillsCount, setTodayBillsCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [lowStockList, setLowStockList] = useState([]);
  const [expiringSoonList, setExpiringSoonList] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [weeklySalesData, setWeeklySalesData] = useState([]);

  // Helper to build the 7-day revenue chart data
  const processWeeklyRevenue = (sales) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const dayName = days[d.getDay()];
      const dateString = d.toISOString().split("T")[0];

      const dayTotal = sales
        .filter((s) => {
          const sDate = s.saleDate ? s.saleDate.split("T")[0] : "";
          return sDate === dateString;
        })
        .reduce((sum, s) => sum + (s.netAmount || s.totalAmount || 0), 0);

      last7Days.push({ day: dayName, revenue: dayTotal, date: dateString });
    }

    setWeeklySalesData(last7Days);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const todayStr = new Date().toISOString().split("T")[0];

        // 1. Fetch Sales to calculate Today's Revenue and Bill Count
        const salesData = await getSales().catch(() => []);
        const safeSales = Array.isArray(salesData) ? salesData : [];

        setRecentSales(safeSales.slice(0, 5));

        // Filter today's sales
        const todaysSalesList = safeSales.filter((s) => {
          const sDate = s.saleDate ? s.saleDate.split("T")[0] : "";
          return sDate === todayStr;
        });

        const calculatedTodayRev = todaysSalesList.reduce(
          (sum, s) => sum + (s.netAmount || s.totalAmount || 0),
          0,
        );

        setTodayRevenue(calculatedTodayRev);
        setTodayBillsCount(todaysSalesList.length);

        // Process Last 7 Days Revenue Chart
        processWeeklyRevenue(safeSales);

        // 2. Fetch Total Medicines Count
        const countData = await getMedicineCount().catch(() => 0);
        setMedicineCount(
          typeof countData === "number" ? countData : countData?.count || 0,
        );

        // 3. Fetch Low Stock with threshold = 50
        const stockData = await getLowStockAnalytics(50).catch(() => []);
        setLowStockList(Array.isArray(stockData) ? stockData : []);

        // 4. Fetch Expiring Soon with daysAhead = 90
        const expiryData = await getExpiringSoonAnalytics(90).catch(() => []);
        setExpiringSoonList(Array.isArray(expiryData) ? expiryData : []);
      } catch (error) {
        console.error("Error loading dashboard metrics:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const maxRevenue = Math.max(...weeklySalesData.map((d) => d.revenue), 100);

  // Only hide the chart if ALL 7 days have zero sales
  const isAllZeroSales = weeklySalesData.every((d) => d.revenue === 0);

  return (
    <div className="dash-page">
      {/* Header Section */}
      <div className="dash-header">
        <div className="dash-header-container">
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-count">
            Store overview — sales, stock and expiry health
          </p>
        </div>
      </div>

      {/* TOP STATS CARDS GRID */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-card-top">
            <div>
              <p className="dash-card-label">Today's revenue</p>
              <h3 className="dash-card-value">
                ₹
                {todayRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
            <div className="dash-card-icon teal">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="dash-card-footer">
            {todayBillsCount} bill{todayBillsCount === 1 ? "" : "s"} today
          </p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-card-top">
            <div>
              <p className="dash-card-label">Medicines in stock</p>
              <h3 className="dash-card-value">{medicineCount}</h3>
            </div>
            <div className="dash-card-icon teal">
              <Package size={20} />
            </div>
          </div>
          <p className="dash-card-footer">Active inventory items</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-card-top">
            <div>
              <p className="dash-card-label">Low / out of stock</p>
              <h3 className="dash-card-value text-orange">
                {lowStockList.length}
              </h3>
            </div>
            <div className="dash-card-icon orange">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="dash-card-footer">Items at or below reorder level</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-card-top">
            <div>
              <p className="dash-card-label">Expiry alerts</p>
              <h3 className="dash-card-value text-red">
                {expiringSoonList.length}
              </h3>
            </div>
            <div className="dash-card-icon red">
              <Calendar size={20} />
            </div>
          </div>
          <p className="dash-card-footer">Expired or expiring within 90 days</p>
        </div>
      </div>

      {/* REVENUE GRAPH SECTION */}
      <div className="dash-chart-container">
        <div className="dash-chart-header">
          <div>
            <h3 className="dash-chart-title">Revenue — last 7 days</h3>
            <p className="dash-chart-subtitle">
              Daily billed total including GST
            </p>
          </div>
          <button
            className="dash-view-all-btn"
            onClick={() => navigate("/sales")}
          >
            View all sales <ArrowRight size={16} />
          </button>
        </div>

        {isAllZeroSales ? (
          <div className="dash-chart-empty">
            No sales recorded for this week. Chart hidden.
          </div>
        ) : (
          <div className="dash-chart-body">
            <div className="dash-gridlines">
              <span>₹{Math.round(maxRevenue)}</span>
              <span>₹{Math.round(maxRevenue * 0.5)}</span>
              <span>₹0</span>
            </div>

            {weeklySalesData.map((bar, idx) => {
              const heightPct = Math.max(
                (bar.revenue / maxRevenue) * 100,
                bar.revenue > 0 ? 8 : 0,
              );

              return (
                <div key={idx} className="dash-bar-col">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="dash-bar-fill"
                  >
                    {bar.revenue > 0 && (
                      <span className="dash-tooltip">₹{bar.revenue}</span>
                    )}
                  </div>
                  <span className="dash-bar-day">{bar.day}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTOM TABLES SECTION */}
      <div className="dash-bottom-grid">
        {/* Recent Sales Table Panel */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Recent sales</h3>
            <button
              className="dash-view-all-btn"
              onClick={() => navigate("/sales")}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="dash-list-container">
            {recentSales.length === 0 ? (
              <p className="dash-empty-msg">No recent sales found.</p>
            ) : (
              recentSales.map((sale, i) => (
                <div key={i} className="dash-list-row">
                  <div className="dash-row-left">
                    <div className="dash-row-icon-box">
                      <ReceiptText size={18} />
                    </div>
                    <div>
                      <p className="dash-cell-title">
                        {sale.customerName || `Sale #${sale.saleId || i + 1}`}
                      </p>
                      <p className="dash-cell-sub">
                        {sale.invoice || `INV-${sale.saleId || 1079 - i}`} •{" "}
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" },
                            )
                          : "Today"}
                        ,{" "}
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="dash-row-right dash-sale">
                    <p className="dash-cell-title">
                      ₹{sale.netAmount || sale.totalAmount || 0}
                    </p>
                    <span className="dash-badge dash-badge-green">
                      {sale.paymentMode || "Paid"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Needs Attention Panel */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Needs attention</h3>
            <button
              className="dash-view-all-btn"
              onClick={() => navigate("/inventory")}
            >
              Open inventory <ArrowRight size={14} />
            </button>
          </div>

          <div className="dash-list-container dash-scrollable">
            {lowStockList.length === 0 && expiringSoonList.length === 0 ? (
              <p className="dash-empty-msg">
                All inventory stock & expiry levels are healthy!
              </p>
            ) : (
              <>
                {expiringSoonList.map((item, idx) => {
                  const isExpired = item.daysUntilExpiry < 0;

                  return (
                    <div key={`exp-${idx}`} className="dash-list-row">
                      <div className="dash-row-left">
                        <div>
                          <p className="dash-cell-title">{item.medicineName}</p>
                          <p className="dash-cell-sub">
                            {item.category || item.genericName || "Medicine"}{" "}
                            {item.batchNumber
                              ? `• Batch ${item.batchNumber}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="dash-row-right">
                        {!isExpired && (
                          <span
                            className="dash-cell-sub  badge badge-orange"
                            style={{ fontWeight: 600 }}
                          >
                            {item.daysUntilExpiry}d left
                          </span>
                        )}
                        <span
                          className={`dash-badge ${isExpired ? "dash-badge-red" : "dash-badge-orange"}`}
                        >
                          {isExpired ? "Expired" : "Expiring soon"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {lowStockList.map((item, idx) => (
                  <div key={`stock-${idx}`} className="dash-list-row">
                    <div className="dash-row-left">
                      <div>
                        <p className="dash-cell-title">{item.medicineName}</p>
                        <p className="dash-cell-sub">
                          Reorder level: {item.reorderLevel} • Stock:{" "}
                          {item.stockQuantity}
                        </p>
                      </div>
                    </div>

                    <div className="dash-row-right">
                      <span
                        className="dash-cell-sub"
                        style={{ fontWeight: 600 }}
                      >
                        {item.stockQuantity} left
                      </span>
                      <span className="dash-badge dash-badge-red">
                        Low stock
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;