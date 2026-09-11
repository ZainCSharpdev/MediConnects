"""
Pharmacy Analytics API — single-file version.

Combines the SQL analytics functions and the FastAPI routes that expose
them. Everything below the "ANALYTICS QUERIES" header is plain, framework-
agnostic Python (functions returning dicts) built against this schema:

  Users(UserId, Name, Role, Email, Password)
  Medicines(MedicineId, Name, Category, Price, CostPrice, StockQuantity,
            ExpiryDate, ReorderLevel, SupplierId → Suppliers.SupplierId)
  Suppliers(SupplierId, SupplierName, ContactEmail, Phone)
  PurchaseOrders(PurchaseOrderId, SupplierId, OrderDate,
                 ExpectedDeliveryDate, ActualDeliveryDate)
  PurchaseOrderDetails(PurchaseOrderDetailId, PurchaseOrderId, MedicineId,
                        Quantity, UnitCost)
  Sale(SaleId, SaleDate, Invoice, CustomerName, TotalAmount, Discount,
       NetAmount, Method)
  SalesDetails(SaleDetailId, SaleId, MedicineId, Qty, UnitPrice, TotalPrice)
"""
import logging
from datetime import date, timedelta

import pyodbc
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import add_scalar_reference

from app import schemas
from app.database import check_connection, fetch_all, fetch_one

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pharmacy_api")


# =============================================================================
# ANALYTICS QUERIES
# =============================================================================

def get_profit_loss_summary(start_date: date, end_date: date) -> dict:
    revenue_query = """
        SELECT ISNULL(SUM(s.NetAmount), 0) AS total_revenue
        FROM Sales s
        WHERE s.SaleDate >= ? AND s.SaleDate < DATEADD(DAY, 1, ?)
    """
    cost_query = """
        SELECT ISNULL(SUM(sd.Qty * m.CostPrice), 0) AS total_cost
        FROM Sales s
        JOIN SaleDetails sd ON sd.SaleId = s.SaleId
        JOIN Medicines m    ON m.MedicineId = sd.MedicineId
        WHERE s.SaleDate >= ? AND s.SaleDate < DATEADD(DAY, 1, ?)
    """
    revenue_row = fetch_one(revenue_query, (start_date, end_date))
    cost_row = fetch_one(cost_query, (start_date, end_date))

    revenue = float(revenue_row["total_revenue"])
    cost = float(cost_row["total_cost"])
    profit = revenue - cost
    margin = (profit / revenue * 100) if revenue > 0 else 0.0
    
    if profit > 0:
        pl_status = "Profit"
    elif profit < 0:
        pl_status = "Loss"
    else:
        pl_status = "Break-even"
            
    return {
        "period_start": start_date,
        "period_end": end_date,
        "total_revenue": round(revenue, 2),
        "total_cost": round(cost, 2),
        "gross_profit": round(profit, 2),
        "gross_margin_pct": round(margin, 2),
        "status": pl_status,
    }



def get_profit_loss_by_medicine(start_date: date, end_date: date, limit: int = 50) -> list[dict]:
    query = """
        SELECT TOP (?)
            m.MedicineId                            AS medicine_id,
            m.Name                                  AS medicine_name,
            ISNULL(SUM(sd.TotalPrice), 0)           AS revenue,
            ISNULL(SUM(sd.Qty * m.CostPrice), 0)    AS cost
        FROM Sales s
        JOIN SaleDetails sd ON sd.SaleId = s.SaleId
        JOIN Medicines m    ON m.MedicineId = sd.MedicineId
        WHERE s.SaleDate >= ? AND s.SaleDate < DATEADD(DAY, 1, ?)
        GROUP BY m.MedicineId, m.Name
        ORDER BY (SUM(sd.TotalPrice) - SUM(sd.Qty * m.CostPrice)) DESC
    """
    rows = fetch_all(query, (limit, start_date, end_date))
    results = []
    for r in rows:
        revenue = float(r["revenue"])
        cost = float(r["cost"])
        profit = revenue - cost
        margin = (profit / revenue * 100) if revenue > 0 else 0.0
        
        if profit > 0:
            pl_status = "Profit"
        elif profit < 0:
            pl_status = "Loss"
        else:
            pl_status = "Break-even"

        results.append({
            "medicine_id": r["medicine_id"],
            "medicine_name": r["medicine_name"],
            "revenue": round(revenue, 2),
            "cost": round(cost, 2),
            "profit": round(profit, 2),
            "margin_pct": round(margin, 2),
            "status": pl_status, 
        })
    return results


