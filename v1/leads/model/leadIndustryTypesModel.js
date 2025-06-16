const leadIndustryTypeTable = `
CREATE TABLE IF NOT EXISTS lead_industry (
    id CHAR(36) PRIMARY KEY,
    industry_name varchar(255) NOT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

export default leadIndustryTypeTable;