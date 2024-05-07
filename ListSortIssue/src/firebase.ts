import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase, ref } from 'firebase/database';

const firebaseConfig = {
	apiKey: "AIzaSyCsYLYcxzbqdoC7NubfJAaH1nvCA6qMO98",
	authDomain: "listissueproject.firebaseapp.com",
	databaseURL: "https://listissueproject-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "listissueproject",
	storageBucket: "listissueproject.appspot.com",
	messagingSenderId: "981238702986",
	appId: "1:981238702986:web:138c7fac9dfa09f28ade73"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const dbRef = ref(db);

export { app, auth, db, dbRef }

