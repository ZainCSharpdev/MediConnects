using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyApi.Migrations
{
    public partial class CascadeDeleteMedicines : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaleDetails_Medicines",
                table: "SaleDetails");

            migrationBuilder.AddForeignKey(
                name: "FK_SaleDetails_Medicines",
                table: "SaleDetails",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "MedicineId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropForeignKey(
                name: "FK_POD_Medicine",
                table: "PurchaseOrderDetails");

            migrationBuilder.AddForeignKey(
                name: "FK_POD_Medicine",
                table: "PurchaseOrderDetails",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "MedicineId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaleDetails_Medicines",
                table: "SaleDetails");

            migrationBuilder.AddForeignKey(
                name: "FK_SaleDetails_Medicines",
                table: "SaleDetails",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "MedicineId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.DropForeignKey(
                name: "FK_POD_Medicine",
                table: "PurchaseOrderDetails");

            migrationBuilder.AddForeignKey(
                name: "FK_POD_Medicine",
                table: "PurchaseOrderDetails",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "MedicineId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
