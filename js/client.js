// Import Firebase dependencies
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs,getDoc,doc ,addDoc} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBuIsRGcUGz7v8ozWLcTlyBI-7I5mpXcB0",
    authDomain: "myproject-2d675.firebaseapp.com",
    projectId: "myproject-2d675",
    storageBucket: "myproject-2d675.firebasestorage.app",
    messagingSenderId: "810070575119",
    appId: "1:810070575119:web:ca4f1c2fabd5b6bbf1fb7a",
    measurementId: "G-Y7WS0H7RN8"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// DOM Elements
const categoryFilter = document.getElementById('categoryFilter');
const productContainer = document.getElementById('productContainer');

// Fetch Supplier Name by Supplier ID
const fetchSupplierName = async (supplierId) => {
  try {
    const supplierDoc = await getDoc(doc(db, "suppliers", supplierId));
    return supplierDoc.exists() ? supplierDoc.data().name : "Unknown Supplier";
  } catch (error) {
    console.error(`Error fetching supplier name for ID ${supplierId}:`, error);
    return "Unknown Supplier";
  }
};

// Handle Connect Button Click
const handleConnect = async (product, clientId) => {
  try {
    await addDoc(collection(db, "connections"), {
      clientId,
      supplierId: product.supplierId,
      productId: product.id,
      productName: product.name,
      timestamp: new Date(),
    });
    alert(`You connected with the supplier for the product: ${product.name}`);
  } catch (error) {
    console.error("Error creating connection:", error);
    alert("Failed to connect with the supplier. Please try again later.");
  }
};

// Fetch and Display Products
const fetchAndDisplayProducts = async (selectedCategory = "") => {
  productContainer.innerHTML = ""; // Clear existing products

  // Reference to global "products" collection
  const productsRef = collection(db, "products");

  // Query products based on the selected category
  const q = selectedCategory
    ? query(productsRef, where("category", "==", selectedCategory))
    : productsRef;

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      productContainer.innerHTML = "<p>No products found.</p>";
      return;
    }

    // Fetch and display each product
    for (const docSnap of querySnapshot.docs) {
      const product = { id: docSnap.id, ...docSnap.data() };

      // Fetch supplier name using supplierId
      const supplierName = await fetchSupplierName(product.supplierId);

      // Create Product Card
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="price">€${product.price.toFixed(2)}</p>
        <p>Category: ${product.category}</p>
        <p>Stock: ${product.stock}</p>
        <p>Location: ${product.location}</p>
        <p>Supplier: ${supplierName}</p>
        <button class="connect-btn" data-product-id="${product.id}">Connect</button>
      `;

      productContainer.appendChild(card);

      // Add click event to the Connect button
      const connectBtn = card.querySelector(".connect-btn");
      connectBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (user) {
          await handleConnect(product, user.uid);
        } else {
          alert("Please log in to connect with a supplier.");
        }
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    productContainer.innerHTML = "<p>Error loading products.</p>";
  }
};

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Fetch all products initially
    fetchAndDisplayProducts();

    // Filter products by category
    categoryFilter.addEventListener('change', () => {
      const selectedCategory = categoryFilter.value;
      fetchAndDisplayProducts(selectedCategory);
    });
  } else {
    console.log("No client logged in. Redirecting...");
    window.location.href = "login.html";
  }
});