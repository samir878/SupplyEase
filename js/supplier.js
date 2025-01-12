 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
 import { getAuth, onAuthStateChanged ,createUserWithEmailAndPassword,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
 import{getFirestore ,addDoc,collection,serverTimestamp ,setDoc,doc,getDocs,query,where,getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();



// Add a new product
document.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form data
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const category = document.getElementById("productCategory").value;
  const location = document.getElementById("location").value.trim();
  const stock = parseInt(document.getElementById("stock").value);
  // const rating = parseInt(document.getElementById("rating").value);

  // Check if a user is logged in
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const supplierId = user.uid;
      const productData = {
        name,
        description,
        price,
        category,
        location,
        stock,
        //rating,
        supplierId,
        createdAt: serverTimestamp(),
        imageUrl: null, // Placeholder for an image URL
      };

      try {
        // 1. Add product to the supplier's subcollection
        const supplierProductsRef = collection(
          db,
          "suppliers",
          supplierId,
          "products"
        );
        const productDoc = await addDoc(supplierProductsRef, productData);

        // 2. Add product to the category's subcollection
        const categoryProductsRef = collection(
          db,
          "categories",
          category,
          "products"
        );
        await setDoc(doc(categoryProductsRef, productDoc.id), productData);

        // 3. Add product to the global "products" collection
        const globalProductsRef = collection(db, "products");
        await setDoc(doc(globalProductsRef, productDoc.id), productData);

                  document.getElementById("name").value='';
                  document.getElementById("description").value='';
                 document.getElementById("price").value='';
                //  document.getElementById("productCategory").value='';
                  document.getElementById("location").value='';
                    document.getElementById("stock").value='';
                  //  document.getElementById("rating").value='';
        alert("Product added successfully!");
      } catch (error) {
        console.error("Error adding product:", error);
        alert("Failed to add product. Please try again.");
      }
    } else {
      alert("You must be logged in to add a product.");
    }
  });
});


//get data



const cardContainer = document.getElementById("cardContainer");

// Function to display products as cards
function displayProductsAsCards(products) {
  // Clear existing cards
  cardContainer.innerHTML = "";

  products.forEach((product) => {
    // Create card element
    const card = document.createElement("div");
    card.className = "card";

    // Add product details to the card
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p><strong>Description:</strong> ${product.description}</p>
      <p><strong>Category:</strong> ${product.category}</p>
      <p><strong>Price:</strong> <span class="price">€${product.price.toFixed(2)}</span></p>
      <p><strong>Stock:</strong> ${product.stock}</p>
    `;

    // Append card to container
    cardContainer.appendChild(card);
  });
}

// Function to get products for the logged-in supplier
async function getProductsForLoggedInSupplier() {
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const supplierId = user.uid;

        // Access the specific supplier's products subcollection
        const productsRef = collection(db, `suppliers/${supplierId}/products`);
        const productsSnap = await getDocs(productsRef);

        const products = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Display products as cards
        displayProductsAsCards(products);
      } else {
        console.log("No user is logged in");
        cardContainer.innerHTML = "<p>Please log in to view your products.</p>";
      }
    });
  } catch (error) {
    console.error("Error fetching products for logged-in supplier:", error);
  }
}

// Call the function
getProductsForLoggedInSupplier();

// Connections Container
const connectionsContainer = document.getElementById("connectionsContainer");

// Function to display connections as cards
function displayConnectionsAsCards(connections) {
  connectionsContainer.innerHTML = ""; // Clear existing content

  if (connections.length === 0) {
    connectionsContainer.innerHTML = "<p>No client connections yet.</p>";
    return;
  }

  connections.forEach((connection) => {
    const card = document.createElement("div");
    card.className = "card connection-card";

    card.innerHTML = `
      <h3>Client Connection</h3>
      <p><strong>Client Email:</strong> ${connection.clientEmail}</p>
      <p><strong>Product Name:</strong> ${connection.productName}</p>
      
    `;

    connectionsContainer.appendChild(card);
  });
}

// Function to get connections for the logged-in supplier
async function getConnectionsForSupplier() {
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const supplierId = user.uid;

        // Fetch connections for the supplier
        const connectionsRef = collection(db, "connections");
        const q = query(connectionsRef, where("supplierId", "==", supplierId));
        const connectionsSnap = await getDocs(q);

        const connections = [];

        for (const docSnap of connectionsSnap.docs) {
          const connectionData = docSnap.data();
          const clientId = connectionData.clientId;
        
          try {
            // Fetch client email using clientId
            const clientDocRef = doc(db, "clients", clientId); // Create a reference to the client's document
            const clientDoc = await getDoc(clientDocRef); // Fetch the document
            const clientEmail = clientDoc.exists() ? clientDoc.data().email : "Unknown";
        
            connections.push({
              productName: connectionData.productName,
              clientEmail: clientEmail,
              createdAt: connectionData.createdAt,
            });
          } catch (error) {
            console.error("Error fetching client data:", error);
          }
        }

        // Display connections as cards
        displayConnectionsAsCards(connections);
      } else {
        console.log("No user is logged in");
        connectionsContainer.innerHTML = "<p>Please log in to view connections.</p>";
      }
    });
  } catch (error) {
    console.error("Error fetching connections for supplier:", error);
  }
}

// Call the function to display connections
getConnectionsForSupplier();