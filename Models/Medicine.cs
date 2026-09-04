using System;
using System.Collections.Generic;

namespace PharmacyApi.Models;

public partial class Medicine
{
    public int MedicineId { get; set; }

    public string Name { get; set; } = null!;

    public string Category { get; set; } = null!;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public DateTime ExpiryDate { get; set; }

    public decimal? CostPrice { get; set; }

    public int? ReorderLevel { get; set; }

    public int? SupplierId { get; set; }

    public int pack_size_label { get; set; }

    public virtual ICollection<PurchaseOrderDetail> PurchaseOrderDetails { get; set; } = new List<PurchaseOrderDetail>();

    public virtual ICollection<SaleDetail> SaleDetails { get; set; } = new List<SaleDetail>();

    public virtual Supplier? Supplier { get; set; }
}
