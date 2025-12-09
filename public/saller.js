const tagsContainer = document.getElementById('tagsContainer');
const tagInput = document.getElementById('tagInput');
let tags = ['สินค้าขายดี', 'มาใหม่'];

renderTags();

function createTagElement(label) {
    const div = document.createElement('div');
    div.className = 'tag';

    const textSpan = document.createElement('span');
    textSpan.innerText = label;

    const closeSpan = document.createElement('span');
    closeSpan.className = 'tag-close';
    closeSpan.innerHTML = '&times;';
    closeSpan.onclick = function () { removeTag(label); };

    div.appendChild(textSpan);
    div.appendChild(closeSpan);
    return div;
}

function renderTags() {
    const oldTags = tagsContainer.querySelectorAll('.tag');
    oldTags.forEach(tag => tag.remove());
    tags.slice().reverse().forEach(tagLabel => {
        tagsContainer.prepend(createTagElement(tagLabel));
    });
}

function addTag(label) {
    const formattedLabel = label.trim();
    if (formattedLabel && !tags.includes(formattedLabel)) {
        tags.push(formattedLabel);
        renderTags();
    }
}

function removeTag(label) {
    tags = tags.filter(tag => tag !== label);
    renderTags();
}

tagInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(tagInput.value);
        tagInput.value = '';
    }
    if (e.key === 'Backspace' && tagInput.value === '' && tags.length > 0) {
        tags.pop();
        renderTags();
    }
});

tagsContainer.addEventListener('click', function () {
    tagInput.focus();
});


// --- 2. Multiple Image Upload System (Max 5) ---
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');

let uploadedImages = []; // เก็บ Data URL ของรูป
const MAX_IMAGES = 5;

// เมื่อคลิกที่พื้นที่สี่เหลี่ยม ให้เรียก input file ทำงาน (เฉพาะเมื่อคลิกที่ว่างๆ หรือปุ่ม add more)
uploadArea.addEventListener('click', function (e) {
    if (e.target.closest('.remove-img-btn')) return; // ถ้าคลิกปุ่มลบ ไม่ต้องทำอะไร (ปล่อยให้ event ลบทำงาน)

    // ถ้าคลิกโดนพื้นที่ว่าง หรือ ปุ่ม Add More และยังไม่ครบโควต้า
    if (uploadedImages.length < MAX_IMAGES) {
        imageInput.click();
    }
});

// เมื่อมีการเลือกไฟล์ (รองรับหลายไฟล์)
imageInput.addEventListener('change', function () {
    const files = Array.from(this.files);

    // กรองจำนวนไฟล์ที่จะเพิ่มได้
    const remainingSlots = MAX_IMAGES - uploadedImages.length;

    if (remainingSlots <= 0) {
        alert('คุณอัปโหลดรูปภาพครบ 5 รูปแล้ว');
        this.value = ''; // Reset input
        return;
    }

    const filesToProcess = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
        alert(`สามารถเพิ่มได้อีก ${remainingSlots} รูปเท่านั้น ระบบจะเลือกเฉพาะ ${remainingSlots} รูปแรก`);
    }

    // อ่านไฟล์และเพิ่มเข้า Gallery
    filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImages.push(e.target.result);
            renderGallery();
        }
        reader.readAsDataURL(file);
    });

    this.value = ''; // Reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้ถ้าต้องการ
});

function renderGallery() {
    imagePreviewContainer.innerHTML = '';

    if (uploadedImages.length > 0) {
        uploadPlaceholder.style.display = 'none';
        imagePreviewContainer.style.display = 'flex';

        // วาดรูปภาพที่มีอยู่
        uploadedImages.forEach((imgSrc, index) => {
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'img-wrapper';

            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = 'preview-img';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-img-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'ลบรูปภาพ';
            removeBtn.onclick = (e) => {
                e.stopPropagation(); // หยุดการคลิกทะลุไป trigger input file
                removeImage(index);
            };

            imgWrapper.appendChild(img);
            imgWrapper.appendChild(removeBtn);
            imagePreviewContainer.appendChild(imgWrapper);
        });

        // วาดปุ่ม "Add More" ถ้ายังไม่ครบ 5
        if (uploadedImages.length < MAX_IMAGES) {
            const addMoreBtn = document.createElement('div');
            addMoreBtn.className = 'add-more-btn';
            addMoreBtn.innerHTML = `
                        <span style="font-size:24px; margin-bottom: 4px;">+</span>
                        <span>เพิ่มรูป</span>
                    `;
            imagePreviewContainer.appendChild(addMoreBtn);
        }

    } else {
        // ถ้าไม่มีรูป ให้โชว์ Placeholder
        uploadPlaceholder.style.display = 'block';
        imagePreviewContainer.style.display = 'none';
    }
}

function removeImage(index) {
    uploadedImages.splice(index, 1); // ลบรูปจาก Array
    renderGallery(); // วาดใหม่
}