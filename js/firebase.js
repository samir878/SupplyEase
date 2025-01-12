 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
 import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
 import{getFirestore ,setDoc,doc,getDoc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
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

// Function to display messages
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Input Validation
function validateInputs(email, password, name, accountType) {
  if (!email || !password || !name || !accountType) {
    showMessage('All fields are required', 'signUpMessage');
    return false;
  }
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', 'signUpMessage');
    return false;
  }
  return true;
}

// Event Listener for Sign-Up
const container = document.getElementById('container');
document.getElementById('sign_up').addEventListener("click", async (event) => {

  event.preventDefault();
  
  const email = document.getElementById('Remail').value.trim();
  const password = document.getElementById('Rpassword').value.trim();
  const name = document.getElementById('name').value.trim();
  const selectedAccountType = document.querySelector('input[name="account_type"]:checked');
  const accountType = selectedAccountType ? selectedAccountType.value : null;

  if (!validateInputs(email, password, name, accountType)) return;

  const auth = getAuth();
  const db = getFirestore();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      email: email,
      name: name,
      accountType: accountType
    };
  

    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, userData);
    showMessage('Account created successfully', 'signUpMessage');

    if(accountType==='supplier'){
      console.log("yow");
      const supplierData = {
        email: email,
        name: name,
        accountType: accountType,
        //createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const supplierRef = doc(db, "suppliers", user.uid);
      await setDoc(supplierRef, supplierData); 
    }else if (accountType==='client'){
      console.log("hey");
      const clientData = {
        email: email,
        name: name,
        accountType: accountType,
       // createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const clientRef = doc(db, "clients", user.uid);
      await setDoc(clientRef, clientData); 
    }
    //this line its like it slides to the loging section but it didint work 
     // Clear input fields
  document.getElementById('Remail').value = '';
  document.getElementById('Rpassword').value = '';
  document.getElementById('name').value = '';
  if (selectedAccountType) {
    selectedAccountType.checked = false; // Uncheck the radio button
  }
    container.classList.remove("active");
    // Redirect or perform additional actions
    console.log('User registered and data saved');
  } catch (error) {
    const errorCode = error.code;
    if (errorCode === 'auth/email-already-in-use') {
      showMessage('Email address already exists', 'signUpMessage');
    } else {
      showMessage('Unable to create user', 'signUpMessage');
    }
  }
});
//               login

// Event Listener for Login
document.getElementById('sign_in').addEventListener("click", async (event) => {
  event.preventDefault();
  
  const email = document.getElementById('Lemail').value.trim();
  const password = document.getElementById('Lpassword').value.trim();

  // Validate inputs
  if (!email || !password) {
    showMessage('Email and Password are required', 'signUpMessage');
    return;
  }

  const auth = getAuth();
  const db = getFirestore();
 
  try {
    console.log("Attempting to sign in...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    showMessage('Login successful', 'signUpMessage');
    console.log("Authentication successful, user ID: ", user.uid);
    
    // Fetch user data from Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("Fetched user data: ", userData);

        // Redirect based on account type
        if (userData.accountType === 'supplier') {
            window.location.href = "supplier.html";
        } else if (userData.accountType === 'client') {
            window.location.href = "client.html";
        } else {
            console.error("Invalid account type");
        }
    } else {
        console.error("No user document found!");
        showMessage("User data not found. Please contact support.", "signUpMessage");
    }
} catch (error) {
    console.error("Error during login: ", error);
    const errorCode = error.code;
    if (errorCode === 'auth/user-not-found') {
        showMessage('No user found with this email', 'signUpMessage');
    } else if (errorCode === 'auth/wrong-password') {
        showMessage('Incorrect password', 'signUpMessage');
    } else {
        showMessage('Unable to log in. Please try again.', 'signUpMessage');
    }
}


});

























