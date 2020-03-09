/* Ali_Mongi - T15-CAPSTONE 
storeCart.js is used to combine functions between store.html cart.html & checkout.html 
*/

// declaration of variables
let products // array map of 9 products
var cart = []; // array of cart items selected
let clicks = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // array to store button clicks
let htmlCartTable; // holds the cart table
let productName, productPrice;
let itemCounter = 0;
let finalBill = 0;
let shippingFee = 0;
let discount = 0;
let invoiceNo;
let coupon = false;

// constructor initializing products
function cartItem(id, name, price, quantity) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
}

// default settings for the store catalogue
function loadStore() {

    // check if this code has run before
    if (localStorage.getItem("storeInitialized") === null) {
        localStorage.setItem("clicks", JSON.stringify(clicks));
        localStorage.setItem("storeInitialized", true);

    } else {
        // map used to hold pricing and product description
        products = new Map();

        products.set("500", 'Bialetti Moka Express Stovetop');
        products.set("29000", 'Expobar Office Leva EB-61');
        products.set("2100", 'Bodum Spare French Press');
        products.set("200", 'Legado Single Origin');
        products.set("80", 'Bean There - Ethiopia Decaf');
        products.set("140", 'Rosetta Nicaragua Buena');
        products.set("50", 'Cofee Culture');
        products.set("340", 'Brew: Better Coffee At Home');
        products.set("360", 'Coffee Obsession');

        clicks = JSON.parse(localStorage.getItem("clicks")); // get -- read
        cart = JSON.parse(localStorage.getItem("cart")); // get -- read  

        $(function() {

            /* here we check if the add to cart button was previously clicked,
            if clicked is true, then alert and change the bg-color */
            for (i = 1; i < clicks.length; i++) {
                let sBtnID = i.toString();
                let sBtn = document.getElementById(sBtnID);

                if (clicks[i] != 1) {
                    $(sBtn).css("background-color", "green").attr('disabled', true);
                }
                if (clicks[i] == 1) {
                    $(sBtn).css("background-color", "darkkhaki").attr('enabled', true);
                }
            }

            // add to cart store listeners();
            $(".btnAddItem").click(function() {

                let btnIndex = this.getAttribute("value"); // get value assigned to each button
                btnIndex = parseInt(btnIndex); // to be used to index the clicks array

                let productID, productName, productPrice;

                // not clicked before
                if (clicks[btnIndex] == 1) {

                    productID = btnIndex;
                    productName = Array.from(products.values())[btnIndex - 1]; // load values from Map
                    productPrice = Array.from(products.keys())[btnIndex - 1];
                    let productQuantity = 1;

                    setAlert(productName, "cartAdd");
                    addToCart(productID, productName, productPrice, productQuantity); // add on to the cart
                }
                // item was already added to the cart
                if (clicks[btnIndex] == 2) {
                    alert("Product was already added to cart!");

                    $(this).css("background-color", "green").attr('disabled', true);
                }
                clicks[btnIndex] = 2;
                localStorage.setItem("clicks", JSON.stringify(clicks)); // set -- write (with added items)
            });
        });
    }
}

