const tagsContainer = document.getElementById('tagsContainer');
const tagInput = document.getElementById('tagInput');
let tags = ['สินค้าขายดี', 'มาใหม่']; // แท็กเริ่มต้น (ตัวอย่าง)

// เริ่มต้นวาดแท็ก
renderTags();

function createTagElement(label) {
    const div = document.createElement('div');
    div.className = 'tag';

    const textSpan = document.createElement('span');
    textSpan.innerText = label;

    const closeSpan = document.createElement('span');
    closeSpan.className = 'tag-close';
    closeSpan.innerHTML = '&times;'; // เครื่องหมายกากบาท
    closeSpan.onclick = function () {
        removeTag(label);
    };

    div.appendChild(textSpan);
    div.appendChild(closeSpan);
    return div;
}

function renderTags() {
    // ล้างแท็กเก่าออก (ยกเว้น input)
    const oldTags = tagsContainer.querySelectorAll('.tag');
    oldTags.forEach(tag => tag.remove());

    // วาดแท็กใหม่จาก Array
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

// Event Listeners
tagInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(tagInput.value);
        tagInput.value = '';
    }
    // ลบแท็กด้วยปุ่ม Backspace เมื่อช่องว่าง
    if (e.key === 'Backspace' && tagInput.value === '' && tags.length > 0) {
        tags.pop();
        renderTags();
    }
});

// ทำให้คลิกที่ว่างๆ ในกล่อง แล้วโฟกัสไปที่ input
tagsContainer.addEventListener('click', function () {
    tagInput.focus();
});