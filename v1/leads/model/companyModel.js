const companyTable = `
CREATE TABLE IF NOT EXISTS companies (
    id CHAR(36) PRIMARY KEY,
    parent_company_name varchar(100) NOT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

export default companyTable;