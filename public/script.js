
// รับ Element ของ Carousel ด้วย ID
const myCarousel = document.getElementById('carouselExampleAutoplaying');

// สร้าง Object Carousel ของ Bootstrap
const carousel = new bootstrap.Carousel(myCarousel, {
    // ตั้งค่า Interval (หน่วงเวลา) ในการเลื่อนอัตโนมัติ
    // ค่านี้คือหน่วยมิลลิวินาที (ms). 5000ms = 5 วินาที
    // ถ้าคุณต้องการให้เลื่อนเร็วขึ้น เช่น ทุก 3 วินาที ให้เปลี่ยนเป็น 3000
    interval: 5000,

    // ตั้งค่าให้เลื่อนวนซ้ำหรือไม่ (true คือวนซ้ำเรื่อยๆ)
    wrap: true
});

/*
 * *** ส่วนเสริม: หยุดการเลื่อนเมื่อผู้ใช้ชี้เมาส์ (Hover) ***
 * ส่วนนี้จะช่วยให้ผู้ใช้มีเวลาอ่านข้อความบน Banner ก่อนที่จะเลื่อนไป
 */
myCarousel.addEventListener('mouseenter', function () {
    carousel.pause(); // สั่งให้หยุดเลื่อน
});

myCarousel.addEventListener('mouseleave', function () {
    carousel.cycle(); // สั่งให้กลับมาเลื่อนอัตโนมัติ
});

