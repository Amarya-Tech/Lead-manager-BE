import XLSX from 'xlsx';

export default function importExcel(fileBuffer){;

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    const isCheckedData = excelChecks(excelData)
    return isCheckedData;
}

function excelChecks (excelData){

    const requiredFields = [
        'company_name',
        'industry_type',
        'address',
        'phone_number',
        'contact_person',
        'designation',
        'email'
    ];
    const transformed = excelData.map(obj => {
        const newObj = {};
        for (const key in obj) {
            const newKey = key.toLowerCase().replace(/\s+/g, '_');
            newObj[newKey] = obj[key];
        }

        const errors = [];
        if (!newObj.company_name || newObj.company_name.trim() === '') {
            errors.push("company_name is required");
        }
        if (!newObj.industry_type || newObj.industry_type.trim() === '') {
            errors.push("industry_type is required");
        }
        if (!newObj.address || newObj.address.trim() === '') {
            errors.push("address is required");
        }
        if (newObj.contact_person && !newObj.designation ) {
            errors.push("designation is required");
        }
        if (newObj.phone_number){
            newObj.phone_number= newObj.phone_number.replace(/\D/g, '')
        }

        newObj.validation_error = errors.length > 0 ? errors.join('; ') : null;

        requiredFields.forEach(field => {
            if (!(field in newObj)) {
            newObj[field] = '';
            }
        });

        return newObj;
    })

    return transformed
}