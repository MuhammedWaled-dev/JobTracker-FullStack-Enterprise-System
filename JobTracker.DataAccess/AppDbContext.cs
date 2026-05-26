using Microsoft.EntityFrameworkCore;
using JobTracker.Models.Entities;
using JobTracker.Models.Enums;

namespace JobTracker.DataAccess
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<TaskItem> Tasks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── User ─────────────────────────────────────────────────────────
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Id).ValueGeneratedOnAdd();
                entity.Property(u => u.Name).IsRequired().HasMaxLength(150);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(200);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Role)
                      .IsRequired()
                      .HasConversion<string>();
            });

            // ── Project ───────────────────────────────────────────────────────
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id).ValueGeneratedOnAdd();
                entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Description).HasMaxLength(1000);
                entity.Property(p => p.CreatedAt).IsRequired();

                // User -> Projects (One-to-Many)
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(p => p.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ── TaskItem ──────────────────────────────────────────────────────
            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Id).ValueGeneratedOnAdd();
                entity.Property(t => t.Title).IsRequired().HasMaxLength(300);
                entity.Property(t => t.Description).HasMaxLength(2000);
                entity.Property(t => t.CreatedAt).IsRequired();
                entity.Property(t => t.Status)
                      .IsRequired()
                      .HasConversion<string>();

                // Project -> Tasks (One-to-Many, Cascade Delete)
                entity.HasOne<Project>()
                      .WithMany()
                      .HasForeignKey(t => t.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                // User -> AssignedTasks (One-to-Many, Restrict Delete)
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(t => t.AssignedUserId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