// default settings for the cart
function loadCart() {

    // check if this code has run before
    if (localStorage.getItem("cartInitialized") === null) {
        localStorage.setItem("cart", JSON.stringify(cart)); // assign storage with cart as 'key'
        localStorage.setItem("itemCounter", JSON.stringify(itemCounter));
        localStorage.setItem("cartInitialized", true);
    } else {

        clicks = JSON.parse(localStorage.getItem("clicks")); // get -- read 
        cart = JSON.parse(localStorage.getItem("cart")); // get -- read 
        itemCounter = JSON.parse(localStorage.getItem("itemCounter"));

        cart.forEach(function(c, cIndex) {

            populateCartTable(c, cIndex); // append html for cart table
            deleteIndex = cIndex;
            deleteName = c.name;
            computeItems(); // get the count of added items
        });

        let checkoutReady = document.getElementById("btnCheckout");
        let clearCartReady = document.getElementById("btnClearCart");

        // if 1 or more item exists on the cart, enable checkout
        if (itemCounter > 0) {
            checkoutReady.disabled = false;
            clearCartReady.disabled = false;
        }

        // remove listeners() if a cart item is to be removed;
        document.querySelectorAll(".btnRemoveCart").forEach(function(elem) {
            elem.addEventListener("click", function() {

                // remove from array
                let deleteIndex = this.getAttribute("id");
                let deleteName = cart[deleteIndex].name;
                setAlert(deleteName, "cartRemove");
                removeFromCart(deleteIndex);

                // check if previously clicked, revert to default
                let nID = this.getAttribute("name");
                let prodID = parseInt(nID);

                clicks[prodID] = 1;
                localStorage.setItem("clicks", JSON.stringify(clicks));
            });
        });

        computeBill(); // amount currently owed
        computeCartBillDisplay(); // display labels for cart
        computeItems(); // get no of items added

        $(function() {
            // here we insert a listener incase an item quantity is modified
            $(".quantity").change(function() {
                finalBill = 0;

                let qty = this.value; // get new quantity
                let newQty = parseInt(qty);

                let qInd = this.getAttribute("id"); // get its id
                qInd = qInd.substring(1);
                let changeIndex = parseInt(qInd); // index is now used to reference cart.quantity

                cart[changeIndex].quantity = newQty; // replace old with new chosen quantity
                localStorage.setItem("cart", JSON.stringify(cart));

                // recompute the figures 
                computeItems();
                computeBill();
                computeCartBillDisplay();
            });
        });
    }
}

/* here we calculate the bill, price x quantity, for the cart array*/
function computeBill() {

    finalBill = 0;

    for (i = 0; i < cart.length; i++) {
        finalBill += cart[i].price * cart[i].quantity;
    }
}

/* here we count the number of items added i.e. total items in the cart*/
function computeItems() {
    itemCounter = 0;

    for (q = 0; q < cart.length; q++) {
        itemCounter += cart[q].quantity;
    }
    localStorage.setItem("itemCounter", JSON.stringify(itemCounter));
}

/* here we display the no of item and the amount owed*/
function computeCartBillDisplay() {
    // number of items loaded to cart
    let itemsCount = document.getElementById("itemCountText");
    itemsCount.innerHTML = "TOTAL [" + itemCounter + " items]:";

    // display the final bill
    let cartTotal = document.getElementById("cartTotal");
    cartTotal.innerHTML = "R " + finalBill;
}

// creates table for cart
function populateCartTable(c, cIndex) {

    htmlCartTable = document.getElementById("cartTable"); // get the table

    // create row
    let tHeaderRow = document.createElement("TR");
    tHeaderRow.setAttribute("id", "row-" + cIndex);

    // col1 - product name
    let thData = document.createElement("TH");
    thData.innerHTML = c.name;
    tHeaderRow.appendChild(thData);

    // col2 - product price 
    thData = document.createElement("TD");
    thData.innerHTML = c.price;
    tHeaderRow.appendChild(thData);

    // col3 - product quantity 
    thData = document.createElement("TD");
    let tdQuantity = document.createElement("INPUT");
    tdQuantity.setAttribute("type", "number");
    tdQuantity.setAttribute("class", "quantity");
    tdQuantity.setAttribute("min", 1); // positive input only
    tdQuantity.setAttribute("id", "q" + cIndex);
    tdQuantity.setAttribute("style", "width: 50px");
    tdQuantity.setAttribute("value", c.quantity);
    thData.appendChild(tdQuantity);
    tHeaderRow.appendChild(thData);

    // col4 - remove button                     
    // <td> <a href=""> <i class="fas fa-2x fa-window-close"></i> </a> </td>
    thData = document.createElement("TD");
    let tdBtn = document.createElement("BUTTON");
    tdBtn.classList.add("btnRemoveCart");
    tdBtn.setAttribute("name", c.id);
    tdBtn.setAttribute("id", cIndex);
    btnText = document.createTextNode("X");
    tdBtn.appendChild(btnText);
    thData.appendChild(tdBtn);
    tHeaderRow.appendChild(thData);

    htmlCartTable.appendChild(tHeaderRow);
}

