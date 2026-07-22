importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCPYO5Q51E1QGo4WjZs1JHGcVHa5H6dNJs",
  authDomain: "studio-4789672835-quantaly.firebaseapp.com",
  projectId: "studio-4789672835-quantaly",
  storageBucket: "studio-4789672835-quantaly.firebasestorage.app",
  messagingSenderId: "1004560192065",
  appId: "1:1004560192065:web:0c9caeeb94fd196525acc0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'Quantaly Notifica';
  const notificationOptions = {
    body: payload.notification.body || 'Nuovo aggiornamento nell\'ecosistema Quantaly',
    icon: '/unnamed_edited (1).png',
    badge: '/unnamed_edited (1).png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
