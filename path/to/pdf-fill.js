document.getElementById('download-pdf').addEventListener('click', function () {
    // Gather form data
    const formData = {
        firstName: document.getElementById('first-name').value || '',
        middleName: document.getElementById('middle-name').value || '',
        lastName: document.getElementById('last-name').value || '',
        dob: document.getElementById('dob').value || '',
        gender: document.getElementById('gender').value || '',
        maritalStatus: document.getElementById('marital-status').checked ? 'Married' : 'Single',
        ssn: document.getElementById('ssn').value || '',
        nationality: document.getElementById('nationality').value || '',
        passportNum: document.getElementById('passport-num').value || '',
        passportExpiry: document.getElementById('passport-expiry').value || ''
    };

    // Use a library like pdf-lib or pdfkit to fill out a PDF form
    // Here we assume pdf-lib is used
    import { PDFDocument } from 'pdf-lib';

    async function fillPdf() {
        // Fetch the blank PDF form
        const formUrl = 'path/to/blank-form.pdf'; // Replace with actual path
        const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());

        // Load the PDFDocument
        const pdfDoc = await PDFDocument.load(formPdfBytes);

        // Fill out the form fields
        const form = pdfDoc.getForm();

        form.getTextField('FirstName').setText(formData.firstName);
        form.getTextField('MiddleName').setText(formData.middleName);
        form.getTextField('LastName').setText(formData.lastName);
        form.getTextField('DOB').setText(formData.dob);
        form.getTextField('Gender').setText(formData.gender);
        form.getTextField('MaritalStatus').setText(formData.maritalStatus);
        form.getTextField('SSN').setText(formData.ssn);
        form.getTextField('Nationality').setText(formData.nationality);
        form.getTextField('PassportNum').setText(formData.passportNum);
        form.getTextField('PassportExpiry').setText(formData.passportExpiry);

        // Serialize the PDFDocument to bytes
        const pdfBytes = await pdfDoc.save();

        // Trigger the download of the filled PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filled-form.pdf';
        a.click();
        URL.revokeObjectURL(url);
    }

    fillPdf().catch(console.error);
});