// function adds an item to cart when the store add item button is clicked
function addToCart(pID, pName, pPrice, pQuantity) {

    cart = JSON.parse(localStorage.getItem("cart")); // get -- read

    // initialize via constructor
    let anItem = new cartItem(pID, pName, pPrice, pQuantity);
    cart.push(anItem); // add new cart item to end of array
    localStorage.setItem("cart", JSON.stringify(cart)); // set -- write (with added items)

    finalBill = 0;
    computeBill();
    setAlert(finalBill, "issueBIll"); // inform user on current amount owed
}

// function removes an item from cart when remove button is clicked
function removeFromCart(removeIndex) {

    cart.splice(removeIndex, 1); // here we identify an array index to remove (a.k.a table row)
    localStorage.setItem("cart", JSON.stringify(cart)); // set -- write (with removed items)

    htmlCartTable = document.getElementById("cartTable");
    let rowForDeletion = document.getElementById("row-" + removeIndex);
    htmlCartTable.removeChild(rowForDeletion); // here we identify a table row to remove (a.k.a array index)
    /*let rowForDeletion = removeIndex + 1;
    alert("ind " + rowForDeletion.rowIndex);
    htmlCartTable.deleteRow(rowForDeletion.rowIndex);*/
    computeItems();
    let itemsCount = document.getElementById("itemCountText");
    itemsCount.innerHTML = "TOTAL [" + itemCounter + " items]:";
    reloadPage();
}

// default settings for the checkout page
function loadCheckout() {

    itemCounter = JSON.parse(localStorage.getItem("itemCounter")); // get -- read 
    cart = JSON.parse(localStorage.getItem("cart")); // get -- read 
    discount = JSON.parse(localStorage.getItem("discount")); // get -- read  
    shippingFee = JSON.parse(localStorage.getItem("shippingFee")); // get -- read
    coupon = false;

    // get the amount currently owed and display it
    computeBill();
    computeCheckoutBillDisplay();

    // we hide all forms initially apart from default landing form
    $(function() {
        $("#formDeliver, #formCollect, #formCoupon, #formFinal").hide(); // hide forms in checkout page
        $("#btnColDelProceed").hide(); // hide from proceed buton
        $("#cardConfirm").hide(); // hide confirm order section
        $(".orderReady, .orderSuccess").hide();
        $("#icon-credit, #icon-eft, #icon-cod").hide();
    });
}

/* here we display the no of item and the amount owed, and other key details*/
function computeCheckoutBillDisplay() {
    // number of items loaded to checkout
    let itemsCount2 = document.getElementById("itemCountCheck");
    itemsCount2.innerHTML = "No of Items: " + itemCounter;

    // display the final bill on checkout page
    let cartCheckTotal = document.getElementById("cartCheckTotal");
    cartCheckTotal.innerHTML = "Cart Total [R" + (finalBill) + "]";

    // display the discount on checkout page
    if (coupon == true) {
        discount = (0.2 * (finalBill));
        localStorage.setItem("discount", JSON.stringify(discount));

        let couponDiscount = document.getElementById("discountFee");
        couponDiscount.innerHTML = "Discount [-R" + discount + "]";
    } else {
        discount = 0;
        localStorage.setItem("discount", JSON.stringify(discount));

        let couponDiscount = document.getElementById("discountFee");
        couponDiscount.innerHTML = "Discount [R0]";
    }

    let shipFee = document.getElementById("shippersFee");
    shipFee.innerHTML = "Shipping Fee [R" + shippingFee + "]";

    // display the final bill on checkout page
    let totalPaid = document.getElementById("totalPaidCheck");
    totalPaid.innerHTML = "TO PAY: R" + (finalBill - discount + shippingFee);
}

