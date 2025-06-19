import pool from "../../../config/db.js"

export const checkUserEmailQuery = (array)=>{
    try {
        let query = `SELECT * FROM users WHERE email = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing checkUserEmailQuery:", error);
        throw error;
    }
}

export const userRegistrationQuery = (array)=> {
    try {
        let query = `INSERT INTO users (
            id,
            first_name,
            last_name,
            email,
            password_hash,
            phone,
            role
        ) VALUES (?,?,?,?,?,?,?)`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing userRegistrationQuery:", error);
        throw error;
    }
}

export const updateTokenQuery = (array) => {
    try {
        let query = `UPDATE users SET jwt_token = ? WHERE id = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing updateTokenQuery:", error);
        throw error;
    }
}

export const checkUserIdQuery = (array)=>{
    try {
        let query = `SELECT id, first_name, last_name, email, phone, role, is_active, password_hash, created_at, updated_at FROM users WHERE id = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing checkUserEmailQuery:", error);
        throw error;
    }
}

export const updateUserActiveStatusQuery = (array) => {
    try {
        let query = `UPDATE users SET is_active = ? WHERE id = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing updateUserActiveStatusQuery:", error);
        throw error;
    }
}

export const updateUserRoleQuery = (array) => {
    try {
        let query = `UPDATE users SET role = ? WHERE id = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing updateUserRoleQuery:", error);
        throw error;
    }
}

export const getAllActiveUsersQuery = (array)=>{
    try {
        let query = `SELECT id, first_name, last_name, email, phone, role, is_active FROM users WHERE is_active = TRUE`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing getAllUsersQuery:", error);
        throw error;
    }
}

export const getAllUsersQuery = (array)=>{
    try {
        let query = `SELECT id, first_name, last_name, email, phone, role, is_active FROM users`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing getAllUsersQuery:", error);
        throw error;
    }
}

export const updateUserQuery = async (query,array) => {
    try {
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing updateUserQuery:", error);
        throw error;
    }
}