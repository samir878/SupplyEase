 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
 import { getAuth, onAuthStateChanged ,createUserWithEmailAndPassword,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
 import{getFirestore ,addDoc,collection,serverTimestamp ,setDoc,doc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
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
onAuthStateChanged(auth, async (user) => {
    if (user) {
      const supplierId = user.uid;
      console.log("Supplier ID:", supplierId);
      
      const productForm = document.getElementById('product-form');
    productForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const description = document.getElementById('description').value.trim();
      const price = parseFloat(document.getElementById('price').value);
      const category = document.getElementById('category').value.trim();
      const location = document.getElementById('location').value.trim();
      const stock = parseInt(document.getElementById('stock').value);
      const rating = parseInt(document.getElementById('rating').value);

      // Check for valid data
      if (!name || !description || !category || !location || !stock || !rating) {
        alert('Please fill in all fields');
        return;
      }
  
      try {
        // Add product to "products" collection under the logged-in supplier
        const productData = {
            name,
            description,
            price,
            category,
            location,
            stock,
            rating,
            supplierId,
          createdAt: serverTimestamp(),
        };
  
        const productsCollectionRef = collection(db, "products");
        await addDoc(productsCollectionRef, productData);
  
        console.log("Product added successfully!");
      } catch (error) {
        console.error("Error adding product: ", error);
      }
    });
    } else {
      console.log("No user logged in. Redirecting to login page.");
      window.location.href = "Connect.html"; // Redirect to login page
    }
  });
