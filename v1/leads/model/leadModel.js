const leadTable = `
CREATE TABLE IF NOT EXISTS leads (
    id CHAR(36) PRIMARY KEY,
    company_name varchar(100) NOT NULL,
    product varchar(255),
    industry_type varchar (255),
    export_value int,
    insured_amount int,
    suitable_product varchar(255),
    created_by char(36) NOT NULL,
    status ENUM('lead', 'prospect', 'active prospect', 'customer', 'expired prospect', 'expired lead') DEFAULT 'lead',
    is_archived boolean DEFAULT FALSE,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
)`;

export default leadTable;