def get_loss_making_medicines(start_date: date, end_date: date, limit: int = 50) -> list[dict]:
    query = """
        SELECT TOP (?)
            m.MedicineId                            AS medicine_id,
            m.Name                                  AS medicine_name,
            ISNULL(SUM(sd.TotalPrice), 0)           AS revenue,
            ISNULL(SUM(sd.Qty * m.CostPrice), 0)    AS cost
        FROM Sales s
        JOIN SaleDetails sd ON sd.SaleId = s.SaleId
        JOIN Medicines m    ON m.MedicineId = sd.MedicineId
        WHERE s.SaleDate >= ? AND s.SaleDate < DATEADD(DAY, 1, ?)
        GROUP BY m.MedicineId, m.Name
        HAVING SUM(sd.TotalPrice) < SUM(sd.Qty * m.CostPrice)
        ORDER BY (SUM(sd.TotalPrice) - SUM(sd.Qty * m.CostPrice)) ASC
    """
    rows = fetch_all(query, (limit, start_date, end_date))
    results = []
    for r in rows:
        revenue = float(r["revenue"])
        cost = float(r["cost"])
        profit = revenue - cost
        margin = (profit / revenue * 100) if revenue > 0 else 0.0
        results.append({
            "medicine_id": r["medicine_id"],
            "medicine_name": r["medicine_name"],
            "revenue": round(revenue, 2),
            "cost": round(cost, 2),
            "profit": round(profit, 2),
            "margin_pct": round(margin, 2),
        })
    return results


def get_low_stock_medicines(threshold: int | None = None) -> list[dict]:
    if threshold is None:
        # Default behavior: checks every medicine's individual reorder level
        query = """
            SELECT
                m.MedicineId                            AS medicine_id,
                m.Name                                  AS medicine_name,
                m.StockQuantity                         AS stock_quantity,
                m.ReorderLevel                          AS reorder_level,
                (m.ReorderLevel - m.StockQuantity)      AS shortfall,
                sup.SupplierId                          AS supplier_id,
                sup.SupplierName                        AS supplier_name
            FROM Medicines m
            LEFT JOIN Suppliers sup ON sup.SupplierId = m.SupplierId
            WHERE m.ReorderLevel IS NOT NULL
              AND m.StockQuantity <= m.ReorderLevel
            ORDER BY (m.ReorderLevel - m.StockQuantity) DESC
        """
        return fetch_all(query)

    # Optional threshold override if passed from frontend
    query = """
        SELECT
            m.MedicineId                            AS medicine_id,
            m.Name                                  AS medicine_name,
            m.StockQuantity                         AS stock_quantity,
            m.ReorderLevel                          AS reorder_level,
            (m.ReorderLevel - m.StockQuantity)      AS shortfall,
            sup.SupplierId                          AS supplier_id,
            sup.SupplierName                        AS supplier_name
        FROM Medicines m
        LEFT JOIN Suppliers sup ON sup.SupplierId = m.SupplierId
        WHERE m.ReorderLevel IS NOT NULL
          AND m.StockQuantity <= ?
        ORDER BY m.StockQuantity ASC
    """
    return fetch_all(query, (threshold,))


def get_supplier_lead_times(months_back: int = 12) -> list[dict]:
    query = """
        SELECT
            sup.SupplierId                                      AS supplier_id,
            sup.SupplierName                                    AS supplier_name,
            SUM(CASE WHEN po.ActualDeliveryDate IS NOT NULL THEN 1 ELSE 0 END) AS orders_analyzed,
            AVG(CASE WHEN po.ActualDeliveryDate IS NOT NULL
                     THEN CAST(DATEDIFF(DAY, po.OrderDate, po.ActualDeliveryDate) AS FLOAT)
                     END)                                       AS avg_lead_time_days,
            MIN(CASE WHEN po.ActualDeliveryDate IS NOT NULL
                     THEN DATEDIFF(DAY, po.OrderDate, po.ActualDeliveryDate) END) AS min_lead_time_days,
            MAX(CASE WHEN po.ActualDeliveryDate IS NOT NULL
                     THEN DATEDIFF(DAY, po.OrderDate, po.ActualDeliveryDate) END) AS max_lead_time_days,
            SUM(CASE
                    WHEN po.ActualDeliveryDate IS NULL AND po.ExpectedDeliveryDate < GETDATE() THEN 1
                    WHEN po.ActualDeliveryDate IS NOT NULL AND po.ActualDeliveryDate > po.ExpectedDeliveryDate THEN 1
                    ELSE 0
                END)                                            AS late_or_pending_orders
        FROM PurchaseOrders po
        JOIN Suppliers sup ON sup.SupplierId = po.SupplierId
        WHERE po.OrderDate >= DATEADD(MONTH, -?, GETDATE())
        GROUP BY sup.SupplierId, sup.SupplierName
        ORDER BY avg_lead_time_days DESC
    """
    rows = fetch_all(query, (months_back,))
    for r in rows:
        if r["avg_lead_time_days"] is not None:
            r["avg_lead_time_days"] = round(float(r["avg_lead_time_days"]), 2)
    return rows


