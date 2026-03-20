const img_logo = document.querySelector('.logo-andes');
        const org_logo = document.querySelector('.organizer_logo')
        const sectionButtons = document.querySelectorAll('section')
        const btn_close_windows = document.querySelector('.btn-close-windows');
        const btn_dont_show_again = document.querySelector('.btn-dont-show-again');
        const btn_next = document.querySelector('.btn-next')
        const btn_back = document.querySelector('.btn-back')
        const modal_container = document.querySelector('.modal-container')
        const modal_windows = document.querySelector('.modal-windows')
        let tittleModal = document.querySelector('.tittleModal')
        let subtittleModal = document.querySelector('.subtittlemodal')
        const modalWindowsContent = document.querySelector('.modal-windows-content') 
        const modalImg = document.querySelector('.modal-img')
        const textInstrutions = document.createElement('div')
        textInstrutions.classList.add('text-instructions')

        // Eventos para el Buscador de moonturas

        const inputGlasses = document.getElementById('search-glass');
        const fieldResultGlasses = document.querySelector('.field-results-glasses')
       
        const debounce = (fn, delay) =>{
          let timeout;
          return function(...args){
            clearTimeout(timeout)
            timeout = setTimeout(()=>{
             fn.apply(this, args)
            }, delay)
          }
        }

        const modalContent = [{
            tittle: 'Como usar Organizer? ',
            subtittle: 'Busqueda de monturas',
            img: '/logo-types/search-bar.png',
            text: '<p>La <strong>barra de busqueda</strong> al inicio de la web, proporciona un atajo en la busqueda de cualquier montura registrada.<br><br> Solo se bebe ingresar el numero exacto de Modelo y apareceran todas las coincidencias</p>'
        },
           {tittle: 'Atajos',
            subtittle: 'Accesos rapidos',
            img: '/logo-types/buttons-bar.png',
            text: '<p>Para la fase <strong>beta</strong> se facilitan 3 opciones de acceso rapido para cargar o descargar documentos de facturas, manifiestos, o sencillamente para eliminar, agregar o editar informacion de monturas.</p><img src="/logo-types/button-montura.png"><p> Las <strong>monturas</strong> son el eje central de este proyecto, por lo que se es necesario inresar cada una de las existencias al sistema, estas tendran que ser enlazadas a una factura, un manifiesto, y ser digitada manualmente un numero de compra, para asi poder diferenciar unas de otras.</p><img src="/logo-types/button-invoice.png"><p> Para este apartado se reservan dos espacios, uno para subir el documento en pdf y el otro para visualizar y gestionar dichos pdf para <strong>Facturas especificamente</strong></p><img src="/logo-types/button-manifest.png"><p> Al igual que las facturas, los manifiestos cuentan con sus respectivos apartados de carga y vizualizacon de archivos.</p>'
        },
            {tittle: 'Gestion de Documentos',
            subtittle: 'PDF y monturas',
            img: '/logo-types/search-bar.png',
            text: '<p>lorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsum</p>'
        }]
        
        let i = -1
        

// Funciones
         
