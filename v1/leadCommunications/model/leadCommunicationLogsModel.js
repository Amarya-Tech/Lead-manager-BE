const leadLogsTable = `
CREATE TABLE IF NOT EXISTS lead_logs(
    id CHAR(36) PRIMARY KEY,
    lead_id CHAR(36) NOT NULL,
    created_by CHAR(36),
    comment varchar(522),
    action ENUM('COMMENT', 'TO_PROSPECT', 'TO_ACTIVE_PROSPECT', 'TO_CUSTOMER', 'TO_EXPIRE', 'FOLLOW_UP', 'ASSIGNED', 'CREATE_LEAD') DEFAULT 'COMMENT',
    action_date DATE,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
)`;

export default leadLogsTable;