const { Pool } = require("pg");

module.exports = new Pool({
  connectionString:
    "postgresql://sarfi07:seraj2005@localhost:5432/project_inventory_application",
});
