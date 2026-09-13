import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  searchMedicines,
  getMedicines,
  createMedicine,
  updateMedicine,
  getSupplier,
} from "../API/medicine";
import { Search, Plus, Minus, Truck, X, Bike } from "lucide-react";

function Medicine() {
  const navigate = useNavigate();
  const [medicineData, setMedicineData] = useState([]);
  const [existingInventory, setExistingInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState({});
  const [deliveringItems, setDeliveringItems] = useState({});

  // Manual Add Modal State matching reference form layout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    medicineId: 0,
    name: "",
    genericName: "",
    category: "Tablets",
    manufacturer: "",
    batchNumber: "",
    pack_size_label: "1",
    expiryDate: "",
    stockQuantity: "0",
    reorderLevel: "30",
    price: "0.00",
    costPrice: "0.00",
    supplierId: null,
  });

  // Fetch current inventory and suppliers on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventory = await getMedicines();
        setExistingInventory(Array.isArray(inventory) ? inventory : []);

        const supps = await getSupplier();
        setSuppliers(Array.isArray(supps) ? supps : []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchData();
  }, []);

  // Robust helper function to find a supplierId with normalization and partial matching
  const resolveSupplierId = (manufacturerName) => {
    if (!manufacturerName) return null;
    
    const cleanSearch = manufacturerName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

    if (!cleanSearch) return null;

    // 1. Try exact normalized match first
    let match = suppliers.find((s) => {
      const cleanSupp = (s.supplierName || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
      return cleanSupp === cleanSearch;
    });

    if (match) return match.supplierId;

    // 2. Try partial/includes match if exact match fails
    match = suppliers.find((s) => {
      const cleanSupp = (s.supplierName || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
      return cleanSupp.includes(cleanSearch) || cleanSearch.includes(cleanSupp);
    });

    return match ? match.supplierId : null;
  };

  // Helper to parse pack size label and extract numeric string (e.g. "strip of 10 tablets" -> "10")
  const parsePackSizeLabel = (packStr) => {
    if (!packStr) return "1";
    const matches = String(packStr).match(/\d+/);
    return matches ? matches[0] : "1";
  };

  // Debounced search for catalog medicines from API
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setMedicineData([]);
        return;
      }
      try {
        const med = await searchMedicines(searchQuery);
        setMedicineData(Array.isArray(med) ? med : []);
      } catch (error) {
        console.error("Error fetching search data:", error);
        setMedicineData([]);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Handle countdown timer for active deliveries
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setDeliveringItems((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        Object.keys(updated).forEach((id) => {
          if (updated[id] > 1) {
            updated[id] -= 1;
            hasChanges = true;
          } else {
            delete updated[id];
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const handleQuantityChange = (id, newQty) => {
    setQuantities((prev) => ({ ...prev, [id]: newQty }));
  };

  const handleAddOrReorder = async (med) => {
    const medId = med.id ?? med.medicineId;
    const selectedQty = quantities[medId] ?? 10;
    const qtyToAdd = selectedQty > 0 ? selectedQty : 10;

    setDeliveringItems((prev) => ({ ...prev, [medId]: 30 }));

    // Resolve supplier id using robust matching
    const resolvedSupplierId = resolveSupplierId(med.manufacturer);

    // Check if medicine exists and stock > 0
    const foundExisting = existingInventory.find(
      (item) =>
        ((medId && String(item.medicineId) === String(medId)) ||
         (med.name && item.name?.trim().toLowerCase() === med.name?.trim().toLowerCase())) &&
        Number(item.stockQuantity) > 0
    );

    // Calculate expiry date 5 months forward
    const expiryDateObj = new Date();
    expiryDateObj.setMonth(expiryDateObj.getMonth() + 5);
    const expiryDateIso = expiryDateObj.toISOString();

    // Calculate Price, Cost Price (-15%), and Pack size
    const priceVal = parseFloat(med.price) || 1.0;
    const costPriceVal = parseFloat((priceVal * 0.85).toFixed(2));
    const packSizeVal = parsePackSizeLabel(med.pack_size_label || med.packSize);
    const categoryVal = med.category && med.category !== "allopathy" ? med.category : "Tablets";

    const finalSupplierId = resolvedSupplierId !== null ? resolvedSupplierId : (foundExisting?.supplierId || null);

    try {
      if (foundExisting) {
        const updatedStock = Number(foundExisting.stockQuantity) + Number(qtyToAdd);

        const updatePayload = {
          medicineId: foundExisting.medicineId,
          name: foundExisting.name,
          category: categoryVal,
          price: priceVal,
          stockQuantity: updatedStock,
          expiryDate: expiryDateIso,
          costPrice: costPriceVal,
          reorderLevel: 30,
          supplierId: finalSupplierId,
          pack_size_label: packSizeVal,
        };

        await updateMedicine(foundExisting.medicineId, updatePayload);

        setExistingInventory((prev) =>
          prev.map((item) =>
            item.medicineId === foundExisting.medicineId
              ? {
                  ...item,
                  stockQuantity: updatedStock,
                  supplierId: finalSupplierId,
                  price: priceVal,
                  costPrice: costPriceVal,
                }
              : item,
          ),
        );
      } else {
        const newPayload = {
          medicineId: 1,
          name: med.name || "",
          category: categoryVal,
          price: priceVal,
          stockQuantity: Number(qtyToAdd),
          expiryDate: expiryDateIso,
          costPrice: costPriceVal,
          reorderLevel: 30,
          supplierId: finalSupplierId,
          pack_size_label: packSizeVal,
        };

        const createdItem = await createMedicine(newPayload);

        if (createdItem) {
          setExistingInventory((prev) => [...prev, createdItem]);
        } else {
          const refreshedInventory = await getMedicines();
          setExistingInventory(
            Array.isArray(refreshedInventory) ? refreshedInventory : [],
          );
        }
      }
    } catch (error) {
      console.error("Failed to add or update inventory:", error);
    }
  };

  const handleManualFormChange = (e) => {
    const { name, value } = e.target;
    setManualForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "supplierId") {
        const selectedSupp = suppliers.find(
          (s) => String(s.supplierId) === String(value),
        );
        updated.manufacturer = selectedSupp ? selectedSupp.supplierName : "";
      }
      return updated;
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.name) return;

    const foundExisting = existingInventory.find(
      (item) =>
        item.name?.trim().toLowerCase() ===
          manualForm.name.trim().toLowerCase() &&
        Number(item.stockQuantity) > 0,
    );

    const qtyToAdd = parseInt(manualForm.stockQuantity) || 10;
    const finalSupplierId = resolveSupplierId(manualForm.manufacturer) || (manualForm.supplierId ? Number(manualForm.supplierId) : null);

    const manualPrice = parseFloat(manualForm.price) || 1.0;
    const manualCostPrice = parseFloat((manualPrice * 0.85).toFixed(2));

    try {
      if (foundExisting) {
        const updatedStock = Number(foundExisting.stockQuantity) + qtyToAdd;
        const updatePayload = {
          medicineId: foundExisting.medicineId,
          name: foundExisting.name,
          category: manualForm.category || foundExisting.category || "Tablets",
          price: manualPrice,
          stockQuantity: updatedStock,
          expiryDate: manualForm.expiryDate
            ? new Date(manualForm.expiryDate).toISOString()
            : foundExisting.expiryDate,
          costPrice: manualCostPrice,
          reorderLevel: 30,
          supplierId: finalSupplierId !== null ? finalSupplierId : foundExisting.supplierId,
          pack_size_label: parsePackSizeLabel(manualForm.pack_size_label),
        };

        await updateMedicine(foundExisting.medicineId, updatePayload);
        setExistingInventory((prev) =>
          prev.map((item) =>
            item.medicineId === foundExisting.medicineId
              ? {
                  ...item,
                  stockQuantity: updatedStock,
                  supplierId: updatePayload.supplierId,
                }
              : item,
          ),
        );
      } else {
        const newPayload = {
          medicineId: 1,
          name: manualForm.name,
          category: manualForm.category || "Tablets",
          price: manualPrice,
          stockQuantity: qtyToAdd,
          expiryDate: manualForm.expiryDate
            ? new Date(manualForm.expiryDate).toISOString()
            : new Date(new Date().setMonth(new Date().getMonth() + 5)).toISOString(),
          costPrice: manualCostPrice,
          reorderLevel: 30,
          supplierId: finalSupplierId,
          pack_size_label: parsePackSizeLabel(manualForm.pack_size_label),
        };

        const createdItem = await createMedicine(newPayload);
        if (createdItem) {
          setExistingInventory((prev) => [...prev, createdItem]);
        } else {
          const refreshedInventory = await getMedicines();
          setExistingInventory(
            Array.isArray(refreshedInventory) ? refreshedInventory : [],
          );
        }
      }

      setManualForm({
        medicineId: 1,
        name: "",
        genericName: "",
        category: "Tablets",
        manufacturer: "",
        batchNumber: "",
        pack_size_label: "1",
        expiryDate: "",
        stockQuantity: "0",
        reorderLevel: "30",
        price: "0.00",
        costPrice: "0.00",
        supplierId: null,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add manual medicine:", error);
    }
  };

  const displayedItems =
    searchQuery.trim() === "" ? existingInventory : medicineData;

  return (
    <div className="add-med-scoped-wrapper">
      <div className="add-med-page">
        {/* Header Section */}
        <div className="add-med-header">
          <div>
            <h2>Add / Search Medicine</h2>
            <p className="add-med-subtitle">
              Order from your distributor — a rider delivers in 30 seconds and
              the medicine lands in your inventory.
            </p>
          </div>
          <button
            className="add-med-close-btn"
            onClick={() => navigate("/inventory")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="add-med-search-container">
          <span className="add-med-search-icon-wrapper">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, generic, manufacturer or batch..."
            className="add-med-search-input"
          />
        </div>

        {/* Medicine Cards Grid */}
        <div className="add-med-grid">
          {displayedItems.map((med) => {
            const medId = med.id ?? med.medicineId;
            const currentQty = quantities[medId] ?? 10;
            const timeLeft = deliveringItems[medId];
            const isDelivering = timeLeft !== undefined;

            const matchedInventoryItem = existingInventory.find(
              (item) =>
                ((medId && String(item.medicineId) === String(medId)) ||
                 (med.name && item.name?.trim().toLowerCase() === med.name?.trim().toLowerCase())) &&
                Number(item.stockQuantity) > 0,
            );

            const currentStockCount = matchedInventoryItem
              ? matchedInventoryItem.stockQuantity
              : med.stockQuantity || 0;
            const isExisting = !!matchedInventoryItem;
            const stockLabel = isExisting
              ? `In stock: ${currentStockCount} → ${currentStockCount + currentQty}`
              : `New item: 0 → ${currentQty}`;
            const actionButtonText = isExisting
              ? `Reorder ${currentQty} to Inventory`
              : `Add ${currentQty} to Inventory`;

            return (
              <div key={medId} className="add-med-card">
                <div>
                  <div className="add-med-title-bar">
                    <span className="add-med-truck-icon">
                      <Truck size={16} />
                    </span>
                    <h3>{med.name}</h3>
                  </div>

                  <div className="add-med-details">
                    <p>
                      <span>Manufacturer:</span>{" "}
                      <strong>{med.manufacturer}</strong>
                    </p>
                    <p>
                      <span>Category:</span> <strong>{med.category}</strong>
                    </p>
                    <p>
                      <span>Pack Size:</span>{" "}
                      <strong>{med.pack_size_label || med.packSize}</strong>
                    </p>
                    <p className="add-med-price-row">
                      <span>Price:</span> <strong>₹{med.price}</strong>
                    </p>
                  </div>
                </div>

                <div>
                  {isDelivering ? (
                    <div className="add-med-delivery-progress">
                      <div className="add-med-track-wrapper">
                        <div
                          className="add-med-progress-bar"
                          style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
                        >
                          <span className="add-med-bike-bubble">
                            <Bike size={14} />
                          </span>
                        </div>
                      </div>
                      <div className="add-med-delivery-status">
                        <span className="add-med-deliv-text">
                          Rider delivering your order...
                        </span>
                        <span className="add-med-timer">
                          0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="add-med-qty-info">
                        <span>Quantity</span>
                        <span className="add-med-stock-text">{stockLabel}</span>
                      </div>

                      <div className="add-med-slider-row">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              medId,
                              Math.max(0, currentQty - 1),
                            )
                          }
                          className="add-med-qty-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={currentQty}
                          onChange={(e) =>
                            handleQuantityChange(medId, Number(e.target.value))
                          }
                          className="add-med-range"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(medId, currentQty + 1)
                          }
                          className="add-med-qty-btn"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="add-med-qty-display">
                          {currentQty}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddOrReorder(med)}
                        className="add-med-action-btn"
                      >
                        <Truck size={16} />
                        {actionButtonText}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Manual Entry Link */}
        <div className="add-med-manual-link-container">
          <span
            onClick={() => setIsModalOpen(true)}
            className="add-med-manual-text-link"
          >
            Can't find it? Add a medicine manually
          </span>
        </div>

        {/* Manual Add Modal */}
        {isModalOpen && (
          <div className="add-med-modal-overlay">
            <div className="add-med-modal-content">
              <div className="add-med-modal-header">
                <div>
                  <h3>Add new medicine</h3>
                  <p>Enter the product details to add it to your inventory.</p>
                </div>
                <button
                  className="add-med-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="add-med-form-grid">
                <div className="add-med-form-group">
                  <label>MEDICINE NAME *</label>
                  <input
                    type="text"
                    name="name"
                    value={manualForm.name}
                    onChange={handleManualFormChange}
                    placeholder="e.g. Dolo 650"
                    required
                  />
                </div>

                <div className="add-med-form-group">
                  <label>GENERIC NAME</label>
                  <input
                    type="text"
                    name="genericName"
                    value={manualForm.genericName}
                    onChange={handleManualFormChange}
                    placeholder="e.g. Paracetamol 650mg"
                  />
                </div>

                <div className="add-med-form-group">
                  <label>CATEGORY *</label>
                  <select
                    name="category"
                    value={manualForm.category}
                    onChange={handleManualFormChange}
                    required
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Capsules">Capsules</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Drops">Drops</option>
                    <option value="Injectables">Injectables</option>
                    <option value="Supplements">Supplements</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>

                <div className="add-med-form-group">
                  <label>MANUFACTURER / SUPPLIER</label>
                  <select
                    name="supplierId"
                    value={manualForm.supplierId || ""}
                    onChange={handleManualFormChange}
                  >
                    <option value="">Select Supplier / Manufacturer</option>
                    {suppliers.map((supplier) => (
                      <option
                        key={supplier.supplierId}
                        value={supplier.supplierId}
                      >
                        {supplier.supplierName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="add-med-form-group">
                  <label>BATCH NUMBER</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={manualForm.batchNumber}
                    onChange={handleManualFormChange}
                    placeholder="e.g. DL2401"
                  />
                </div>

                <div className="add-med-form-group">
                  <label>EXPIRY DATE *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={manualForm.expiryDate}
                    onChange={handleManualFormChange}
                    required
                  />
                </div>

                <div className="add-med-form-group">
                  <label>STOCK (UNITS)</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={manualForm.stockQuantity}
                    onChange={handleManualFormChange}
                    placeholder="0"
                  />
                </div>

                <div className="add-med-form-group">
                  <label>REORDER LEVEL</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={manualForm.reorderLevel}
                    onChange={handleManualFormChange}
                    placeholder="30"
                  />
                </div>

                <div className="add-med-form-group">
                  <label>SELLING PRICE (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={manualForm.price}
                    onChange={handleManualFormChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="add-med-form-group">
                  <label>PURCHASE COST (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="costPrice"
                    value={manualForm.costPrice}
                    onChange={handleManualFormChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="add-med-modal-actions">
                  <button
                    type="button"
                    className="add-med-cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="add-med-action-btn">
                    Add medicine
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Medicine;