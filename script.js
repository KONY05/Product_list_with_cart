// FOOD ITEMS GRID VARIABLE
const foodItem_grid = document.querySelector('.food-items_grid');

// CART VARIABLES
const cartSize = document.querySelector('#cartSize');
const cartEmpty = document.querySelector('.cart_empty');
const cartActive = document.querySelector('.cart_active');
const cartItemCollection = document.querySelector('.cart_item_collection');
const confirmBtn = document.querySelector('#confirmBtn');
const priceTotal = document.querySelector('.price_total');


// MODAL VIEW VARIABLES
const overlay = document.querySelector('.overlay');
const modalView = document.querySelector('.modal');
const customerOrder = document.querySelector('.customer_order');
const modalPriceTotal = document.querySelector('.modal-price_total');
const newOrderBtn = document.querySelector('#new_orderBtn');

const body = document.querySelector('body');

// JSON file data
let jsonData, purchase;
let cartAmount = 0;

let userCart = [];


class UserOrder {
    _orderTotal = 0;
    _confirmBtnClicked = 0;
    _itemAmt = 1;


    constructor() {
        //get JSON file
        this._getJSON();

        body.addEventListener('click', this._cartBtnClick.bind(this));

        body.addEventListener('click', this._removeFromCart.bind(this));

        confirmBtn.addEventListener('click', this._openModal.bind(this));

        body.addEventListener('click', this._closeModal.bind(this));

        newOrderBtn.addEventListener('click', this._init.bind(this));
    }

