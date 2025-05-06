require('./services/database');
const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const app = express();
const Envio = require('./models/clientes');
const PORT = process.env.PORT;

app.use(express.json())

const paquetes = {
    "30_envios": { creditos: 30, precio: 135 },
    "40_envios": { creditos: 40, precio: 160 },
    "60_envios": { creditos: 60, precio: 180 }
};

class Usuario {
    constructor(nombre, creditos = 0){
        this.nombre = nombre;
        this.saldo = creditos;
    }

    verificarCreditos(){
        return this.creditos;
    }

    usarCreditos(cantidad){
        if(this.creditos >= cantidad){
            this.creditos -= cantidad;
            return true;
        }
        return false;
    }

    agregarCreditos(cantidad){
        this.creditos += cantidad;
    }
}

class EnvioInfo {
    constructor(destinatario, direccion, telefono, referencia, observacion){
        this.destinatario = destinatario;
        this.direccion = direccion;
        this.telefono = telefono;
        this.referencia = referencia;
        this.observacion = observacion;
    }
}

class Producto {
    constructor(descripcion, peso, bultos, fecha_entrega){
        this.descripcion = descripcion;
        this.peso = peso;
        this.bultos = bultos;
        this.fecha_entrega = fecha_entrega;
    }

    calcularCostoEnvio(){
        return Math.ceil(this.peso / 3);
    }
}

class SistemaEnvios {
    static async comprarPaquete(nombre, paquete){
        const paquetes = {
            "30_envios": 30,
            "40_envios": 40,
            "60_envios": 60
        };

        const creditos = paquetes[paquete] || 0;
        if(creditos === 0) return false;

        await Envio.findOneAndUpdate(
            { nombre },
            { $inc: { creditos } },
            { upsert: true, new: true }
        );

        return true;
    }

    static async registrarEnvio(nombre, envioInfo, producto){
        const creditosNecesarios = producto.calcularCostoEnvio();

        const user = await Envio.findOne({ nombre: nombre });
        if(!user){
            console.log("Usuario no encontrado en la base de datos.");
            return "Usuario no encontrado.";
        }

        console.log(`Creditos actuales ${user.creditos}`);

        if(user.creditos < creditosNecesarios){
            return "Creditos insuficientes";
        }

        await Envio.findOneAndUpdate(
            { nombre: nombre },
            {
                $inc : { creditos: -creditosNecesarios },
                $push: {
                    envios: {
                        destinatario: envioInfo.destinatario,
                        telefono: envioInfo.telefono,
                        direccion: envioInfo.direccion,
                        referencia: envioInfo.referencia,
                        observacion: envioInfo.observacion,
                        producto: {
                            descripcion: producto.descripcion,
                            peso: producto.peso,
                            bultos: producto.bultos,
                            fecha_entrega: producto.fecha_entrega
                        },
                        creditos_usados: creditosNecesarios
                    }
                }
            },
            { new: true }
        );

        return "Envio registrado con exito";
    }

    static async consultarEnvios(nombre){
        return await Envio.findOne({ nombre });
    }

    static async eliminarEnvio(nombre, envioId){
        try{
            if(!mongoose.Types.ObjectId.isValid(envioId)){
                console.log("ID de envio no valido");
                return "ID de envio no valido"
            };
    
            const objectId = new mongoose.Types.ObjectId(envioId);
    
            const usuario = await Envio.findOne({ nombre });
            console.log("Resultado de la busqueda", usuario);

            if(!usuario){
                console.log("Envio no encontrado");
                return "Envio no encontrado"
            }
    
            const envioAEliminar = usuario.envios.find(e => e._id.equals(objectId));
            if(!envioAEliminar || typeof envioAEliminar.creditos_usados !== 'number'){
                console.log("Envio no encontrado o creditos invalidos");
                return "Envio no encontrado o creditos invalidos";
            }
    
            const resultado = await Envio.findOneAndUpdate(
                { nombre, "envios._id": objectId },
                {
                    $inc: { creditos: envioAEliminar.creditos_usados },
                    $pull: { envios: { _id: objectId } }
                },
                { new: true }
            );
    
            if(!resultado){
                console.log("Error al eliminar el envio");
                return "Error al eliminar el envio";
            }
    
            return "Envio eliminado y creditos reembolsados";
        }catch(error){
            console.log("Error interno del servidor", error);
            return "Error interno del servidor";
        }
    }
}

app.post('/usuario/comprar', async (req, res) => {
    const { nombre, paquete } = req.body;
    const resultado = await SistemaEnvios.comprarPaquete(nombre, paquete);
    resultado 
        ? res.json({ mensaje: `Paquete ${paquete} comprado exitosamente` })
        : res.status(400).json({ error: "Paquete no válido" });
});

app.post('/envio/registrar', async (req, res) => {
    const { nombre, envio, producto } = req.body;
    
    const envioInfo = new EnvioInfo(
        envio.destinatario,
        envio.telefono,
        envio.direccion,
        envio.referencia,
        envio.observacion
    );

    console.log("Producto recibido", producto);

    const productoInfo = new Producto(
        producto.descripcion,
        producto.peso,
        producto.bultos,
        producto.fecha_entrega
    );

   const resultado = await SistemaEnvios.registrarEnvio(nombre, envioInfo, productoInfo)

    resultado.includes("exito") 
        ? res.json({ mensaje: resultado })
        : res.status(400).json({ error: resultado });
});

app.get('/envios/:nombre', async (req, res) => {
    const envios = await SistemaEnvios.consultarEnvios(req.params.nombre);
    envios 
        ? res.json(envios)
        : res.status(404).json({ error: "Usuario no encontrado" });
});

app.delete('/envio/:nombre/:id', async (req, res) => {
    try{
        const { nombre, id } = req.params;
        console.log("Parametros recibidos:", { nombre, id });

        if(!nombre || !id){
            return res.status(400).json({ error: "Parametros invalidos" });
        }
    
        const resultado = await SistemaEnvios.eliminarEnvio(nombre, id);
        console.log("Resultado de eliminarEnvio", resultado);
        if(resultado === "Envio eliminado y creditos reembolsados"){
            return res.json({
                mensaje: resultado,
                status: "success"
            });
        }else if(resultado === "ID de envio no valido" || resultado === "Datos de creditos invalidos"){
            return res.json({
                mensaje: resultado,
                status: "fail"
            })
        }else{
            return res.status(404).json({
                error: resultado,
                status: "fail"
            });
        }
    }catch(error){
        console.error("Error en DELETE /envio", error);
        return res.status(500).json({
            error: "Error interno del servidor",
            status: "error"
        });
    }
});

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));