import pool from "../../../config/db.js";


export const initialTenantSetUp = (array) => {
    try{
        const query = `insert into tenants (id) values (?)`

        return pool.query(query,array);
    }catch(error){
        console.error("Error in executing the tenant setup while creating the user");
        throw error;
    }
}