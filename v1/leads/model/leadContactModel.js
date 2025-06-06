const leadContactTable = `
CREATE TABLE IF NOT EXISTS lead_contact (
    id CHAR(36) PRIMARY KEY,
    lead_id CHAR(36),
    name varchar(255),
    phone bigint,
    alt_phone bigint,
    email varchar(255) NOT NULL,
    created_by char(36) NOT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
)`;

export default leadContactTable;