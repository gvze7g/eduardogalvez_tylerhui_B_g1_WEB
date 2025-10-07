class PeliculasService{
    constructor(){
        this.validaciones = new
        ValidacionesService();
    }

    validarPelicula(peliculaData){
        const errores = [];

        if(!peliculaData.titulo || peliculaData.titulo.trun().length === 0){
            errores.push('El titulo es obligatorio');
        }

        if(!peliculaData.anoEstreno){
            errores.push('El año de estreno es obligatorio');
        }else if (peliculaData.anoEstreno < 1900 || peliculaData.anoEstreno > new Date().getFullYear() + 1){
            errores.push('El año de estreno no es valido');}

        if(peliculaData.duracionMin && (peliculaData.duracionMin<1 || peliculaData.duracionMin > 500)){
            errores.push('La duración debe estar entre 1 y 500 minutos');
        }

        return{
            valido:errores.length === 0,
            errores:errores
        };
    }

    formatearPeliculaParaAPI(datosFormulario){
        return{
            titulo: datosFormulario.titulo.trim(),
            director:datosFormulario.director ? datosFormulario.director.trim():null,
            genero:datosFormulario.genero ? datosFormulario.genero.trim():null,
            anoEstreno:datosFormulario.anoEstreno,
            duracionMin:datosFormulario.duracionMin,
            fechaCreacion:new Date().toISOString().split('T')[0]
        };
    }

    procesarRespuestaAPI(response){
        return {
            status: response,status,
            datos: response.datos,
            mensaje: response.mensaje,
            timestamp: new Date().toISOString()
        };
    }

    manejarErrorAPI(error){
        console.error ('Error en servicio: ', error);

        if (error.response) {
            return{
                status: error.response.status,
                mensaje:this.obtenerMensajeErrorPorStatus(error.response.status),
                datos:null
            };
        }
    }

    obtenerMensajeErrorPorStatus(status){
        const mensajes = {
            400: 'Datos invlidos enviados al servidor',
            404: 'Pelicula no encontrada',
            409: 'No se puede eliminar: la pelicula tene datos relacionados',
            500: 'Error interno del servidor'
        };
        return mensajes[status] || 'Error desconocido';
    }
}

class ValidacionesService {
    validarTexto(texto,minLength = 1, maxLength = 200){
        return texto && texto.length == minLength && texto.length <= maxLength;
    }

    validarNumero(numero,min,max){
        return numero >= min && numero <= max;
    }

    validarFecha(fecha){
        return ! isNaN(Date.parse(fecha));
    }
}

const PeliculasService = new PeliculasService