using System;
using System.Collections.Generic;

namespace PharmacyApi.Models;

public partial class PurchaseOrder
{
    public int PurchaseOrderId { get; set; }

    public int SupplierId { get; set; }

    public DateOnly OrderDate { get; set; }

    public DateOnly ExpectedDeliveryDate { get; set; }

    public DateOnly? ActualDeliveryDate { get; set; }

    public virtual ICollection<PurchaseOrderDetail> PurchaseOrderDetails { get; set; } = new List<PurchaseOrderDetail>();

    public virtual Supplier Supplier { get; set; } = null!;
}
