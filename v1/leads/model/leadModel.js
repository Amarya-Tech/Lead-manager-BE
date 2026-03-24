const leadTable = `
CREATE TABLE IF NOT EXISTS leads (
    id CHAR(36) PRIMARY KEY,
    brand_id CHAR(36),
    company_name varchar(100) NOT NULL,
    product varchar(255),
    industry_type varchar(255),
    tenant_id char(36) NOT NULL,
    export_value int,
    insured_amount int,
    suitable_product varchar(255),
    created_by char(36) NOT NULL,
    status ENUM('lead', 'prospect', 'active prospect', 'customer', 'expired prospect', 'expired lead') DEFAULT 'lead',
    is_archived boolean DEFAULT FALSE,
    assignee CHAR(36), 
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
)`;

export default leadTable;