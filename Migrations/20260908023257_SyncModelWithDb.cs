using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyApi.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelWithDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_POD_Medicine",
                table: "PurchaseOrderDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_SaleDetails_Medicines",
                table: "SaleDetails");

            migrationBuilder.AddForeignKey(
                name: "FK_POD_Medicine",
                table: "PurchaseOrderDetails",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "MedicineId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SaleDetails_Medicines",
                table: "SaleDetails",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "MedicineId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_POD_Medicine",
                table: "PurchaseOrderDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_SaleDetails_Medicines",
                table: "SaleDetails");

            migrationBuilder.AddForeignKey(
                name: "FK_POD_Medicine",
                table: "PurchaseOrderDetails",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "MedicineId");

            migrationBuilder.AddForeignKey(
                name: "FK_SaleDetails_Medicines",
                table: "SaleDetails",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "MedicineId");
        }
    }
}
