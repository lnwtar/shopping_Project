// --- 1. Tag System Logic ---
const tagsContainer = document.getElementById('tagsContainer');
const tagInput = document.getElementById('tagInput');
let tags = [];

function renderTags() {
    const oldTags = tagsContainer.querySelectorAll('.tag');
    oldTags.forEach(t => t.remove());

    tags.forEach(tag => {
        const tagEl = document.createElement('div');
        tagEl.className = 'tag';
        tagEl.innerHTML = `${tag} <span class="tag-close" onclick="removeTag('${tag}')">&times;</span>`;
        tagsContainer.insertBefore(tagEl, tagInput);
    });
}

function removeTag(tag) {
    tags = tags.filter(t => t !== tag);
    renderTags();
}

tagInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = tagInput.value.trim().toUpperCase();
        if (val && !tags.includes(val)) {
            tags.push(val);
            renderTags();
        }
        tagInput.value = '';
    }
    if (e.key === 'Backspace' && tagInput.value === '' && tags.length > 0) {
        tags.pop();
        renderTags();
    }
});

// --- 2. Multi-Image Upload Logic ---
const imageInput = document.getElementById('pImage');
const previewArea = document.getElementById('previewArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
let uploadedImages = [];
const MAX_IMAGES = 5;

imageInput.addEventListener('change', function () {
    const files = Array.from(this.files);
    const remainingSlots = MAX_IMAGES - uploadedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    if (filesToProcess.length === 0 && uploadedImages.length >= MAX_IMAGES) {
        alert("Maximum 5 images allowed.");
        return;
    }

    filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImages.push(e.target.result);
            renderImages();
        }
        reader.readAsDataURL(file);
    });
    this.value = ''; // Reset input
});

function renderImages() {
    previewArea.innerHTML = '';

    // Render existing images
    uploadedImages.forEach((imgSrc, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'img-wrapper';
        wrapper.innerHTML = `
            <img src="${imgSrc}" class="preview-img">
            <button type="button" class="remove-img-btn" onclick="removeImage(${index})">&times;</button>
        `;
        previewArea.appendChild(wrapper);
    });

    // Toggle Placeholder & Add More Button
    if (uploadedImages.length > 0) {
        uploadPlaceholder.style.display = 'none';

        // Show "Add More" box if less than max
        if (uploadedImages.length < MAX_IMAGES) {
            const addMore = document.createElement('div');
            addMore.className = 'add-more-box';
            addMore.innerHTML = '<i class="fas fa-plus"></i>';
            addMore.onclick = () => document.getElementById('pImage').click();
            previewArea.appendChild(addMore);
        }
    } else {
        uploadPlaceholder.style.display = 'flex';
    }
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    renderImages();
}

// --- 3. Handle Submit (ตัวอย่างการเก็บค่า) ---
document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('pName').value,
        price: document.getElementById('pPrice').value,
        desc: document.getElementById('pDesc').value,
        tags: [...tags],
        images: uploadedImages
    };

    console.log("Product Data Ready:", productData);
    alert("Product information ready! Check console for data object.");
    // ส่งข้อมูลนี้ไปที่ Backend หรือบันทึกได้เลยครับ
});