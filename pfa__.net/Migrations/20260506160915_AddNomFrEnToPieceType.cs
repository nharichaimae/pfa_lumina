using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace pfa__.net.Migrations
{
    /// <inheritdoc />
    public partial class AddNomFrEnToPieceType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    // // Supprime tout ce qui existait et garde uniquement ça :
    // migrationBuilder.AddColumn<string>(
    //     name: "nom_fr",
    //     table: "piece_type",
    //     type: "varchar(100)",
    //     nullable: false,
    //     defaultValue: "");

    // migrationBuilder.AddColumn<string>(
    //     name: "nom_en",
    //     table: "piece_type",
    //     type: "varchar(100)",
    //     nullable: false,
    //     defaultValue: "");
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropColumn(name: "nom_fr", table: "piece_type");
    migrationBuilder.DropColumn(name: "nom_en", table: "piece_type");
}
}
}
