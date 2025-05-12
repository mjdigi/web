const auth = firebase.auth();

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert('Login successful');
      window.location.href = 'home.html';
    })
    .catch(err => alert(err.message));
});
