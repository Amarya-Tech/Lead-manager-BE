const tenantTable = `
CREATE TABLE IF NOT EXISTS tenants (
    id CHAR(36) PRIMARY KEY,
    tenant_name varchar(150) DEFAULT NULL,
    onboarding_status boolean DEFAULT FALSE,
    tenant_shortname varchar(15) DEFAULT NULL,
    status ENUM ('basic' , 'pro' , 'closed') DEFAULT 'basic',
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

export default tenantTable;