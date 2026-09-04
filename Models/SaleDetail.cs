using System;
using System.Collections.Generic;

namespace PharmacyApi.Models;

public partial class SaleDetail
{
    public int SaleDetailId { get; set; }

    public int SaleId { get; set; }

    public int MedicineId { get; set; }

    public int Qty { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal? TotalPrice { get; set; }

    public virtual Medicine Medicine { get; set; } = null!;

    public virtual Sale Sale { get; set; } = null!;
}
