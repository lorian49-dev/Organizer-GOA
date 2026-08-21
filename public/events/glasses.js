
    // Buscador de Gafas
import {contentCoverCapsuleGlassesSingle, contentCoverCapsuleGlassesMassive} from '/templates/templates.js'

    const inputSearchGlass = document.getElementById('search-glass')
    const searchGlassResults = document.querySelector('.field-results-glasses')

    // navBar Constantes
    const magnifier = document.querySelector('.fa-magnifying-glass')
    const navEgation = document.querySelector('nav')
    const formManifestAndInvoice = document.querySelector('.form-documents');
    let navIsActive
    const barIconMenu = document.querySelector('.fa-bars-staggered');
    const backHome = document.querySelector('.back-home')

    // for Invoices

    const inputSearchInvoiceMassive = document.querySelector('.massive-input-fill-invoice');
    const inputHideIdInvoiceMassive = document.querySelector('.id-invoice-massive');
    const dropDownInvoiceMassive = document.querySelector('.document-invoice-result-massive');

    const inputSearchInvoiceSingle = document.querySelector('.single-input-fill-invoice');
    const inputHideIdInvoiceSingle = document.querySelector('.id-invoice-single');
    const dropDownInvoiceSingle = document.querySelector('.document-invoice-result-single');

    // for Manifest

    const inputSearchManifestMassive = document.querySelector('.massive-input-fill-manifest');
    const inputHideIdManifestMassive = document.querySelector('.id-manifest-massive');
    const dropDownManifestMassive = document.querySelector('.document-manifest-result-massive');

    const inputSearchManifestSingle = document.querySelector('.single-input-fill-manifest');
    const inputHideIdManifestSingle = document.querySelector('.id-manifest-single');
    const dropDownManifestSingle = document.querySelector('.document-manifest-result-single');

    // constantes para los eventos para los formularios
    const formMassive = document.querySelector('.form-massive-data');
    const formSingle = document.querySelector('.form-single-data');
    const btnRegisterMassive = document.querySelector('.register-massive');
    const btnRegisterSingle = document.querySelector('.register-single');
    const textArea = document.getElementById('textareaGlasses')

    // inputs
    const INPUT_BRAND = document.querySelector('.input-brand');
    const INPUT_CODE = document.querySelector('.input-code');
    const INPUT_REFERENCE = document.querySelector('.input-reference');
    const INPUT_COLOR = document.querySelector('.input-color');
    // # Ordenes
    const INPUT_ORDER_MASSIVE = document.querySelector('.input-order-massive')
    const INPUT_ORDER_SINGLE = document.querySelector('.input-order-single')

    // Funcion para saltar un Pop Up que muestre el mensaje de confirmacion

            const iconHtmlCheck = '<i class="fa-solid fa-circle-check"></i>'
        const iconHtmlX = '<i class="fa-solid fa-circle-xmark"></i>'

        const createPopUp = (typeStatus, message, icon) =>{
 const previousPopUp = document.querySelector('.pop-up-status-register');
                if(previousPopUp) previousPopUp.remove()
                const popUpStatus = document.createElement('span')
                popUpStatus.classList.add('pop-up-status-register');
                popUpStatus.classList.add(typeStatus);
                popUpStatus.innerHTML = `<div class="container-pop-up-icons"><span class="icon-status">${icon}</span><span class="text-status">${message}</span></div>`
                document.body.append(popUpStatus)
                setTimeout(()=>{
                    popUpStatus.remove()
                    btnRegisterMassive.classList.remove('process')
                }, 6000)
                return
        }

        // Funcion del proceso del textArea

    const textAreaSplit = (object) =>{
     try{
        if(!object || !object.value || !INPUT_ORDER_MASSIVE.value || !inputHideIdInvoiceMassive.value || !inputHideIdManifestMassive.value ) throw new Error("Faltan campos por llenar");

    const glassesRows = object.value.trim().split(/\r?\n/).filter(row=>row.trim() !== '');
    const glasses = glassesRows.map(item=>{
        const returnColumn = item.split('\t');
        if(returnColumn.length === 4) return {
            brand: returnColumn[0],
            code: returnColumn[1],
            reference: returnColumn[2],
            color: returnColumn[3],
            ship_order:INPUT_ORDER_MASSIVE.value,
            invoice_id: inputHideIdInvoiceMassive.value,
            manifest_id:inputHideIdManifestMassive.value
        };
        throw new Error('la cantidad de celdas debe ser 4 por fila')
        
    });



    return {
    status:'success',
    message: 'Registro Exitoso',
    content: glasses
    }
     }catch(error){
    return {
        status:'error',
        message:error.message
    }
    }
    }

    //constantes de movimiento de capsula de formularios
    const containerRegisterEyewears = document.querySelector('.container-register-eyewears');
    const coverCapsule = document.querySelector('.cover-capsule');
    const btnCoverCapsule = document.querySelector('.btn-togle-register');
    
    // Estados variables
    let bigFormState = false
    let formState = false
    let currentPage = 1
    let globalCount = 0

    // Utilidades

    const logoutBtn = () =>{
    window.location.href = '/logout'
}
// Funcion que puede facilitar la asincronia en ciertas tareas
    const breakPoint = (ms) => new Promise(resolve => setTimeout(resolve, ms))
