  const path = require('path');
  require('dotenv').config({path: path.join(__dirname, 'config.env')});
  const {createClient} = require('@supabase/supabase-js');
  const express = require('express');
  const app = express();
  const multer = require('multer');
const { url } = require('inspector');

  // Almacenamiento en memoria 
  // it's named memory storage because its function is save process in RAM memory

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fieldSize: 10 * 1024 * 1024
    }
  });

  // acciones

  const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY

  );

  // Aplicacion, GET, POST & LISTEN

  app.use(express.static(path.join(__dirname, 'public')))
  app.use('/logo-types',express.static(path.join(__dirname, 'src/logo-types')))

  app.get('/aceptar-cookie', (req, res)=>{
     res.cookie('cookie-aceptada', 'true', {
      maxAge: 10080000,
      httpOnly: false
     })
     res.status(200).send('Entendido')
  });

// \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
// --------------------------------------------
// Solicitud de informacion a la tabla INVOICES
// --------------------------------------------
// /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

  app.get('/invoices-table-get', async(req, res)=>{
    const q = parseInt(req.query.page)
    const page = Number.isInteger(q) && q > 0 ? q : 1;
    const limit = 10

    const start = (page - 1) * limit;
    const end = start + (limit - 1);

try{

   const {data, error, count} = await supabase.from('invoices').select('id_invoice, name, weight, date, url', {count:'exact'}).order('date', {ascending : false}).range(start, end);

  const totalRows = Math.ceil(count/limit)

  if(error){
    throw error;
  }

  res.json({data, totalRows})
} catch(err){
  console.error(err);
      res.status(500).json({error:'Error al solicitar informacion'})
}
  })

  app.post('/upload', (req, res)=>{
    upload.array('pdf', 15)(req,res,async(err)=>{

      if(err){
        return res.status(400).json({
          error: 'Solo se permiten 15 archivos'
        })
      }

    try {
      // se crea una instancia de la aplicacion, cuando se ejecute el metodo post a dicha direccion, req.file tendra lugar
      const files = req.files;
      // medida de seguridad por si llegase a fallar o no haya ningun archivo que procesar
      if(!files || files.length === 0){
      return res.status(400).json({error: 'No file uploaded'});
      }
      const promesa = files.map( async file =>{

      // el nombre del archivo que se subira
      const fileName = Date.now() +'-'+ file.originalname;

      // subida a Supabase

      const {data, error} = await supabase.storage.from('invoices').upload(fileName, file.buffer, {contentType: file.mimetype});
      if(error){
        throw error;
      }

      // Obtener la URL publica

      const {data: publicUrlData} = await supabase.storage.from('invoices').getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      return{
        name : file.originalname,
        weight: file.size,
        date: new Date(),
        url: publicUrl
      }
      
      })
const resultados = await Promise.all(promesa);
     await supabase.from('invoices').insert(resultados)
      res.redirect('/sections/loadFile.html')
    } catch(err){
      console.error(err);
      res.status(500).json({error:'Error al subir Arcvhivo'})
    }
        })
  })

  app.delete('/action-delete/:id', async(req, res)=>{
    const idDelete = req.params.id;
    
    const {data, error} =  await supabase.from('invoices').delete().eq('id_invoice', idDelete)

    if(error){
      return res.status(400).json({error: error.message})
    }

    res.status(200).send({mensaje:'Registro borrado exitosamente'})
   
  })

// \1/\1/\1/\1/\1/\1/\1/\1/\1/\1/\1/\1/\1/\1/\1/
// --------------------------------------------
// Solicitud de informacion a la tabla MANIFEST
// --------------------------------------------
// /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

// Obtencion de datos de la tabla de invoices

app.get('/manifest-table-get', async(req, res)=>{
 // -------_____Obtencion de datos de la url_____--------
 const getPage = parseInt(req.query.page);
 const page = Number.isInteger(getPage) && getPage > 0 ? getPage : 1;
 const limit = 10;
 const start = (page - 1) * 10
 const end = start + (limit - 1)

 try{
  const {data, error, count} = await supabase.from('manifest').select('id_manifest, name, weight, date, url', {count:'exact'})
 }catch(error){
  console.log(error)
  res.status(500).json({error:"Error al solicitar la informacion de la tabla de manifiestos"})
 }

})
  

  app.listen(3000, ()=>{
    console.log('servidor operando en el puerto http://localhost:3000')
  })