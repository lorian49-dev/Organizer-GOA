English(This program is tested from windows 10/11)

 Welcome to organizer-GOA, first, what is this?

  organizer-GOA is a primary software desiged to support the employees and
  administrative tasks, it originated from an idea, organize invoices and manifest linked to different 
  glasses/eyewear, and have the ease of check the information about so many glasses at the same time.

  -Currently this app is using the next technologies:
  #JavaScript
  #Node.Js
  #PostgreSQL
  #HTML5 & CSS3 (Basics but important).

  INSTALATION GUIDE

  1- Open CMD, Powershell or VS Code terminal
  2- Locate your destination folder (cd/Documents/MyProyects)
  3- execute the next code: 
     git clone https://github.com/lorian49-dev/Organizer-GOA.git
  4- Move in the proyect folder:
     cd Organizer-GOA

   *INSTALL DEPENDENCES and node technology*

using CDM or Powershell

 winget install OpenJS.NodeJS.LTS

or Go to the next website:

https://nodejs.org/en/download/current

Dependences

 step 1: As the previously process, you need to get to the proyect location 
 step 2: Install using----->(npm install) // if you use npm install, packages will be installed automaticaly

 #npm install express
 #npm install @supabase/supabase-js
 #npm install multer
 #npm install dotenv
 #npm install express-session
 #npm install bcrypt

  once finished the installation process, it's time to create and give acces to database, in this proyect is being used Supabase, but you can drow on any database provider.

  in the main proyect folder, who is called 'backend'(you can change folder's name in your devide, not problem), basically the one file .env is your acces key and the exactly following information has to be there:

SUPABASE_URL=PROYECT-URL
SUPABASE_SERVICE_KEY=ACCES-KEY
   
and that's all about the installation guide

--------------------------------------------
/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
           Instructions for use
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
--------------------------------------------

• Open .bat file
• if you are not logged in you will be redirected to the login form
• after place the correct information in the form, again, you will be redirected to the main page
• you could chose between 3 options, eyewears, invoices and manifest
• in any page you could search any copy, just complete de serial number in the searchbar at the top right side.
• if you need to add an invoice, manifest or eyewear just go in the create copy option.

meanwhile the server works, the program always will answering

if you need some of guide with code, look at this:

all you need to know is in server.js

once you have sucessfully installed the frameworks, then you need to import them to your server proyect, like this following structure:

express import
const express = require('express');
multer import
const multer = require('multer');

sessions management

const session = require('express-session')

opening process

file.bat opens automatically the command console, this is because of the currently proyect is my first one, and is the way that i found for let it working.

Spanish
_______

Este programa ha sido probado en Windows 10/11

Bienvenido a organizer-GOA. Primero, ¿qué es esto?

organizer-GOA es un software primordial diseñado para apoyar a los empleados y las tareas administrativas. Surgió de una idea: organizar facturas y manifiestos vinculados a diferentes lentes/gafas, y tener la facilidad de consultar la información de muchos lentes al mismo tiempo.

Actualmente esta aplicación utiliza las siguientes tecnologías:

#JavaScript

#Node.js

#PostgreSQL

#HTML5 y CSS3 (Básicos pero importantes).

GUÍA DE INSTALACIÓN
Abre el CMD, PowerShell o la terminal de VS Code.

Ubica tu carpeta de destino (cd /Documentos/MisProyectos).

Ejecuta el siguiente código:
git clone https://github.com/lorian49-dev/Organizer-GOA.git

Entra en la carpeta del proyecto:
cd Organizer-GOA

INSTALACIÓN DE DEPENDENCIAS Y TECNOLOGÍA NODE

Usando CMD o PowerShell:
winget install OpenJS.NodeJS.LTS

O ve al siguiente sitio web:
https://nodejs.org/en/download/current

Dependencias

Paso 1: Al igual que en el proceso anterior, debes estar en la ubicación del proyecto.

Paso 2: Instala usando lo siguiente (no copies el '#'):

#npm install express
#npm install @supabase/supabase-js
#npm install multer
#npm install dotenv
#npm install express-session
#npm install bcrypt

Una vez finalizado el proceso de instalación, es hora de crear y dar acceso a la base de datos. En este proyecto se está utilizando Supabase, pero puedes recurrir a cualquier proveedor de bases de datos.

En la carpeta principal del proyecto, llamada "backend" (puedes cambiar el nombre de la carpeta en tu dispositivo, no hay problema), el archivo .env es básicamente tu llave de acceso y debe contener exactamente la siguiente información:

SUPABASE_URL=URL-DEL-PROYECTO
SUPABASE_SERVICE_KEY=LLAVE-DE-ACCESO

Y eso es todo en cuanto a la guía de instalación.

Instrucciones de uso
Abre el archivo .bat.

Si no has iniciado sesión, serás redirigido al formulario de inicio de sesión.

Después de ingresar la información correcta en el formulario, serás redirigido nuevamente a la página principal.

Podrás elegir entre 3 opciones: gafas (eyewears), facturas (invoices) y manifiestos (manifest).

En cualquier página puedes buscar cualquier registro, solo completa el número de serie en la barra de búsqueda en la parte superior derecha.

Si necesitas agregar una factura, manifiesto o gafas, simplemente ve a la opción de crear copia/registro.

Mientras el servidor esté en funcionamiento, el programa siempre estará respondiendo.

Si necesitas una guía con el código, mira esto:

Todo lo que necesitas saber está en server.js

Una vez que hayas instalado con éxito los frameworks, necesitas importarlos a tu proyecto de servidor, siguiendo esta estructura:

Importación de express:
const express = require('express');

Importación de multer:
const multer = require('multer');

Gestión de sesiones:
const session = require('express-session');

Proceso de apertura

El archivo .bat abre automáticamente la consola de comandos; esto se debe a que este es mi primer proyecto y es la forma que encontré para dejarlo funcionando.