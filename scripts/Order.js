import Menu from './Menu.js';

const CARD_KEY = 'cm-cart';

const IDB_NAME = 'cm-storage';
const IDB_VERSION = 1;
const IDB_STORE = 'order';
const IDB_KEY = 'cart';

const Order = {
  cart: [],

  openDB: async () => {
    return await idb.openDB(IDB_NAME, IDB_VERSION, {
      async upgrade(db) {
        await db.createObjectStore(IDB_STORE);
      },
    });
  },

  save: async () => {
    const db = await Order.openDB();
    await db.put(IDB_STORE, JSON.stringify(Order.cart), IDB_KEY);
  },

  load: async () => {
    const db = await Order.openDB();
    const cart = await db.get(IDB_STORE, IDB_KEY);

    if (cart) {
      try {
        Order.cart = JSON.parse(cart);
        Order.render();
      } catch (e) {
        console.error('Data in IndexedDB is corrupted');
      }
    }
  },

  loadWS: () => {
    if (localStorage.getItem(CARD_KEY)) {
      try {
        Order.cart = JSON.parse(localStorage.getItem(CARD_KEY));
        Order.render();
      } catch (e) {
        console.error('Data in Web Storage is corrupted');
      }
    }
  },

  saveWS: () => {
    localStorage.setItem(CARD_KEY, JSON.stringify(Order.cart));
  },
  add: async (id) => {
    const product = await Menu.getProductById(id);
    const results = Order.cart.filter(
      (prodInCart) => prodInCart.product.id == id,
    );
    if (results.length == 1) {
      results[0].quantity++;
    } else {
      Order.cart.push({ product, quantity: 1 });
    }
    Order.render();
  },
  remove: (id) => {
    Order.cart = Order.cart.filter((prodInCart) => prodInCart.product.id != id);
    Order.render();
  },
  place: () => {
    alert(
      'Your order will be ready under the number ' +
        parseInt(Math.random() * 100),
    );
    Order.cart = [];
    Order.render();
  },
  render: () => {
    Order.save();

    if (Order.cart.length == 0) {
      document.querySelector('#order').innerHTML = `
                <p class="empty">Your order is empty</p>
            `;
    } else {
      let html = `
                <h2>Your Order</h2>
                <ul>
            `;
      let total = 0;
      for (let prodInCart of Order.cart) {
        html += `
                    <li>
                        <p class='qty'>${prodInCart.quantity}x</p>
                        <p class='name'>${prodInCart.product.name}</p>
                        <p class='price'>$${prodInCart.product.price.toFixed(
                          2,
                        )}</p>
                        <p class='toolbar'>
                            <span class="navlink material-symbols-outlined" onclick="Order.remove(${
                              prodInCart.product.id
                            })">
                                delete
                            </span>
                        </p>
                    </li>
                `;
        total += prodInCart.quantity * prodInCart.product.price;
      }
      html += `
                        <li>
                            <p class='total'>Total</p>
                            <p class='price-total'>$${total.toFixed(2)}</p>
                        </li>
                    </ul>
                     <button onclick="Order.place()">Place Order</button>
                    `;
      document.querySelector('#order').innerHTML = html;
    }
  },
};
window.Order = Order; // make it "public"
export default Order;