def get_supplier_medicine_costs(supplier_id: int) -> list[dict]:
    query = """
        SELECT
            m.MedicineId       AS medicine_id,
            m.Name              AS medicine_name,
            AVG(pod.UnitCost)  AS avg_unit_cost,
            MIN(pod.UnitCost)  AS min_unit_cost,
            MAX(pod.UnitCost)  AS max_unit_cost,
            SUM(pod.Quantity)  AS total_quantity_ordered
        FROM PurchaseOrderDetails pod
        JOIN PurchaseOrders po ON po.PurchaseOrderId = pod.PurchaseOrderId
        JOIN Medicines m       ON m.MedicineId = pod.MedicineId
        WHERE po.SupplierId = ?
        GROUP BY m.MedicineId, m.Name
        ORDER BY total_quantity_ordered DESC
    """
    rows = fetch_all(query, (supplier_id,))
    for r in rows:
        r["avg_unit_cost"] = round(float(r["avg_unit_cost"]), 2)
        r["min_unit_cost"] = float(r["min_unit_cost"])
        r["max_unit_cost"] = float(r["max_unit_cost"])
    return rows


def get_top_selling_medicines(start_date: date, end_date: date, limit: int = 10) -> list[dict]:
    query = """
        SELECT TOP (?)
            m.MedicineId                         AS medicine_id,
            m.Name                               AS medicine_name,
            SUM(sd.Qty)                          AS units_sold,
            SUM(sd.TotalPrice)                   AS revenue
        FROM Sales s
        JOIN SaleDetails sd ON sd.SaleId = s.SaleId
        JOIN Medicines m    ON m.MedicineId = sd.MedicineId
        WHERE s.SaleDate >= ? AND s.SaleDate < DATEADD(DAY, 1, ?)
        GROUP BY m.MedicineId, m.Name
        ORDER BY SUM(sd.Qty) DESC
    """
    rows = fetch_all(query, (limit, start_date, end_date))
    for i, r in enumerate(rows, start=1):
        r["rank"] = i
        r["units_sold"] = float(r["units_sold"])
        r["revenue"] = round(float(r["revenue"]), 2)
    return rows


def get_expiring_soon_medicines(days_ahead: int = 90) -> list[dict]:
    query = """
        SELECT
            m.MedicineId    AS medicine_id,
            m.Name           AS medicine_name,
            m.Category      AS category,
            m.StockQuantity AS stock_quantity,
            m.ExpiryDate    AS expiry_date,
            DATEDIFF(DAY, GETDATE(), m.ExpiryDate) AS days_until_expiry
        FROM Medicines m
        WHERE m.ExpiryDate <= DATEADD(DAY, ?, GETDATE())
        ORDER BY m.ExpiryDate ASC
    """
    return fetch_all(query, (days_ahead,))


def get_sales_by_payment_method(start_date: date, end_date: date) -> list[dict]:
    query = """
        SELECT
            ISNULL(s.Method, 'Unspecified')     AS method,
            COUNT(*)                            AS transaction_count,
            SUM(s.NetAmount)                    AS total_net_amount
        FROM Sales s
        WHERE s.SaleDate >= ? AND s.SaleDate < DATEADD(DAY, 1, ?)
        GROUP BY s.Method
        ORDER BY SUM(s.NetAmount) DESC
    """
    rows = fetch_all(query, (start_date, end_date))
    for r in rows:
        r["total_net_amount"] = round(float(r["total_net_amount"]), 2)
    return rows


# =============================================================================
# FASTAPI APP
# =============================================================================

