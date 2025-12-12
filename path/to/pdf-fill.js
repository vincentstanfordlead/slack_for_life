// Event listener for the 'fill and download pdf' button
document.addEventListener('DOMContentLoaded', function () {
    const fillDownloadPdfButton = document.getElementById('fill-download-pdf');
    
    if (fillDownloadPdfButton) {
        fillDownloadPdfButton.addEventListener('click', function () {
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

            async function fillPdf() {
                try {
                    // Use the globally available PDFLib from the CDN
                    const { PDFDocument } = window.pdfLib;
                    
                    // Fetch the blank PDF form
                    const formUrl = 'path/to/blank-form.pdf'; // Replace with actual path
                    const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());

                    // Load the PDFDocument
                    const pdfDoc = await PDFDocument.load(formPdfBytes);

                    // Get the form
                    const form = pdfDoc.getForm();

                    // Fill out the form fields
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
                } catch (error) {
                    console.error('Error filling the PDF form:', error);
                }
            }

            fillPdf();
        });
    } else {
        console.error('Button with ID "fill-download-pdf" not found.');
    }
});