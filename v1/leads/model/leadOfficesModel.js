const leadOfficeTable = `
CREATE TABLE IF NOT EXISTS lead_office (
    id CHAR(36) PRIMARY KEY,
    lead_id CHAR(36),
    address varchar(255),
    city varchar(100),
    district varchar(255),
    country varchar(255),
    postal_code varchar(50),
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
)`;

export default leadOfficeTable;