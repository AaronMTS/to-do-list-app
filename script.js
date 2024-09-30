document.addEventListener("DOMContentLoaded", () => {
    addButton = document.querySelector("#btn-add-entry");
    addModal = document.querySelector("#add-modal");
    closeModalButton = document.querySelector("#btn-close-entry");

    addButton.addEventListener("click", () => addModal.style.display = "grid");
    closeModalButton.addEventListener("click", () => addModal.style.display = "none")
});