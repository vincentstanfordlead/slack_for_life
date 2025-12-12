document.getElementById('download-json').addEventListener('click', function () {
    // Gather form data
    const formData = {
        firstName: document.getElementById('first-name').value,
        middleName: document.getElementById('middle-name').value,
        lastName: document.getElementById('last-name').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        maritalStatus: document.getElementById('marital-status').checked ? 'Married' : 'Single',
        ssn: document.getElementById('ssn').value,
        nationality: document.getElementById('nationality').value,
        passportNum: document.getElementById('passport-num').value,
        passportExpiry: document.getElementById('passport-expiry').value
    };

    // Convert form data to JSON
    const jsonData = JSON.stringify(formData, null, 2);

    // Create a blob with the JSON data and create a download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-entry.json';
    a.click();
    URL.revokeObjectURL(url);
});