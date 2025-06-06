const leadTable = `
CREATE TABLE IF NOT EXISTS leads (
    id CHAR(36) PRIMARY KEY,
    company_name varchar(100) NOT NULL,
    product varchar(255),
    industry_type ENUM ('energy', 'textile'),
    export_value int,
    insured_amount int,
    created_by char(36) NOT NULL,
    status varchar(30) DEFAULT 'new',
    is_archived boolean DEFAULT FALSE,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
)`;

export default leadTable;