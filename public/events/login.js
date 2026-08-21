const rightSideLogin = document.querySelector('.right');
const formLogin = document.querySelector('.form-login');
const inputuserName = document.querySelector('.input-user-name');
const inputPassword = document.querySelector('.input-password');
const messageLogin = document.querySelector('.message-wrong-login')
const btnEye = document.querySelector('.show-password')
let i = 0;
const phrases = [
    'No te dejes intimidar por las opiniones de los demás. Solo la mediocridad es segura, así que arriésgate y haz aquello que deseas.',
    'Nuestra mayor debilidad es rendirnos. La forma más segura de ganar es intentarlo una vez más.',
    'Cambia la forma en que miras las cosas, y las cosas que miras cambiarán.',
    'Los días difíciles son necesarios para que disfrutemos con más entusiasmo de los días felices.',
    'La única revolución posible es dentro de uno mismo.',
    'No hay nada completamente errado en el mundo, incluso un reloj parado puede estar en lo cierto dos veces al día.'
]
const eventShowPassword = (inputChoosed, eye) =>{
 eye.classList.toggle('active')
 if(eye.classList.contains('active')){
  inputChoosed.type = 'text'
 }else{
  inputChoosed.type = 'password'
 } 
}

const modalContainer = document.querySelector('.modal-container-login')

document.addEventListener('DOMContentLoaded', ()=>{
  const phraseContainer = document.createElement('div');
  phraseContainer.classList.add('phrase-container')
  
  btnEye.addEventListener('click', ()=>{
   eventShowPassword(inputPassword, btnEye);
  })

  const cargePhrase = () => {
  rightSideLogin.appendChild(phraseContainer)
  phraseContainer.textContent = phrases[i]
  setInterval(()=>{
  phraseContainer.textContent = phrases[i]
    phraseContainer.style.opacity = '1'
    i = (i+1) % phrases.length
   setTimeout(()=>{
    phraseContainer.style.opacity = '0'
   }, 4000)
  }, 5000)
  }

  formLogin.addEventListener('submit', async(event)=>{
    formLogin.style.pointerEvents = 'none';
    modalContainer.classList.toggle('modal-on')
      event.preventDefault()

      const dataForm = new FormData(formLogin);

      const username = dataForm.get('username');
      const password = dataForm.get('password');
      const res = await fetch('/login', {
        method: 'POST',
        headers:{'Content-type': 'application/json'},
        body: JSON.stringify({username, password})
      });

    const data = await res.json();
    if(data.success){
      window.location.href = '/';
    }else{
      formLogin.style.pointerEvents = 'auto';
      modalContainer.classList.remove('modal-on');
        messageLogin.textContent = 'Usuario o clave invalidos';
    }
    

  })

  cargePhrase()
 
})
