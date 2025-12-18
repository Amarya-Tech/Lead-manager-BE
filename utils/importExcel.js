import XLSX from 'xlsx';

export function importExcel(fileBuffer){;

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    const isCheckedData = excelChecks(excelData)
    return isCheckedData;
}

function isValidPhoneNumber(phone) {
  const regex = /^[0-9+\-() ]+$/;
  return regex.test(phone);
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function excelChecks (excelData){

    const requiredFields = [
        'company_name',
        'industry_type',
        'managing_brand',
        'address',
        'phone_number',
        'contact_person',
        'designation',
        'email',
        'assignee',
        'status',
        'suitable_product'
    ];

    const validStatusValues = ['lead', 'prospect', 'active prospect', 'expired lead', 'customer'];
    const validProductValues = ['transport', 'import', 'export'];

    const statusMapping = {
        'new lead': 'lead',
        'lead': 'lead',
        'prospect': 'prospect',
        'active prospect': 'active prospect',
        'expired lead': 'expired lead',
        'customer': 'customer',
        };

    const transformed = excelData.map(obj => {
        const newObj = {};
        for (const key in obj) {
            let newKey = key.toLowerCase().replace(/\s+/g, '_');
            if(key == 'State/province'){ newKey = 'state' }
            if(key == 'Lead status' || key == 'Lead Status'){ newKey = 'status' }
            newObj[newKey] = obj[key];
        }

        const errors = [];
        if (newObj.status) {
           let status = String(newObj.status).toLowerCase().trim();
            if (statusMapping[status]) {
                newObj.status = statusMapping[status];
            } else if (validStatusValues.includes(status)) {
                newObj.status = status;
            } else {
                errors.push(`Invalid status: "${status}"`);
            }
        }

        if (newObj.suitable_product) {
            newObj.suitable_product = String(newObj.suitable_product).toLowerCase();
            if (!validProductValues.includes(newObj.suitable_product)) {
                errors.push(`Invalid suitable_product: "${newObj.suitable_product}"`);
            }
        }

 
        if (!newObj.company_name || newObj.company_name.trim() === '') {
            errors.push("company_name is required");
        }
        if (!newObj.industry_type || newObj.industry_type.trim() === '') {
            errors.push("industry_type is required");
        }
        if (!newObj.managing_brand || newObj.managing_brand.trim() === '') {
            errors.push("managing_brand is required");
        }
        // if (!newObj.address || newObj.address.trim() === '') {
        //     errors.push("address is required");
        // }
        // if (newObj.contact_person && !newObj.designation ) {
        //     errors.push("designation is required");
        // }
        if (newObj.status != 'lead' && !newObj.suitable_product ) {
            errors.push("suitable product is required");
        }
        if (newObj.phone_number){
            if(newObj.phone_number && !isValidPhoneNumber(newObj.phone_number)){
                errors.push("Phone number may contain only digits, +, -, (), and spaces")
            }
            newObj.phone_number = String(newObj.phone_number || "");
        }
        if(newObj.email && !isValidEmail(newObj.email)){
            errors.push("Invalid email format")
        }

        newObj.validation_error = errors.length > 0 ? errors.join('; ') : null;

        requiredFields.forEach(field => {
            if (!(field in newObj)) {
            newObj[field] = '';
            }
        });

        return newObj;
    });

    return transformed
}

export function importCommentExcel(fileBuffer){;

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    const isCheckedData = companyChecksOnExcel(excelData)
    return isCheckedData; 
}

function companyChecksOnExcel (excelData){

    const requiredFields = [
        'company_name',
        'date',
        'user'
    ]
    const transformed = excelData.map(obj => {
        let newObj = {}
        for (const key in obj) {
            const newKey = key.toLowerCase().replace(/\s+/g, '_');
            newObj[newKey] = obj[key];
        }

        const errors = [];
        if (!newObj.company_name || newObj.company_name.trim() === '') {
            errors.push("Company_name is required");
        }
        if (!newObj.date || newObj.date.trim() === '') {
            errors.push("Date is required");
        }
        if (!newObj.user || newObj.user.trim() === '') {
            errors.push("User is required");
        }

        newObj.validation_error = errors;

        requiredFields.forEach(field => {
            if (!(field in newObj)) {
            newObj[field] = '';
            }
        });

        return newObj;
    })

    return transformed;
}