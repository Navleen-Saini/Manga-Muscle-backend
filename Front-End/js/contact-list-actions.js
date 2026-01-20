document.addEventListener('DOMContentLoaded', () => {
    
    //Handling the deltet logic
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const button = e.target.closest('.delete-btn');
            const userId = button.getAttribute('data-id');

            if (confirm('Are you sure you want to permanently delete this user?')) {
                try {
                    const response = await fetch(`/contacts/${userId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        const row = button.closest('tr');
                        row.remove();
                        alert('User deleted successfully.');
                    } else {
                        alert('Failed to delete user.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred while deleting.');
                }
            }
        });
    });

    //Update Logic
    const modal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const cancelBtn = document.getElementById('cancelEdit');
    const editButtons = document.querySelectorAll('.edit-btn');

    //new values
    const inputId = document.getElementById('editUserId');
    const inputName = document.getElementById('editName');
    const inputEmail = document.getElementById('editEmail');
    const inputPlan = document.getElementById('editPlan');

    //change values
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('.edit-btn');
            
            //getting form data from pug
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const email = button.getAttribute('data-email');
            const plan = button.getAttribute('data-plan');

            inputId.value = id;
            inputName.value = name;
            inputEmail.value = email;
            inputPlan.value = plan || 'basic'; // Default to basic if null

            modal.classList.remove('hidden');
        });
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = inputId.value;
        const updatedData = {
            name: inputName.value,
            email: inputEmail.value,
            planId: inputPlan.value
        };

        try {
            const response = await fetch(`/contacts/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert('User updated successfully!');
                modal.classList.add('hidden');
                location.reload();
            } else {
                const errorData = await response.json();
                alert(`Update failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating.');
        }
    });
});