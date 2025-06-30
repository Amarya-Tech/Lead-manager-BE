const leadCommunicationLogsTable = `
CREATE TABLE IF NOT EXISTS lead_communication_logs(
    id CHAR(36) PRIMARY KEY,
    lead_communication_id CHAR(36),
    created_by CHAR(36),
    comment varchar(522),
    action ENUM('COMMENT', 'TO_PROSPECT', 'TO_ACTIVE_PROSPECT', 'TO_CUSTOMER', 'TO_EXPIRE') DEFAULT 'COMMENT',
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_communication_id) REFERENCES lead_communication(id) ON DELETE CASCADE
)`;

export default leadCommunicationLogsTable;