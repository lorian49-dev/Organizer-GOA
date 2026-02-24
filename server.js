  const path = require('path');
  require('dotenv').config({path: path.join(__dirname, 'config.env')});
  const {createClient} = require('@supabase/supabase-js');
  const express = require('express');
  const app = express();
  const multer = require('multer');
const { count } = require('console');


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
const urlPage = parseInt(req.query.page)
const page = Number.isInteger(urlPage) && urlPage > 1 ? urlPage : 1;
const limit = 10;

// Defnicion de Limites para el rango de las tablas a medida que cambie la url 

const start = (page - 1) * limit; // Esto funciona de la forma en que, si la pagina en la url vale 1(el cual es el menor segun las reglas anteriormente planteadas), al restarle 1 quedaria 0, eso se multiplica por el limite y dara 0, el comienzo seria 0.
// caso contrario si valiese pagina 2, se le resta 1, y se multiplica por 10, dara como comienzo la posicion 10.
const end = start + (limit - 1);
// Similar al comienzo, estedebe tomarlo como base, sumarle el limite y restarle un digito, esto porque recordemosque en prograacion la numeracion no comienza desde el 1, sino desde el 0. Entonces, si quiero contar desde el 0 hasta el 10, estaria contando 11 digitos.

// La siguiente linea sera el llamado de los datos de la tabla de la base de datos, utilizaremos supabase ya que desde hay fue que se almaceno su conexion.
// se hace uso de llaves y de tres variables, las cuales ademas de ser herramientas dentro de supabase, las llamaremos como variables.
try{
const {data, error, count} = await supabase.from('manifest').select('id_manifest, name, weight, date, url', {count:'exact'}).order('date',{ascending:false}).range(start, end)
if(error){
  throw error
}
const totalRows = Math.ceil(count / limit)

res.json({data, totalRows})

}catch(error){
  console.error(error)
  res.status(500).json({error:'Registros no encontrados'})
}


})

// a Partir de aqui todo lo que venga sera lo enviado a la base de datos, especificamente la accion de publicar los archivos y datos en la BD.

app.post('/manifest-table-post', (req, res)=>{
  upload.array('pdf', 15)(req, res, async(error)=>{
    if(error){
     return res.status(400).json({error:'Solo se permiten 15 archivos como maximo'})
    }

    const files = req.files;

    if(!files && files.length === 0){
     return res.status(400).json({error:'No se seleccionaron archivos'})
    }

    const promesa = files.map(async file =>{
      try{
        const fileName = Date.now()+'-'+file.originalname

      const {data, error} = await supabase.storage.from('manifest').upload(fileName, file.buffer, {contentType: file.mimetype});

      if(error){
        throw error;
      }

      const {data: fileUrl} = await supabase.storage.from('manifest').getPublicUrl(fileName);

      const publicUrl = fileUrl.publicUrl

      return {
        name:file.originalname,
        weight: file.size,
        date: new Date(),
        url: publicUrl
      }

      } catch(error){
        console.log(error)
        res.status(500).json({error:'Error o fallo imprevisto en la carga de documentos'})
      }

    })

   const results = await Promise.all(promesa)
   await supabase.from('manifest').insert(results)
   res.redirect('/sections/loadManiefst.html')

  })
})

// Accion de borrado de registro
app.delete('/action-delete-manifest/:id', async(req, res)=>{
  const deleteActionId = req.params.id
  const {data, error} = await supabase.from('manifest').delete().eq('id_manifest', deleteActionId)

  if(error){
    return res.status(400).json({error: error.message})
  }

  res.status(200).send({message:'registro Borrado con exito'})
  
})
  

  app.listen(3000, ()=>{
    console.log('servidor operando en el puerto http://localhost:3000')
  })