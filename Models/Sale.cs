using System;
using System.Collections.Generic;

namespace PharmacyApi.Models;

public partial class Sale
{
    public int SaleId { get; set; }

    public DateTime SaleDate { get; set; }

    public string Invoice { get; set; } = null!;

    public string CustomerName { get; set; } = null!;

    public decimal TotalAmount { get; set; }

    public decimal? Discount { get; set; }

    public decimal NetAmount { get; set; }

    public string Method { get; set; } = null!;

    public virtual ICollection<SaleDetail> SaleDetails { get; set; } = new List<SaleDetail>();
}
