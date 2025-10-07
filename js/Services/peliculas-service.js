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
}