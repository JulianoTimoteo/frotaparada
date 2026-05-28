import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default db;