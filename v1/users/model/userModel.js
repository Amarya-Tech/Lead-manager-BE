const userTable = `
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    first_name varchar(50) NOT NULL,
    last_name varchar(50) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    phone bigint,
    jwt_token varchar(255),
    role ENUM ('super_admin', 'admin', 'user') DEFAULT 'user',
    is_active boolean DEFAULT TRUE,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES companies(id) ON DELETE CASCADE
)`;

export default userTable;