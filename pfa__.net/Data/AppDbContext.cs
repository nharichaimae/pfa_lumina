using Microsoft.EntityFrameworkCore;
using pfa__.net.Models;

namespace pfa__.net.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Piece> Pieces { get; set; }
        public DbSet<PieceType> PieceTypes { get; set; }
        public DbSet<Equipement> Equipements { get; set; }
        public DbSet<EquipementType> EquipementTypes { get; set; }
        public DbSet<Regle> Regles { get; set; }
        public DbSet<ConditionHistorique> ConditionHistoriques { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PieceType>()
                .HasKey(pt => pt.id_type);

            modelBuilder.Entity<EquipementType>()
                .HasKey(et => et.id_type);

            modelBuilder.Entity<Piece>()
                .HasKey(p => p.Id_Piece);
            modelBuilder.Entity<Piece>()
                .Property(p => p.Id_Piece)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Equipement>()
                .HasKey(e => e.Id_Equipement);
            modelBuilder.Entity<Equipement>()
                .Property(e => e.Id_Equipement)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Piece>()
                .HasOne(p => p.PieceType)
                .WithMany(t => t.Pieces)
                .HasForeignKey(p => p.type_id)
                .HasPrincipalKey(pt => pt.id_type)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Equipement>()
                .HasOne(e => e.EquipementType)
                .WithMany()
                .HasForeignKey(e => e.type_id)
                .HasPrincipalKey(et => et.id_type)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Piece>()
                .HasMany(p => p.Equipements)
                .WithOne(e => e.Piece)
                .HasForeignKey(e => e.Id_Piece)
                .OnDelete(DeleteBehavior.Cascade);

            // --- Regle ---
            modelBuilder.Entity<Regle>(entity =>
            {
                entity.ToTable("regle");
                entity.HasKey(r => r.IdRegle);

                entity.Property(r => r.IdRegle)
                      .HasColumnName("id_regle")
                      .ValueGeneratedOnAdd();

                entity.Property(r => r.DateRegle)
                      .HasColumnName("dateRegle");

                entity.Property(r => r.ChaqueJour)
                      .HasColumnName("chaque_jour");

                entity.Property(r => r.IdEquipement)
                      .HasColumnName("id_equipement");

                // ✅ Une seule fois, type correct
                entity.Property(r => r.HeureDebut)
                      .HasColumnName("heureDebut")
                      .HasColumnType("time");

                // ✅ Une seule fois, type correct
                entity.Property(r => r.HeureFin)
                      .HasColumnName("heureFin")
                      .HasColumnType("time");

                entity.HasOne(r => r.Equipement)
                      .WithMany(e => e.Regles)
                      .HasForeignKey(r => r.IdEquipement)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // --- ConditionHistorique ---
            modelBuilder.Entity<ConditionHistorique>(entity =>
            {
                entity.ToTable("condition_historique");
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Id)
                      .HasColumnName("id")
                      .ValueGeneratedOnAdd();

                entity.Property(c => c.IdRegle)
                      .HasColumnName("id_regle");

                entity.Property(c => c.Valeur)
                      .HasColumnName("valeur");

                entity.Property(c => c.DateHeure)
                      .HasColumnName("date_heure");

                entity.Property(c => c.Source)
                      .HasColumnName("source")
                      .HasDefaultValue("auto");

                entity.HasOne(c => c.Regle)
                      .WithMany(r => r.ConditionHistoriques)
                      .HasForeignKey(c => c.IdRegle)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}