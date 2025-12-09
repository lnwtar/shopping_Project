document.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
});

function loadCartFromLocalStorage() {
    const cart = JSON.parse(localStorage.getItem('myCart')) || [];
    const container = document.getElementById('checkout-items');

    if (cart.length === 0) {
        showEmptyCart();
        return;
    }

    container.innerHTML = '';
    let subtotal = 0;
    let count = 0;

    cart.forEach((item, index) => {
        const lineTotal = item.price * item.qty;
        subtotal += lineTotal;
        count += item.qty;

        container.innerHTML += `
        <div class="checkout-item">
            <h3>${item.name}</h3>
            <p>฿${item.price} x ${item.qty}</p>
            <p><strong>รวม: ฿${lineTotal}</strong></p>
        </div>`;
    });

    updateSummary(subtotal, count);
}

function updateSummary(total, count) {
    document.getElementById('summary-subtotal').innerText = '฿' + total;
    document.getElementById('summary-total').innerText = '฿' + total;
    document.getElementById('header-cart-count').innerText = count + " ITEMS";
}

function showEmptyCart() {
    document.getElementById('checkout-items').innerHTML = `
        <p>ตะกร้าสินค้าว่างเปล่า</p>
        <a href="main.html">กลับไปเลือกสินค้า</a>
    `;
    updateSummary(0, 0);
}
async function checkout(userId) {
  const res = await fetch(`/cart/checkout/${userId}`, { method: 'POST' });
  const data = await res.json();
  if (data.order_id) {
    alert("Order placed successfully!");
    localStorage.removeItem('myCart');
    window.location.href = "order_success.html";
  } else {
    alert("Checkout failed: " + data.error);
  }
}
