import XLSX from 'xlsx';

export default function importExcel(){
    const excelFilePath = 'G:/testing sheet.xlsx';

    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    console.log(sheetName)
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    console.log(excelData);
    return excelData;
    }

