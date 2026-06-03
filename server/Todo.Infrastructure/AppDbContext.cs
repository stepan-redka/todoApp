using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Todo.Infrastructure;

// Inheriting from IdentityDbContext automatically includes tables for users, roles, and logins
public class AppDbContext : IdentityDbContext<IdentityUser> {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}