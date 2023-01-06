document.addEventListener("DOMContentLoaded", function(event) {
    const fileInput = document.querySelector('#file-input');
    console.log(fileInput)

    // Clear file input value on click
    fileInput.addEventListener('click', (event) => {
        this.value = null;
    });

    // Upload file when selected
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        console.log("Uploaded file " + file.name);

        const formData = new FormData();
        formData.append('file', file);

        fetch('/process-star-data', {
            method: 'POST',
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle the response data as needed
                console.log(data);
            })
            .catch((error) => {
                console.error(error);
            });
    });
});