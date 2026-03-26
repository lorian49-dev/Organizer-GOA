const rightSideLogin = document.querySelector('.right');
let i = 0;
const phrases = [
    'No te dejes intimidar por las opiniones de los demás. Solo la mediocridad es segura, así que arriésgate y haz aquello que deseas.',
    'Nuestra mayor debilidad es rendirnos. La forma más segura de ganar es intentarlo una vez más.',
    'Cambia la forma en que miras las cosas, y las cosas que miras cambiarán.',
    'Los días difíciles son necesarios para que disfrutemos con más entusiasmo de los días felices.',
    'La única revolución posible es dentro de uno mismo.',
    'No hay nada completamente errado en el mundo, incluso un reloj parado puede estar en lo cierto dos veces al día.'
]

document.addEventListener('DOMContentLoaded', ()=>{
  const phraseContainer = document.createElement('div');
  phraseContainer.classList.add('phrase-container')
  
  const cargePhrase = () => {
  rightSideLogin.appendChild(phraseContainer)
  phraseContainer.textContent = phrases[i]
  setInterval(()=>{
  phraseContainer.textContent = phrases[i]
    phraseContainer.style.opacity = '1'
    i = (i+1) % phrases.length
    console.log(i)
   setTimeout(()=>{
    phraseContainer.style.opacity = '0'
   }, 4000)
  }, 5000)
  }

  cargePhrase()

})
