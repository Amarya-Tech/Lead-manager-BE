const tenantTable = `
CREATE TABLE IF NOT EXISTS tenants (
    id CHAR(36) PRIMARY KEY,
    tenant_name varchar(100) NOT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

export default tenantTable;