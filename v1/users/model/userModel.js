const userTable = `
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(50) DEFAULT NULL,
    last_name VARCHAR(50) DEFAULT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    jwt_token VARCHAR(255) DEFAULT NULL,
    role ENUM('billing_user','admin','user') DEFAULT 'billing_user',
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_registered BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6) DEFAULT NULL,
    tenant_id CHAR(36) DEFAULT NULL,
    brand_id CHAR(36) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
)`;

export default userTable;