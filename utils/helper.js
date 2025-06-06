export function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const createDynamicUpdateQuery = async(table, condition, req_data)=>{

    let updateQuery = 'UPDATE ' + table + ' SET ';
    let updateValues = [];

    Object.keys(req_data).forEach((key, index, array) => {
    updateQuery += `${key} = ?`;
    updateValues.push(req_data[key]);

    if (index < array.length - 1) {
        updateQuery += ', ';
    }
    });

    updateQuery += ' WHERE ';

    Object.keys(condition).forEach((key, index, array) => {
    updateQuery += `${key} = ?`;
    updateValues.push(condition[key]);

    if (index < array.length - 1) {
        updateQuery += ' AND ';
    }
    });
    return {updateQuery, updateValues};
}