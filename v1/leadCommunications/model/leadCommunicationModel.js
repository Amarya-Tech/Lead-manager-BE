const leadCommunicationTable = `
CREATE TABLE IF NOT EXISTS lead_communication (
    id CHAR(36) PRIMARY KEY,
    lead_id CHAR(36),
    assignee_id CHAR(36),
    description varchar(255),
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
)`;

export default leadCommunicationTable;