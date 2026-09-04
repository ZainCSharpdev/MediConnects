using System;
using System.Collections.Generic;

namespace PharmacyApi.Models;

public partial class Customer
{
    public int CustomerId { get; set; }

    public string? Name { get; set; }

    public string? Phone { get; set; }

    public string? Number { get; set; }
}