// Abrir Barra de navegacion
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

    // Funcion de redireccionar la ubicacion actual a la pagina principal
    function goHome(){
        window.location.href = '/';
    }
    
    backHome.addEventListener('click', ()=>{
        goHome()
    })

    // Funcion de debounce

   function debounce(fn, delay){
    let timeout;
    return function(...args){
        clearTimeout(timeout);
        timeout = setTimeout(()=>{
            fn.apply(this, args)
        }, delay)
    }
   }

   // funcion de busqueda de documentos

   const autoCompleteDocument = async (input, field, idField, id, type) => {
    try{
     const name = input.value
     field.innerHTML = ' ';
     idField.value = ' '
     if(name.length <= 1){
        field.style.display = 'none'
        input.classList.remove('search')
        return
     }
     const res = await fetch(`search-${type}?name=${name}`)
     const data = await res.json();
     //llenado de datos para el campo de resultados
     const newUl = document.createElement('ul');
     data.forEach((register)=>{
         const newLi = document.createElement('li')
         newLi.textContent = register.name
         newLi.title = register.name
         newLi.addEventListener(('click'), ()=>{
            input.value = register.name
            idField.value = register.id
            field.innerHTML = ' ';
            field.style.display = 'none'
            input.classList.remove('search')
         })

         newUl.append(newLi)
     })
     input.classList.add('search')
     field.appendChild(newUl)
     field.style.display = 'block'
        document.addEventListener('click', (event)=>{
          if(!field.contains(event.target)){
            field.innerHTML = ' ';
            field.style.display = 'none'
            input.classList.remove('search')
          }
        })
    }catch(error){
     console.log(error)
    }
   }

     document.addEventListener('DOMContentLoaded', ()=>{
        setTimeout(()=>{
         document.body.style.opacity = 1
         document.body.style.pointerEvents = 'auto'
        }, 1000)
     })

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
                result.textContent = item.code;

                result.addEventListener('click', ()=>{
                    window.location.href = `/search-mid?glass_model=${item.code}`;
                })

                field.appendChild(result);
            })

            field.style.display = 'block'
            input.classList.add('boxShadowOff')
        }

        inputSearchGlass.addEventListener('input', debounce(()=>{
            autoCompleteGlass(inputSearchGlass, searchGlassResults);
        }, 300))

        //-------------------------------------------------//
        //                   Show Form
        //-------------------------------------------------//

        coverCapsule.addEventListener('click' ,(event)=>{
            if(event.target.classList.contains('btn-togle-register')){ 
                coverCapsule.classList.toggle('toRight')
                containerRegisterEyewears.classList.toggle('change')
            if(coverCapsule.classList.contains('toRight')){
                coverCapsule.innerHTML = contentCoverCapsuleGlassesSingle;
            }else{
                coverCapsule.innerHTML = contentCoverCapsuleGlassesMassive;
            }
            }
        })

        //-------------------------------------------------//
        //               Buscar Documentos
        //-------------------------------------------------//

        inputSearchInvoiceMassive.addEventListener('input', debounce(()=>{
         autoCompleteDocument(inputSearchInvoiceMassive, dropDownInvoiceMassive, inputHideIdInvoiceMassive, 'id_invoice', 'invoice')
        }, 300))

        inputSearchManifestMassive.addEventListener('input', debounce(()=>{
         autoCompleteDocument(inputSearchManifestMassive, dropDownManifestMassive, inputHideIdManifestMassive, 'id_manifest', 'manifest')
        }, 300))

        inputSearchInvoiceSingle.addEventListener('input', debounce(()=>{
         autoCompleteDocument(inputSearchInvoiceSingle, dropDownInvoiceSingle, inputHideIdInvoiceSingle, 'id_invoice', 'invoice')
        }, 300))

        inputSearchManifestSingle.addEventListener('input', debounce(()=>{
         autoCompleteDocument(inputSearchManifestSingle, dropDownManifestSingle, inputHideIdManifestSingle, 'id_manifest', 'manifest')
        }, 300))

        //-------------------------------------------------//
        //                Enviar Registro
        //-------------------------------------------------//

        formSingle.addEventListener('submit', async(event)=>{
            event.preventDefault();
            try{
                const requiredInputs = [
                    INPUT_BRAND,INPUT_CODE, INPUT_REFERENCE,INPUT_COLOR,INPUT_ORDER_SINGLE,inputHideIdInvoiceSingle, inputHideIdManifestSingle
                ];

                const isMissingFields = requiredInputs.some(input=> !input || !input.value.trim())
            if(isMissingFields){
                throw new Error('Faltan campos por llenar');
            }
            const formData = new FormData(formSingle);
            const dataObject = Object.fromEntries(formData)
            const fetchToQuery = await fetch('/glasses', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(dataObject)
            })
            if(!fetchToQuery.ok) throw new Error('Error de registro')
            createPopUp('success', "Registro Exitoso", iconHtmlCheck);
            }catch(error){
                console.error(error);
                createPopUp('error', error.message, iconHtmlX);
            }
        })

        //-------------------------------------------------//
        //           Enviar Registro masivo
        //-------------------------------------------------//

        formMassive.addEventListener('submit', async(event)=>{
        event.preventDefault();
        const callToTextAreaFunction = textAreaSplit(textArea);
    btnRegisterMassive.classList.add('process');
    if(callToTextAreaFunction.status === 'error'){
        createPopUp('error', callToTextAreaFunction.message, iconHtmlX);
    }else{
        const CONTENT_TEXT_AREA = callToTextAreaFunction.content;
        try{
            const fetchToQuery = await fetch('/glasses-package', {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                monturas: CONTENT_TEXT_AREA
            })
        });
        if(!fetchToQuery.ok) throw new Error('ocurrio un error de comunicacion con la base de datos');
        createPopUp('success', callToTextAreaFunction.message, iconHtmlCheck);
        }catch(error){
         createPopUp('error', `Error al consultar la base de datos`, iconHtmlX)
         console.error(error);
        }
    }
    
 })