app = FastAPI(
    title="Pharmacy Analytics API",
    description="Profit/loss, low-stock, supplier lead-time, and top-selling "
                "medicine analytics over PharmacyDb (SQL Server).",
    version="2.1.0",
    docs_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Integrate Scalar interactive documentation at /scalar
add_scalar_reference(
    app,
    title="Pharmacy Analytics - Scalar Reference",
)


def _default_date_range(days: int = 30) -> tuple[date, date]:
    end = date.today()
    start = end - timedelta(days=days)
    return start, end


def _resolve_range(start_date: date | None, end_date: date | None) -> tuple[date, date]:
    if start_date is None or end_date is None:
        default_start, default_end = _default_date_range()
        start_date = start_date or default_start
        end_date = end_date or default_end
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be <= end_date")
    return start_date, end_date


def _call(fn, *args, **kwargs):
    """Wraps analytics calls so pyodbc errors become clean HTTP 500s."""
    try:
        return fn(*args, **kwargs)
    except pyodbc.Error as exc:
        logger.exception("Database error in %s", fn.__name__)
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health", response_model=schemas.HealthCheck, tags=["health"])
def health_check():
    connected = check_connection()
    return schemas.HealthCheck(
        status="ok" if connected else "degraded",
        database_connected=connected,
    )


# ---------------------------------------------------------------------------
# Profit & Loss
# ---------------------------------------------------------------------------

@app.get("/analytics/profit-loss", response_model=schemas.ProfitLossSummary, tags=["profit-loss"])
def profit_loss_summary(
    start_date: date = Query(default=None, description="Defaults to 30 days ago"),
    end_date: date = Query(default=None, description="Defaults to today"),
):
    start_date, end_date = _resolve_range(start_date, end_date)
    return _call(get_profit_loss_summary, start_date, end_date)


@app.get(
    "/analytics/profit-loss/by-medicine",
    response_model=list[schemas.ProfitLossByMedicine],
    tags=["profit-loss"],
)
def profit_loss_by_medicine(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
):
    start_date, end_date = _resolve_range(start_date, end_date)
    return _call(get_profit_loss_by_medicine, start_date, end_date, limit)


@app.get(
    "/analytics/loss-making-medicines",
    response_model=list[schemas.ProfitLossByMedicine],
    tags=["profit-loss"],
)
def loss_making_medicines(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
):
    """Medicines sold at a net loss in the period (gross revenue < cost)."""
    start_date, end_date = _resolve_range(start_date, end_date)
    return _call(get_loss_making_medicines, start_date, end_date, limit)


# ---------------------------------------------------------------------------
# Low stock
# ---------------------------------------------------------------------------

@app.get(
    "/analytics/low-stock",
    response_model=list[schemas.LowStockMedicine],
    tags=["inventory"],
)
def low_stock_medicines(
    threshold: int | None = Query(
        default=None,
        ge=0,
        description="Flat cutoff. If omitted, uses each medicine's own "
                    "ReorderLevel (medicines with no ReorderLevel set are "
                    "skipped in that mode).",
    )
):
    return _call(get_low_stock_medicines, threshold)


# ---------------------------------------------------------------------------
# Supplier lead time
# ---------------------------------------------------------------------------

@app.get(
    "/analytics/supplier-lead-time",
    response_model=list[schemas.SupplierLeadTime],
    tags=["suppliers"],
)
def supplier_lead_time(
    months_back: int = Query(default=12, ge=1, le=60, description="Lookback window in months")
):
    return _call(get_supplier_lead_times, months_back)


@app.get(
    "/analytics/suppliers/{supplier_id}/medicine-costs",
    response_model=list[schemas.SupplierMedicineCost],
    tags=["suppliers"],
)
def supplier_medicine_costs(supplier_id: int):
    """What this supplier has actually charged per medicine, across their PO history."""
    return _call(get_supplier_medicine_costs, supplier_id)


# ---------------------------------------------------------------------------
# Most sold medicines
# ---------------------------------------------------------------------------

@app.get(
    "/analytics/top-medicines",
    response_model=list[schemas.TopSellingMedicine],
    tags=["sales"],
)
def top_selling_medicines(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
):
    start_date, end_date = _resolve_range(start_date, end_date)
    return _call(get_top_selling_medicines, start_date, end_date, limit)


# ---------------------------------------------------------------------------
# Bonus: expiring-soon medicines
# ---------------------------------------------------------------------------

@app.get(
    "/analytics/expiring-soon",
    response_model=list[schemas.ExpiringSoonMedicine],
    tags=["inventory"],
)
def expiring_soon(
    days_ahead: int = Query(default=90, ge=1, le=730, description="Window in days")
):
    return _call(get_expiring_soon_medicines, days_ahead)


# ---------------------------------------------------------------------------
# Bonus: sales by payment method
# ---------------------------------------------------------------------------

@app.get(
    "/analytics/sales-by-payment-method",
    response_model=list[schemas.SalesByPaymentMethod],
    tags=["sales"],
)
def sales_by_payment_method(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
):
    start_date, end_date = _resolve_range(start_date, end_date)
    return _call(get_sales_by_payment_method, start_date, end_date)


# ---------------------------------------------------------------------------
# Combined dashboard
# ---------------------------------------------------------------------------

@app.get("/analytics/dashboard", tags=["dashboard"])
def dashboard(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
):
    start_date, end_date = _resolve_range(start_date, end_date)

    return {
        "profit_loss": _call(get_profit_loss_summary, start_date, end_date),
        "low_stock": _call(get_low_stock_medicines, None),
        "supplier_lead_time": _call(get_supplier_lead_times, 12),
        "top_medicines": _call(get_top_selling_medicines, start_date, end_date, 10),
        "expiring_soon": _call(get_expiring_soon_medicines, 90),
    }