/* function is used to issue all major system alerts */
function setAlert(alertValue, alertType) {
    // add to cart - alert
    if (alertType == "cartAdd") {
        alert("@kofyHouse: \n" + alertValue + " was added to cart!");
    }
    // remove from cart - alert
    if (alertType == "cartRemove") {
        alert("@kofyHouse: \n" + alertValue + " was removed from cart!");
    }
    // get the bill alert
    if (alertType == "issueBIll") {
        alert("@kofyHouse: your current bill R " + alertValue);
    }
    // coupon validation alerts
    if (alertType == "validCoupon") {
        alert("@kofyHouse: \n COUPON: is Valid \n DISCOUNT: 20% off :)");
    }
    if (alertType == "invalidCoupon") {
        alert("@kofyHouse: \n COUPON: not Valid \n Retry New Coupon OR select 'DON'T HAVE' ");
    }
    if (alertType == "dontHaveCoupon") {
        alert("@kofyHouse: \n Be sure to check out for our coupon give-aways next week!");
    }
    // order confirmation alert
    if (alertType == "confirmOrder()") {
        alert("@kofyHouse: \n Your order was successful! \n Reference no is: " + alertValue);
    }
}

// called from clear cart button onclick()
function clearCart() {
    clear("theCart");
}

// handles both cart & checkout clearing
function clear(clearType) {

    cart = JSON.parse(localStorage.getItem("cart"));
    clicks = JSON.parse(localStorage.getItem("clicks"));
    //itemCounter = JSON.parse(localStorage.getItem("itemCounter"));

    // clears cart & checkout
    itemCounter = 0;
    localStorage.setItem("itemCounter", JSON.stringify(itemCounter));

    cart = []; // empty the cart
    localStorage.setItem("cart", JSON.stringify(cart));
    clicks = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // reset the add2cart button clicks
    localStorage.setItem("clicks", JSON.stringify(clicks));

    // clearing the cart display by appending labels
    if (clearType == "theCart") {
        let itemsCount = document.getElementById("itemCountText");
        itemsCount.innerHTML = "TOTAL [" + itemCounter + " items]:";

        let cartTotal = document.getElementById("cartTotal");
        cartTotal.innerHTML = "R0";

        /*let tableRowIndex = 1;
        htmlCartTable = document.getElementById("cartTable");
        let tableLength = htmlCartTable.rows.length;
        tableLength += 1;
        alert(tableLength);
        for (i = 1; i < tableLength; i++) {
            alert(i + "row");
            htmlCartTable.deleteRow(i);
            //htmlCartTable.removeChild(rowForDeletion);
        }*/
        reloadPage();
    }

    // clearing the checkout display by appending labels
    if (clearType == "theCheckout") {
        // display that user has paid after order confrimation on checkout page
        let checkTitle = document.getElementById("checkoutTitle");
        checkTitle.innerHTML = "<b> Invoice: </b>" + invoiceNo;

        let paid = (finalBill - discount + shippingFee);

        // 85% of total
        let subtotal = 0.85 * paid;
        let subtotalC = document.getElementById("subtotalCheck");
        subtotalC.innerHTML = "<b> Sub total: </b> R" + subtotal;

        // 15% of total
        let vat = 0.15 * paid;
        let vatC = document.getElementById("vatCheck");
        vatC.innerHTML = "<b> V.A.T total: </b> R" + vat;

        let totalPaid = document.getElementById("totalPaidCheck");
        totalPaid.innerHTML = "YOU PAID: R" + paid;

        // clears checkout
        discount = 0;
        localStorage.setItem("discount", JSON.stringify(discount));
        shippingFee = 0;
        localStorage.setItem("shippingFee", JSON.stringify(shippingFee));
    }
}

function reloadPage() {
    window.location.reload(true);
}