// arrow

          const showAndHideModal = (btn,ModalC, ModalW, logoImg, logoText, groupBtn) =>{
            btn.addEventListener('click', async()=>{
            ModalW.style.transform = 'translateY(-100vh)'
            ModalW.style.opacity = '0'
            ModalC.style.opacity = '0'
            ModalC.style.pointerEvents = 'none'
            await waiting(1000)
             logoImg.style.transform = 'translateY(0)'
             await waiting(500)
             logoImg.style.opacity = '1'
            await waiting(1000)
             logoImg.style.transform = 'translateX(-10%)'
             logoText.style.opacity = '1'
             logoText.style.transform = 'translateX(0%)'     
            for(const secion of groupBtn){
            await waiting(300)
            secion.style.opacity = '1'
            secion.style.setProperty('--escala', '.7')
            }
            })
          }

          function acceptCookie(){
        fetch('/aceptar-cookie').then(()=>{
               showAndHideModal(btn_dont_show_again, modal_container, modal_windows, img_logo, org_logo, sectionButtons)
        })
    }
        //constante para aniadir promesas dentro de Lisneners
        const waiting = (ms) => new Promise(resolve => setTimeout(resolve, ms))

        addEventListener('DOMContentLoaded', async()=>{
            setTimeout(()=>{
       document.body.style.opacity = '1'
       document.body.style.pointerEvents = 'auto'

      }, 1000)
      //Escucha el evento al No mostrar nuevamente el modal - COOKIE
      const aceptarCookie = document.cookie.split('; ').find(row => row.startsWith('cookie-aceptada'))
    if(!aceptarCookie){
        modal_container.style.display = 'flex';
    } else{
         await waiting(1000)
             img_logo.style.transform = 'translateY(0)'
             await waiting(500)
             img_logo.style.opacity = '1'
            await waiting(1000)
             img_logo.style.transform = 'translateX(-10%)'
             org_logo.style.opacity = '1'
             org_logo.style.transform = 'translateX(0%)'     
            for(const secion of sectionButtons){
            await waiting(300)
            secion.style.opacity = '1'
            secion.style.setProperty('--escala', '.7')
    }
}           

      
        // escucha de evento al salir del modal
            showAndHideModal(btn_close_windows, modal_container, modal_windows, img_logo, org_logo, sectionButtons)

        // escucha al evento al seguir en el modal

      btn_next.addEventListener('click', async(eventClick)=>{
        if(i <= modalContent.length-1){
        modalWindowsContent.style.opacity = '0'
        await waiting(500)
        i++
        tittleModal.textContent = modalContent[i].tittle
       subtittleModal.textContent = modalContent[i].subtittle
       modalImg.innerHTML = `<img src="${modalContent[i].img}" alt="imagen de referencia">`
       textInstrutions.innerHTML = modalContent[i].text
        modalWindowsContent.appendChild(textInstrutions)
        modalWindowsContent.style.opacity = '1'
       if(i == modalContent.length-1){
        btn_next.style.display = 'none'
       }
        }

        if(i >= 1 && i <= modalContent.length){
        btn_back.style.display = 'block'
        }
      })


      // Evento del boton hacia atras

      btn_back.addEventListener('click', async(event)=>{
        if(i > 0){
        modalWindowsContent.style.opacity = '0'
        await waiting(500)
        i--
        tittleModal.textContent = modalContent[i].tittle
        subtittleModal.textContent = modalContent[i].subtittle
        modalImg.innerHTML = `<img src="${modalContent[i].img}" alt="imagen de referencia">`
          textInstrutions.innerHTML = modalContent[i].text
        modalWindowsContent.appendChild(textInstrutions)
        modalWindowsContent.style.opacity = '1'
        if(i === 0){
         btn_back.style.display = 'none'
         btn_next.style.display = 'block'
        }
        } 

      });

      // Input de Monturas

      async function getGlasses(){
        fieldResultGlasses.innerHTML = '';
        fieldResultGlasses.style.display = 'none';
        inputGlasses.classList.remove('boxShadowOn');


        const inputData = inputGlasses.value;
        if(inputData.length < 2) return;
        const res = await fetch(`/search-glass-results?glass=${inputData}`);
        const data = await res.json();

        if(data.length === 0){
          return fieldResultGlasses.style.display = 'none'
        }

        data.forEach(item=>{
         const result = document.createElement('div');
         result.classList.add('item-glass-result');
         result.textContent = item.code;

         result.addEventListener('click', ()=>{
          window.location.href = `/search-mid?glass_model=${item.code}`
         })

         fieldResultGlasses.appendChild(result)
        });
          document.addEventListener('click', (e)=>{
          if(!fieldResultGlasses.contains(e.target)){
            fieldResultGlasses.style.display = 'none'
            if(!inputGlasses.classList.contains('boxShadowOn')){
        inputGlasses.classList.remove('boxShadowOn');
            }
          }
        })
        inputGlasses.classList.add('boxShadowOn');
        fieldResultGlasses.style.display = 'block'
      }

      inputGlasses.addEventListener("input", debounce(()=>{
        getGlasses()
       }, 300))
        });