    _getJSON() {
        fetch('./data.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to load file 💥💥');
                }
                return res.json();
            })
            .then(data => {
                jsonData = data;
            
                // render grid user
                this._renderFoodItems();
            })
            .catch(error => {
                console.error('Error loading JSON file 💥💥:', error);
            })
    }

    _renderFoodItems() {
        jsonData.forEach(el => {
            
            const html = `<div class="food-item">
          <div class="food-item_img" data-name="${el.category}">
            <img class="food-item-img" src='${el.image.desktop}' alt="${el.name}">
          </div>
          <button class="addtocartBtn"><img class="cart-icon" src="assets/images/icon-add-to-cart.svg" alt=""> Add to Cart</button>

          <div class="food_info">
            <p class="food_category">${el.category}</p>
            <p class="food_name">${el.name}</p>
            <p class="food_price">$${el.price.toFixed(2)}</p>
          </div>
        </div>`;
            
            foodItem_grid.insertAdjacentHTML("beforeend", html);
        });  
    }

    _cartBtnClick(e) {
        if (e.target.classList.contains('addtocartBtn') || e.target.classList.contains('cart-icon')) {
            
            cartSize.innerHTML = '';

            let addtocartBtn = e.target;

            // find the closest div to the target element
            let closestDiv = addtocartBtn.closest('div');
            
            // get the text element to use it to find the object related to it in the json file
            const getProperty = closestDiv.querySelector('.food_category').innerHTML;
            
            const result = jsonData.find(item => item.category === getProperty);
            
            // add item to cart and activate element image
            this._addtocartMarkup(result);
            
            this._activateItem(closestDiv);
            
            cartSize.innerHTML = cartAmount;
        }
    }

    _activateItem(el) {
        // get element and activate the image
        const image = el.querySelector('.food-item-img');
        image.classList.add('activeItem');
    }

    _addtocartMarkup(el) {
        cartEmpty.classList.add('hidden');
        cartActive.classList.remove('hidden');

        // check if element entering is already present in the userCart
        const existingItem = userCart.some(item => item.name === el.name);

        if (existingItem) return;
        
        const itemTotal = el.price * this._itemAmt;
        
        // creating objects to push to userCart array and increasing cartAmount
        purchase = {
            name: el.name,
            itemAmount: this._itemAmt,
            price: el.price,
            total: itemTotal,
            thumbnail: el.image.thumbnail,
            category: el.category
        }
        
        userCart.push(purchase);
        cartAmount++;
        
        const html = `<div class="cart_item">
              <div class="cart_info">
                <p class="item_name" data-cat="${el.category}">${el.name}</p>
                <div class="item_priceList">
                  <p class="quantity"><span class="item_quantity">${this._itemAmt}</span>x</p>
                  <p class="price"><span id="commat">&commat;</span>&dollar;<span class="item_price">${el.price.toFixed(2)}</span></p>
                  <p class="quantity_price">&dollar;<span class="item_quantity_price">${itemTotal.toFixed(2)}</span></p>
                </div>
              </div>
            
              <div class="remove_iconBtn">
                <svg class="remove_icon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path class="removeIcon" fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>
              </div>

            </div>`;
        
        // increasing order total anytime a new item enters the cart
        this._orderTotal += itemTotal;

        priceTotal.innerHTML = this._orderTotal.toFixed(2);
        
        cartItemCollection.insertAdjacentHTML('beforeend', html);
    }

    _deactivateItem(elem) {
        // find item name
        const imageSelector = elem.querySelector('.item_name');

        // get category dataset using the item name
        const imageCat = imageSelector.dataset.cat;
        
        // get the image using the dataset given to its item and remove active class
        const image = document.querySelector(`[data-name="${imageCat}"]`);
        
        image.querySelector('.food-item-img').classList.remove('activeItem');
    }

    _removeFromCart(e) {
        if (e.target.classList.contains('remove_iconBtn') || e.target.classList.contains('remove_icon')) {
            // get div closest to target element
            const itemElem = e.target.closest('.cart_item');

            // remove element from user cart and deactivate the image
            this._removeFromArray(itemElem);
            
            this._deactivateItem(itemElem);

            // remove item from DOM and reduce cartAmount
            itemElem.remove();

            cartAmount--;
            cartSize.innerHTML = cartAmount;
            
            const price = itemElem.querySelector('.item_price').innerHTML;
            
            this._orderTotal -= price;
            
            priceTotal.innerHTML = this._orderTotal.toFixed(2);
            
            // trigger when cart is empty
            if (cartAmount === 0) {
                this._orderTotal = 0;
                cartEmpty.classList.remove('hidden');
                cartActive.classList.add('hidden');
                userCart = [];
            }
        }
    }

    _removeFromArray(elem) {
        // get item name
        const item = elem.querySelector('.item_name');

        // get category dataset using the item's name
        const getProperty = item.dataset.cat;

        // get index to use to delete the exact item from userCart array
        const index = userCart.findIndex(item => item.category === getProperty);

        if (index === -1) return;
        userCart.splice(index, 1);
    }

    _openModal() {
        overlay.classList.remove('hidden');
        modalView.classList.remove('hidden');
        body.classList.add('body_overlay');
    
        this._renderModalView();
    }

    _renderModalView() {
        let html, userModalCart;
        
        // new array that removes all duplicate items from the userCart array
        userModalCart = userCart.filter((item, index, self) => index === self.findIndex(i => i.name === item.name));
        
        customerOrder.innerHTML = '';
        
        userModalCart.forEach(el => {

            html = `<div class="modal_cart-item">
            <div class="order_info">
              <img class="modal_thumbnail" src="${el.thumbnail}" alt="${el.name}-thumbnail">
              <div class="cart_info">
                <p class="item_name">${el.name}</p>
                <div class="item_priceList">
                  <p class="quantity"><span class="item_quantity">${el.itemAmount}</span>x</p>
                  <p class="price"><span id="commat">&commat;</span>&dollar;<span class="item_price">${el.price.toFixed(2)}</span></p>
                </div>
              </div>
            </div>
          
            <p class="modal-quantity_price">&dollar;<span class="item_quantity_price">${el.total.toFixed(2)}</span></p>
          </div>`;
        
            customerOrder.insertAdjacentHTML('beforeend', html);
        })

        modalPriceTotal.innerHTML = priceTotal.innerHTML;
    }

    _closeModal(e) {
        if (e.target.classList.contains('overlay') || e.target.classList.contains('new_orderBtn')) {
            overlay.classList.add('hidden');
            modalView.classList.add('hidden');
            body.classList.remove('body_overlay'); 
        }
    }

    _init() {
        // sets all elements back to default
        this._orderTotal = 0;
        cartAmount = 0;

        cartEmpty.classList.remove('hidden');
        cartActive.classList.add('hidden');
        
        customerOrder.innerHTML = '';
        cartItemCollection.innerHTML = '';

        userCart = [];
        cartSize.innerHTML = userCart.length;

        this._deactivateAllItems();
    }

    _deactivateAllItems() {
        // removes all elements that have the active class
        const items = foodItem_grid.querySelectorAll('.food-item-img');

        items.forEach(img => {
            img.classList.remove('activeItem');
        })
    }
}

const user = new UserOrder();