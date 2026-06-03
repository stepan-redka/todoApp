using Dapper;
using Microsoft.Data.SqlClient;

namespace Todo.Infrastructure.Data;

public class DbInitializer
{
    private readonly string _connectionString;

    public DbInitializer(string connectionString)
    {
        _connectionString = connectionString;
    }

    public void Initialize()
    {
        // 1. Create the database if it doesn't exist
        var builder = new SqlConnectionStringBuilder(_connectionString);
        var targetDatabase = builder.InitialCatalog;

        // Connect to 'master' database first to run the database creation query
        builder.InitialCatalog = "master";

        using (var masterConnection = new SqlConnection(builder.ConnectionString))
        {
            masterConnection.Open();

            var checkDbQuery =
                "SELECT database_id FROM sys.databases WHERE name = @DbName";

            var dbId = masterConnection.ExecuteScalar<int?>(
                checkDbQuery,
                new { DbName = targetDatabase });

            if (dbId == null)
            {
                // Create the database
                masterConnection.Execute(
                    $"CREATE DATABASE [{targetDatabase}]");
            }
        }

        // 2. Create the table in our target database if it doesn't exist
        using (var connection = new SqlConnection(_connectionString))
        {
            connection.Open();

            var createTableSql = @"
                IF NOT EXISTS (
                    SELECT *
                    FROM sys.objects
                    WHERE object_id = OBJECT_ID(N'[dbo].[Todos]')
                      AND type IN (N'U')
                )
                BEGIN
                    CREATE TABLE [dbo].[Todos]
                    (
                        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
                        [Title] NVARCHAR(200) NOT NULL,
                        [Description] NVARCHAR(MAX) NULL,
                        [Status] INT NOT NULL,
                        [Priority] INT NOT NULL DEFAULT 0,
                        [Deadline] DATETIME2 NULL,
                        [CreatedAt] DATETIME2 NOT NULL,
                        [UpdatedAt] DATETIME2 NULL,
                        [UserId] NVARCHAR(450) NOT NULL DEFAULT ''
                    )
                END
                ELSE
                BEGIN
                    IF NOT EXISTS (
                        SELECT * FROM sys.columns 
                        WHERE object_id = OBJECT_ID(N'[dbo].[Todos]') 
                        AND name = 'UserId'
                    )
                    BEGIN
                        ALTER TABLE [dbo].[Todos] ADD [UserId] NVARCHAR(450) NOT NULL DEFAULT '';
                    END
                END";

            connection.Execute(createTableSql);
        }
    }
}