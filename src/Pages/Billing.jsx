import { useState, useEffect } from "react";
import { getMedicines, getSupplier } from "../API/medicine";
import { createSale } from "../API/sale";
import { Search, Plus, Minus, ReceiptText } from "lucide-react";

function Billing() {
  const [BillingData, setBillingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

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

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
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
    if (isExpired(medicine.expiryDate)) {
      alert("Cannot add an expired medicine to the cart.");
      return;
    }

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

  const increaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.medicineId === id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.medicineId === id
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleCompleteSale = async () => {
    const saleData = {
      sale: {
        customerName,
        discount,
        method: paymentMethod,
      },
      saleDetails: cart.map((item) => ({
        medicineId: item.medicineId,
        qty: item.quantity,
        unitPrice: item.price,
      })),
    };

    try {
      const response = await createSale(saleData);
      console.log("Sale created:", response);
      window.location.reload(); 
    } catch (error) {
      console.error("Error creating sale:", error);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const gst = afterDiscount * 0.05;
  const total = afterDiscount + gst;

  return (
    <div className="bill-interface">
      <h1 className="bill-title">Billing/POS</h1>
      <p className="bill-sub-title">
        Search medicines, build a bill and complete the sale
      </p>
      <div className="billing-page">
        <div className="billing-grid">
          {/* Left side */}
          <div className="medicine-section">
            <div className="bill-search-container">
              <div className="bill-search-bar">
                <Search size={16} className="bill-search-icon" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  className="bill-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Scrollable medicine list */}
            <div className="medicine-list">
              <div className="medicine-grid">
                {filterData.map((item) => {
                  const expired = isExpired(item.expiryDate);

                  return (
                    <div
                      key={item.medicineId}
                      className={`medicine-card ${expired ? "expired-card" : ""}`}
                    >
                      <div className="medicineleftsection">
                        <h3>
                          {item.name}{" "}
                          {expired && (
                            <span
                              className={`dash-badge ${expired ? "dash-badge-red" : "dash-badge-orange"}`}
                            >
                              {expired ? "Expired" : "Expiring soon"}
                            </span>
                          )}
                        </h3>
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
                          className={`add-to-cart-button ${expired ? "disabled-btn" : ""}`}
                          style={{
                            backgroundColor: expired ? "#d1d5db" : undefined,
                            color: expired ? "#6b7280" : undefined,
                            cursor: expired ? "not-allowed" : "pointer",
                            borderColor: expired ? "#9ca3af" : undefined,
                          }}
                          onClick={() => addToCart(item)}
                          disabled={expired}
                          title={expired ? "This medicine is expired" : "Add to cart"}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="bill-section">
          <div className="bill-header">
            <h2>
              <ReceiptText size={20} className="bill-header-icon" />
              Current Bill
            </h2>
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear
            </button>
          </div>
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
                      <td className="text-center">
                        <button
                          className="quantity-btn"
                          onClick={() => decreaseQuantity(item.medicineId)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="item-quantity">{item.quantity}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => increaseQuantity(item.medicineId)}
                        >
                          <Plus size={16} />
                        </button>
                      </td>
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
            <div className="input-detail-cont">
              <div className="input-row">
                <div className="customer-detail">
                  <label htmlFor="customerName">Customer Name</label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="discount-detail">
                  <label htmlFor="Discount">Discount %</label>
                  <input
                    type="number"
                    id="Discount"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="payment-method">
                <label>Payment Method</label>
                <div className="payment-buttons">
                  {["Cash", "Card", "UPI"].map((method) => (
                    <button
                      key={method}
                      className={paymentMethod === method ? "active" : ""}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Discount ({discount}%)</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
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

          <div className="bill-actions">
            <button className="complete-sale-btn" onClick={handleCompleteSale}>
              Complete sale — ₹{total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing;