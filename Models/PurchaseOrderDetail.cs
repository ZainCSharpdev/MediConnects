using System;
using System.Collections.Generic;

namespace PharmacyApi.Models;

public partial class PurchaseOrderDetail
{
    public int PurchaseOrderDetailId { get; set; }

    public int PurchaseOrderId { get; set; }

    public int MedicineId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }

    public virtual Medicine Medicine { get; set; } = null!;

    public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;
}
