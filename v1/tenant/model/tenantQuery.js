import pool from "../../../config/db.js";

export const getTenantNameQuery = async (array) => {
    try{

        const query =  `select tenant_name from tenants where tenant_name = ?`;

        return pool.query(query,array)
    }catch(error){
        console.error("Error in executing the getTenantNameQuery", error);
        throw error;
    }
}


export const createTenant = async (array , id) => {
    try{

        const query = `
                UPDATE tenants 
                    set tenant_name = ?,
                    tenant_shortname = ?,
                    onboarding_status = ?
                    where id = ?`;

        return pool.query(query , [...array , id])
    }catch(error){
        console.error("Error in executing the createTenant" , error);
        throw error;
    }
}