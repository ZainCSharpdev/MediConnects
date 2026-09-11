from datetime import date
from typing import Optional
from pydantic import BaseModel


class HealthCheck(BaseModel):
    status: str
    database_connected: bool


class ProfitLossSummary(BaseModel):
    period_start: date
    period_end: date
    total_revenue: float
    total_cost: float
    gross_profit: float
    gross_margin_pct: float
    status:str


class ProfitLossByMedicine(BaseModel):
    medicine_id: int
    medicine_name: str
    revenue: float
    cost: float
    profit: float
    margin_pct: float
    status:str


class LowStockMedicine(BaseModel):
    medicine_id: int
    medicine_name: str
    stock_quantity: int
    reorder_level: int
    shortfall: int
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None


class SupplierLeadTime(BaseModel):
    supplier_id: int
    supplier_name: str
    orders_analyzed: int
    avg_lead_time_days: Optional[float] = None
    min_lead_time_days: Optional[int] = None
    max_lead_time_days: Optional[int] = None
    late_or_pending_orders: int


class SupplierMedicineCost(BaseModel):
    medicine_id: int
    medicine_name: str
    avg_unit_cost: float
    min_unit_cost: float
    max_unit_cost: float
    total_quantity_ordered: int


class TopSellingMedicine(BaseModel):
    rank: int
    medicine_id: int
    medicine_name: str
    units_sold: float
    revenue: float


class ExpiringSoonMedicine(BaseModel):
    medicine_id: int
    medicine_name: str
    category: Optional[str] = None
    stock_quantity: int
    expiry_date: date
    days_until_expiry: int


class SalesByPaymentMethod(BaseModel):
    method: str
    transaction_count: int
    total_net_amount: float