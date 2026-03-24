const brandTable = `
CREATE TABLE IF NOT EXISTS brands (
    id CHAR(36) PRIMARY KEY,
    tenant_id char(36) NOT NULL,
    brand_name varchar(100) NOT NULL,
    is_active boolean DEFAULT TRUE,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
)`;

export default brandTable;