/* some jQuery */
$(document).ready(function() {

    // checkout button in cart page clicked, push through the url redirect
    $("#btnCheckout").click(function() {
        let checkoutUrl = "checkout.html";
        //window.open(checkoutUrl, "_target");
        window.open(checkoutUrl, "_self");
        $("#formColDel").show();
    });

    // if collection or delivery is selected 
    $("#radioCollect, #radioDeliver").click(function() {
        let process = this.value;

        // for collection process
        if (process == "collect") {
            $("#formDeliver").hide();
            $("#formCollect").show(1500);
            $("#btnColDelProceed").show();

            shippingFee = 0; // collection is free
            localStorage.setItem("shippingFee", JSON.stringify(shippingFee));
            computeCheckoutBillDisplay();
        }
        // for delivery process
        if (process == "deliver") {
            $("#formDeliver").show(1500);
            $("#formCollect").hide();
            $("#btnColDelProceed").show();

            // when a certain payment method is selcted from drop-down menu, show its icon
            $("#selectPay").click(function() {
                if (this.value == "credit") {
                    $("#icon-eft").hide();
                    $("#icon-cod").hide();
                    $("#icon-credit").fadeTo("slow", 0.7);
                }
                if (this.value == "eft") {
                    $("#icon-credit").hide();
                    $("#icon-cod").hide();
                    $("#icon-eft").fadeTo("slow", 0.7);
                }
                if (this.value == "cod") {
                    $("#icon-credit").hide();
                    $("#icon-eft").hide();
                    $("#icon-cod").fadeTo("slow", 0.7);
                }
            });
        }
    });

    // radio buttons for deliveries, compute shipping fee i.e. R60 standard R120 express
    $("#radioStdShip, #radioExpShip").click(function() {
        shippingFee = parseInt(this.value);
        localStorage.setItem("shippingFee", JSON.stringify(shippingFee));
        computeCheckoutBillDisplay();
    });

    // proceed to coupon page
    $("#btnColDelProceed").click(function() {
        // hide previous forms and show the coupon
        $("#btnColDelProceed").hide();
        $("#formCollect").hide();
        $("#formDeliver").hide();
        $("#formColDel").hide();
        $("#formCoupon").fadeIn(2200);
    });

    // button process - if one enters a coupon (valid or invalid)
    $("#btnYesCoupon").click(function() {

        let code = $("#inputCoupon").val();
        if (code == "KH007") // current valid coupon
        {
            setAlert(1, "validCoupon"); // alert valid yes
            coupon = true;
            computeCheckoutBillDisplay(); // can compute the coupon as its now true
            $("#formCoupon").hide();
            $("#formColDel").hide();
            $("#cardConfirm").show();
            $(".orderReady").show();
        }
        if (code != "KH007") {
            setAlert(0, "invalidCoupon");
            $("#formColDel").hide();
        }
        return false; // onsubmit() for form goes false to end submit process
    });

    // button process - if one lacks a coupon
    $("#btnNoCoupon").click(function() {

        setAlert(1, "dontHaveCoupon"); // alert valid no
        coupon = false; // cannot compute the coupon as its now false
        computeCheckoutBillDisplay();
        $("#formCoupon").hide();
        $("#formColDel").hide();
        $("#cardConfirm").show();
        $(".orderReady").show();
        return false; // onsubmit() for form goes false to end submit process
    });

    // when confirm order button is pressed
    $("#btnConfirm").click(function() {
        // hide previous forms and show the final stage confirmation form
        $("#cardConfirm").hide();
        $(".orderReady").hide();
        $(".orderSuccess").show();

        // congratulate user with animated pic that order is complete
        $("#finishGif").animate({ left: "+=1200" }, 3000);
        $("#finishGif").animate({ left: "-=850" }, 2000);

        // generate an invoice number for this payment / checkout session
        invoiceNo = Math.random();
        invoiceNo = "KOFY-" + invoiceNo.toString().substring(2, 11);
        setAlert(invoiceNo, "confirmOrder()");
        clear("theCheckout");
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////

/*function loop() {
    $('#xx').animate({ 'top': '800' }, {
        duration: 1000
    });
}*/
//loop();

/*    function loop() {
    $('#xx').animate({ 'top': '500' }, {
        duration: 1000,
        complete: function() {
            $('#xx').animate({ top: 0 }, {
                duration: 1000,
                complete: loop
            });
        }
    });
}*/