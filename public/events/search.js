const tableResultGlasses = document.querySelector('.table-search-results');
const tableBodyGlasses = document.querySelector('.table-body-results')

// navBar Constantes
    const barIconMenu = document.querySelector('.fa-bars-staggered')
    let navIsActive
    const magnifier = document.querySelector('.fa-magnifying-glass')
    const navEgation = document.querySelector('nav')
    const formManifestAndInvoice = document.querySelector('.form-documents');

const inputSearchGlass = document.getElementById('search-glass')
const searchGlassResults = document.querySelector('.field-results-glasses')

const goHome = () =>{
    window.location.href = '/'
}

  const debounce = (fn, delay) =>{
       let timeout;
       return function(...args){
        clearTimeout(timeout);
        timeout = setTimeout(()=>{
         fn.apply(this, args);
        }, delay)
       }
    }

    const breakPoint = (ms) => new Promise(resolve => setTimeout(resolve, ms))

     const openNavBar = async(a, b) =>{
   
    if(!a){
        barIconMenu.title = 'Minimizar menu'
        navEgation.classList.add('active');
        formManifestAndInvoice.classList.add('active')
        setTimeout(()=>{inputSearchGlass.classList.add('active')}, 1000)
    }else{
        barIconMenu.title = 'Expandir menu'
        inputSearchGlass.classList.remove('active');
        setTimeout(()=>{formManifestAndInvoice.classList.remove('active')}, 500)
        await b(500);
        navEgation.classList.remove('active')
        if(dropZone&&dropZone.classList.contains('on')) dropZone.classList.remove('on');

    }
   
 }

      async function autoCompleteGlass(input, field) {
            field.innerHTML = ''
            field.style.display = 'none';
            if(input.classList.contains('boxShadowOff')){
            input.classList.remove('boxShadowOff');
            }
            const valueSearch = input.value;

            if(valueSearch.length < 2) return;

            const res = await fetch(`/search-glass-results?glass=${valueSearch}`);
            const data = await res.json();

            if(data.length === 0) return field.style.display = 'none'
            
            data.forEach(item =>{
                const result = document.createElement('div');
                result.classList.add('item-glass-result');
                result.textContent = item.code || item.reference

                result.addEventListener('click', ()=>{
                    window.location.href = `/search-mid?glass_model=${result.textContent}`;
                })

                field.appendChild(result);
            })

            field.style.display = 'block'
            input.classList.add('boxShadowOff')
        }

addEventListener('DOMContentLoaded', async()=>{
            setTimeout(()=>{
       document.body.style.opacity = '1'
       document.body.style.pointerEvents = 'auto'

      }, 1000)});

const showInfoGlasses = async() => {
    const params = new URLSearchParams(window.location.search);
    const model = params.get('glass_model');
    const res = await fetch(`/search-glasses-table?glass_model=${model}`);
    const data = await res.json();

    data.forEach(item => {
        const newTr = document.createElement('tr');
        newTr.innerHTML = ` <td><input type='checkbox'></td>
                            <td>${item.brand}</td>
                            <td>${item.code}</td>
                            <td>${item.reference}</td>
                            <td>${item.color}</td>
                            <td>${item.ship_order}</td>
                            <td><a href='${item.invoice_id.url}' target='_blank'><i class="fa-solid fa-file-pdf"></i></a></td>
                            <td><a href='${item.manifest_id.url}' target='_blank'><i class="fa-solid fa-file-pdf"></i></a></td>`;
        tableBodyGlasses.appendChild(newTr);
    })

}

    if(inputSearchGlass){
            inputSearchGlass.addEventListener('input', debounce(()=>{
            autoCompleteGlass(inputSearchGlass, searchGlassResults)
            }, 300));
        }

showInfoGlasses();

     // Eventos en la NavBar 
     if(barIconMenu){
  barIconMenu.addEventListener('click', async()=>{
     navIsActive = navEgation.classList.contains('active')
     openNavBar(navIsActive, breakPoint)
    })
}

if(magnifier){
    magnifier.addEventListener('click', async()=>{
     navIsActive = navEgation.classList.contains('active')
     openNavBar(navIsActive, breakPoint)
    })
}


    