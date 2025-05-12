const auth = firebase.auth();
const db = firebase.firestore();

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      document.getElementById('reg-location').value = `Lat: ${lat}, Lon: ${lon}`;
    });
  } else {
    alert('Geolocation is not supported');
  }
}

document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const address = document.getElementById('reg-address').value;
  const location = document.getElementById('reg-location').value;
  const mobile = document.getElementById('reg-mobile').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection('users').doc(cred.user.uid).set({
        name, address, location, mobile, email
      });
    })
    .then(() => {
      alert('Registration successful');
      window.location.href = 'home.html';
    })
    .catch(err => alert(err.message));
});
