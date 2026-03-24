import { array } from "three/tsl";
import pool from "../../../config/db.js";


export const getTenantIdQuery = (email) => {
    try{
        const query = `select tenant_id from users where email = ?`;

        return pool.query(query , email)
    }catch(error){
        console.error("Error in executing the getTenantIdQuery");
        throw error;
    }
} 

export const getStartedUserRegistration = (array , email) => {
    try{
        let query = `
            UPDATE users set 
                first_name=?,
                last_name=?,
                password_hash=?,
                phone=?,
                tenant_id=?,
                is_registered=?
            WHERE email = ?
        `;

        return pool.query(query , [...array , email])

    }catch(error){
        console.error("Error in executing the getStartedUserSetup" , error);
        throw error;
    }
}

export const getOtpByEmail = (array) => {
    try{
        let query = `select otp from users where email = ?`;
        return pool.query(query,array);
    }catch(error){
        console.error("Error in executing the getOtpByEmail" , error);
        throw error;
    }
}

export const userEmailVerificationQuery = (array) => {
    try{
        let query = `update users set is_email_verified = ? where email = ?`;

        return pool.query(query,array);
    }catch(error){
        console.error("Error in executing the userEmailVerificationQuery" , error);
        throw error;
    }
}

export const updateOtpQuery = (array) => {
    try{
        let query = `
            update users set 
                otp = ?
            where 
                email = ?
        `;
        return pool.query(query , array);
    }catch(error){
        console.error("Error in executing the updateOtpQuery",error);
        throw error;
    }
}

export const updateOtpForUserQuery = (array) => {
    try{
        let query = `Update users set 
            otp = ?
            where email = ?`;

        return pool.query(query,array);
    }catch(error){
        console.error("Error executing the updateOtpForUserQuery" , error);
        throw error;
    }
}


export const insertOtpQuery = (array) => {
    try{
        let query = `insert into users (
            id,
            email,
            otp
        ) values (?,?,?)`;

        return pool.query(query,array);
    }catch(error){
        console.error("Error executing the insertOtpQuery" , error);
        throw error;
    }
}

export const checkUserEmailQuery = (array)=>{
    try {
        let query = `SELECT * FROM users WHERE email = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing checkUserEmailQuery:", error);
        throw error;
    }
}

export const checkUserEmailAndStatusQuery = (array) => {
    try{
        let query = `Select * from users u left join tenants t on u.tenant_id = t.id where email = ?`;
        return pool.query(query, array);
    }catch(error){
        console.error("Error executing checkUserEmailAndStatusQuery" , error);
        throw error;
    }
}


export const userRegistrationQuery = (array, tenant_id) => {
    try {

        let query;
        let values;

        if (tenant_id) {
            // MULTI TENANT INSERT
            query = `INSERT INTO users (
                id,
                first_name,
                last_name,
                email,
                password_hash,
                phone,
                is_registered,
                role,
                tenant_id
            ) VALUES (?,?,?,?,?,?,?,?,?)`;

            values = [...array, tenant_id];

        } else {
            // NORMAL INSERT
            query = `INSERT INTO users (
                id,
                first_name,
                last_name,
                email,
                password_hash,
                phone,
                role
            ) VALUES (?,?,?,?,?,?,?)`;

            values = array;
        }

        return pool.query(query, values);

    } catch (error) {
        console.error("Error executing userRegistrationQuery:", error);
        throw error;
    }
};


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

export const checkUserExistsBasedOnEmailQuery = (array)=>{
    try {
        let query = `SELECT id, first_name, last_name, email, phone, role, is_active FROM users WHERE email = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing checkUserExistsBasedOnEmailQuery:", error);
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
        let query = `SELECT id, first_name, last_name, email, phone, role, is_active FROM users WHERE is_active = TRUE And tenant_id = ?`
        return pool.query(query, array);
    } catch (error) {
        console.error("Error executing getAllUsersQuery:", error);
        throw error;
    }
}

export const getAllUsersForAmarya = () => {
     try {
        let query = `SELECT id, first_name, last_name, email, phone, role, is_active FROM users`
        return pool.query(query);
    } catch (error) {
        console.error("Error executing getAllUsersQuery:", error);
        throw error;
    }
}

export const getAllUsersQuery = (array)=>{
    try {
        let query = `SELECT id, first_name, last_name, email, phone, role, is_active FROM users where tenant_id = ?`
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