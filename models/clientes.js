const mongoose = require('mongoose');

const envioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    creditos: { type: Number, default: 0 },
    envios: [{
        destinatario: { type: String, required: true },
        telefono: { type: String, required: true },
        direccion: { type: String, required: true },
        referencia: {type: String, required: true }, 
        observacion: {type: String, required: true }, 
        producto: {
            descripcion: { type: String, required: true },
            peso: { type: Number, required: true },
            bultos: { type: Number, required: true },
            fecha_entrega: { type: String, required: true }
        },
        creditos_usados: { type: Number },
        fecha_registro: { type: String, required: true }
    }]
});

module.exports = mongoose.model('Envio', envioSchema);