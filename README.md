
Repositorio del Parcial 2

📌 Endpoints
🔹 Crear Usuario con Créditos
Método: POST
Ruta: /usuario/comprar
Descripción: Crea un usuario con créditos según el plan seleccionado.

Paquetes disponibles:

Paquete 1: 30 envíos ($135)
Paquete 2: 40 envíos ($160)
Paquete 3: 60 envíos ($180) (NOTA: para hacer la compra del paquete colocar "30_envios, 40_envios o 60_envios dependiendo de que paquete quisiera el usuario adquirir);
Ejemplo de cuerpo (JSON):

{
  "nombre": "William",
  "paquete": "30_envios"
}
Respuesta esperada:

{
  "mensaje": "Paquete 30_envios comprado exitosamente"
}
🔹 Registrar Envío
Método: POST
Ruta: /envio/registrar
Descripción: Este método registra un envío que se guarda en la base de datos como un subdocumento, haciendo el cobro de los créditos dependiendo el producto a enviar.

Ejemplo de cuerpo (JSON):

{
  "nombre": "William",
  "envio": {
    "destinatario": "Pedro",
    "telefono": "7777-8888",
    "direccion": "Calle El Progreso #123",
    "referencia": "Frente de un palo de mangos",
    "observacion": "Entregar antes de las 5 PM"
  },
  "producto": {
    "descripcion": "Caja de libros",
    "peso": 14,
    "bultos": 1,
    "fecha_entrega": "2025-05-20"
  }
}
Respuesta esperada:

{
  "mensaje": "Envio registrado con exito"
}
🔹 Consultar Envíos/Usuario
Método: GET
Ruta: /envios/:nombre
Descripción: Muestra la información del usuario, los créditos actuales, los envíos realizados y la información de cada envío con su monto de créditos cobrados.

Ejemplo de petición: http://localhost:3000/envios/William

Respuesta esperada:

{
  "_id": "68190dc343be6ea82d94bd92",
  "nombre": "William",
  "__v": 0,
  "creditos": 27,
  "envios": [
    {
      "producto": {
        "descripcion": "Caja de libros",
        "peso": 9,
        "bultos": 1,
        "fecha_entrega": "2025-05-10"
      },
      "destinatario": "Pedro",
      "telefono": "Calle el Progreso",
      "direccion": "77778888",
      "referencia": "Frente de un palo de mangos",
      "observacion": "Entregar antes de las 5 PM",
      "creditos_usados": 3,
      "_id": "68190e0874698406cabcb5b4"
    }
  ]
}
🔹 Eliminar Envío
Método: DELETE
Ruta: /envio/:nombre/:id
Descripción: Este método elimina un envio realizado basándose en el id de este, asimismo reembolsa los creditos gastados en ese envío.

Ejemplo de petición: http://localhost:3000/envio/William/ID_del_envio

Respuesta esperada:

{
  "mensaje": "Envío eliminado y créditos devueltos"
  "status": "success"
}
 Configuración
Pasos para probar la API

1. Clona el repositorio: git clone https://github.com/Mariela1412/Parcial2-C2.git

2. Instala dependencias: npm install express mongoose dotenv

3. Crea un archivo .env y configura las variables de entorno: MONGODB_URI=tu_cadena_de_conexion PORT=3000

4. Ejecuta el servidor: node app.js

 Tecnologías Utilizadas
Node.js

Express.js

MongoDB

Mongoose

 Autor
Sonia Mariela Segovia Benitez
