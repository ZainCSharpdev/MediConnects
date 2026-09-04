import { useState, useEffect } from "react";
import { getMedicines, getSupplier } from "../API/medicine";
import { Search, Plus,  Minus } from "lucide-react";

function Billing() {
  const [BillingData, setBillingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const data = await getMedicines();
        setBillingData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const data = await getSupplier();
        setSuppliers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchMedicines();
    fetchSuppliers();
  }, []);

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find((s) => s.supplierId === supplierId);
    return supplier ? supplier.supplierName : "Unknown Supplier";
  };

  const filterData = BillingData.filter((item) => {
    const matchesMedicine = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesSupplier = getSupplierName(item.supplierId)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesMedicine || matchesSupplier;
  });

  const addToCart = (medicine) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.medicineId === medicine.medicineId,
      );
      if (existing) {
        return prev.map((item) =>
          item.medicineId === medicine.medicineId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...prev, { ...medicine, quantity: 1 }];
      }
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  return (
    <div className="billing-page">
      <div className="billing-grid">
        {/* Left side */}
        <div className="medicine-section">
          <div className="bill-search-container">
            <div className="search-bar">
              <Search size={16} className="bill-search-icon" />
              <input
                type="text"
                placeholder="Search medicines..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Scrollable medicine list */}
          <div className="medicine-list">
            <div className="medicine-grid">
              {filterData.map((item) => (
                <div key={item.medicineId} className="medicine-card">
                  <div className="medicineleftsection">
                    <h3>{item.name}</h3>
                    <p className="composition">
                      {getSupplierName(item.supplierId)}
                    </p>
                    <p className="price">
                      <span className="price-value">₹{item.price}</span> •{" "}
                      {item.stockQuantity} in stock
                    </p>
                  </div>
                  <div className="medicinerightsection">
                    <button
                      className="add-to-cart-button"
                      onClick={() => addToCart(item)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Bill */}
        <div className="bill-section">
          <h2>Current Bill</h2>
          <div className="bill-items">
            {cart.length === 0 ? (
              <p className="empty-cart">
                Cart is empty. Add medicines from the list to start a new bill.
              </p>
            ) : (
              <table className="cart-table">
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.medicineId}>
                      <td>
                        <p className="item-name">{item.name}</p>
                        <p className="item-price">₹{item.price} / unit</p>
                      </td>
                      <td className="text-center"><Plus size={16} />{item.quantity}<Minus size={16} /></td>
                      <td className="text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bill-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>GST (5%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button className="complete-sale-btn">
            Complete sale — ₹{total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Billing;
