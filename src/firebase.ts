import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyANfW8GLwbreQCSmmMkpuyvQq9yUDJUTPI',
  authDomain: 'gerund-8d8df.firebaseapp.com',
  databaseURL:
    'https://gerund-8d8df-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'gerund-8d8df',
  storageBucket: 'gerund-8d8df.firebasestorage.app',
  messagingSenderId: '47286038646',
  appId: '1:47286038646:web:a1a9cb8d6a6f257dc7ef57',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseProjectId = firebaseConfig.projectId
