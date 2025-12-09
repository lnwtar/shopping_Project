let tags = [];
let uploadedImages = [];
const MAX_IMAGES = 5;

// --- 1. Routing ---
function showPage(pageId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');
    window.scrollTo(0, 0);
}

// --- 2. Tag System Logic ---
const tagsContainer = document.getElementById('tagsContainer');
const tagInput = document.getElementById('tagInput');

function renderTags() {
    // Clear existing tags (except input)
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

// --- 3. Multi-Image Upload Logic ---
const imageInput = document.getElementById('pImage');
const previewArea = document.getElementById('previewArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');

imageInput.addEventListener('change', function () {
    const files = Array.from(this.files);
    const remainingSlots = MAX_IMAGES - uploadedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    if (filesToProcess.length === 0) {
        if (uploadedImages.length >= MAX_IMAGES) alert("Maximum 5 images allowed.");
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
                    <button class="remove-img-btn" onclick="removeImage(${index})">&times;</button>
                `;
        previewArea.appendChild(wrapper);
    });

    // Handle Placeholder & Add More Button
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

// --- 4. Submit & Display Logic ---
document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('pName').value,
        price: document.getElementById('pPrice').value,
        desc: document.getElementById('pDesc').value,
        tags: [...tags], // Copy array
        images: uploadedImages.length > 0 ? uploadedImages : ['https://via.placeholder.com/600x600?text=No+Image']
    };

    localStorage.setItem('newProduct', JSON.stringify(productData));
    loadProductData();
    showPage('product');
});

function loadProductData() {
    const storedData = localStorage.getItem('newProduct');
    if (storedData) {
        const product = JSON.parse(storedData);

        document.getElementById('displayTitle').innerText = product.name;
        document.getElementById('displayPrice').innerText = Number(product.price).toLocaleString() + ' THB';
        document.getElementById('displayDesc').innerText = product.desc;

        // Images
        const images = product.images;
        document.getElementById('displayImg').src = images[0]; // Set Main Image

        // Thumbnails
        const thumbRow = document.getElementById('thumbRow');
        thumbRow.innerHTML = '';
        if (images.length > 1) {
            images.forEach((img, idx) => {
                const thumb = document.createElement('img');
                thumb.src = img;
                thumb.className = `thumb-img ${idx === 0 ? 'active' : ''}`;
                thumb.onclick = function () {
                    document.getElementById('displayImg').src = img;
                    document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active'));
                    this.classList.add('active');
                };
                thumbRow.appendChild(thumb);
            });
        }

        // Tags
        const tagsCont = document.getElementById('displayTags');
        tagsCont.innerHTML = '';
        product.tags.forEach(tag => {
            tagsCont.innerHTML += `<span>${tag}</span>`;
        });
    }
}