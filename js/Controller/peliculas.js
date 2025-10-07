class PeliculasController {
    constructor() {
        this.API_BASE_URL = 'http://localhost:8080/api/movies';
        this.peliculaEditando = null;
        this.init();
    }
 
    init() {
        this.cargarPeliculas();
        this.setupEventListeners();
    }
 
    setupEventListeners() {
        document.getElementById('btnConfirmarAgregar').addEventListener('click', () => this.guardarPelicula());
        document.getElementById('btnConfirmarEliminar').addEventListener('click', () => this.eliminarPelicula());
        document.getElementById('modalPelicula').addEventListener('hidden.bs.modal', () => this.limpiarFormulario());
        
        document.querySelector('[data-bs-target="#modalPelicula"]').addEventListener('click', () => this.prepararModalAgregar());
    }
 
    prepararModalAgregar() {
        this.limpiarFormulario();
        document.getElementById('modalTitulo').textContent = 'Agregar Película';
    }
 
    async crearPelicula(peliculaData) {
        try {
            this.mostrarLoading(true);
            const response = await fetch(this.API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(peliculaData)
            });
 
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
 
            const resultado = await response.json();
            
            if (response.ok) {
                this.mostrarAlerta('Película creada exitosamente', 'success');
                this.cargarPeliculas();
                this.cerrarModal();
            } else {
                this.mostrarAlerta(`Error: ${resultado.message || 'No se pudo crear la película'}`, 'danger');
            }
        } catch (error) {
            this.mostrarAlerta(`Error: ${error.message}`, 'danger');
        } finally {
            this.mostrarLoading(false);
        }
    }
 
    async cargarPeliculas() {
        try {
            this.mostrarLoading(true);
            const response = await fetch(this.API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const peliculas = await response.json();
            this.mostrarPeliculas(peliculas);
        } catch (error) {
            this.mostrarAlerta(`Error al cargar películas: ${error.message}`, 'danger');
        } finally {
            this.mostrarLoading(false);
        }
    }
 
    async actualizarPelicula(id, peliculaData) {
        try {
            this.mostrarLoading(true);
            const response = await fetch(`${this.API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(peliculaData)
            });
 
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
 
            const resultado = await response.json();
            
            if (response.ok) {
                this.mostrarAlerta('Película actualizada exitosamente', 'success');
                this.cargarPeliculas();
                this.cerrarModal();
            } else {
                this.mostrarAlerta(`Error: ${resultado.message || 'No se pudo actualizar la película'}`, 'danger');
            }
        } catch (error) {
            this.mostrarAlerta(`Error: ${error.message}`, 'danger');
        } finally {
            this.mostrarLoading(false);
        }
    }
 
    async eliminarPelicula() {
        if (!this.peliculaEditando) return;
 
        try {
            this.mostrarLoading(true);
            const response = await fetch(`${this.API_BASE_URL}/${this.peliculaEditando.id}`, {
                method: 'DELETE'
            });
 
            if (response.ok) {
                this.mostrarAlerta('Película eliminada exitosamente', 'success');
                this.cargarPeliculas();
            } else if (response.status === 409) {
                this.mostrarAlerta('No se puede eliminar: La película tiene críticas o premios asociados', 'warning');
            } else {
                const error = await response.json();
                this.mostrarAlerta(`Error: ${error.message || 'No se pudo eliminar la película'}`, 'danger');
            }
        } catch (error) {
            this.mostrarAlerta(`Error: ${error.message}`, 'danger');
        } finally {
            this.mostrarLoading(false);
            this.cerrarModalEliminar();
        }
    }
 
    mostrarPeliculas(peliculas) {
        const tbody = document.getElementById('tablaPeliculas');
        tbody.innerHTML = '';
 
        if (peliculas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay películas registradas</td></tr>';
            return;
        }
 
        peliculas.forEach(pelicula => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pelicula.idPelicula || pelicula.id}</td>
                <td>${pelicula.titulo}</td>
                <td>${pelicula.director || '-'}</td>
                <td>${pelicula.genero || '-'}</td>
                <td>${pelicula.anoEstreno}</td>
                <td>${pelicula.duracionMin || '-'}</td>
                <td>${this.formatearFecha(pelicula.fechaCreacion)}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="controller.editarPelicula(${pelicula.idPelicula || pelicula.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="controller.confirmarEliminar(${pelicula.idPelicula || pelicula.id}, '${pelicula.titulo}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
 
    async editarPelicula(id) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${id}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const pelicula = await response.json();
            this.abrirModalEdicion(pelicula);
        } catch (error) {
            this.mostrarAlerta(`Error al cargar datos: ${error.message}`, 'danger');
        }
    }
 
    abrirModalEdicion(pelicula) {
        this.peliculaEditando = pelicula;
        document.getElementById('modalTitulo').textContent = 'Editar Película';
        document.getElementById('idPelicula').value = pelicula.idPelicula || pelicula.id;
        document.getElementById('titulo').value = pelicula.titulo;
        document.getElementById('director').value = pelicula.director || '';
        document.getElementById('genero').value = pelicula.genero || '';
        document.getElementById('anoEstreno').value = pelicula.anoEstreno;
        document.getElementById('duracionMin').value = pelicula.duracionMin || '';
        document.getElementById('fechaCreacion').value = this.formatearFechaParaInput(pelicula.fechaCreacion);
        
        new bootstrap.Modal(document.getElementById('modalPelicula')).show();
    }
 
    confirmarEliminar(id, titulo) {
        this.peliculaEditando = { id };
        document.getElementById('textoPeliculaEliminar').textContent = titulo;
        new bootstrap.Modal(document.getElementById('modalEliminar')).show();
    }
 
    guardarPelicula() {
        const titulo = document.getElementById('titulo').value.trim();
        const anoEstreno = document.getElementById('anoEstreno').value;
        
        if (!titulo) {
            this.mostrarAlerta('El título es obligatorio', 'warning');
            document.getElementById('titulo').focus();
            return;
        }
        
        if (!anoEstreno) {
            this.mostrarAlerta('El año de estreno es obligatorio', 'warning');
            document.getElementById('anoEstreno').focus();
            return;
        }
 
        const peliculaData = {
            titulo: titulo,
            director: document.getElementById('director').value.trim(),
            genero: document.getElementById('genero').value.trim(),
            anoEstreno: parseInt(anoEstreno),
            duracionMin: document.getElementById('duracionMin').value ? parseInt(document.getElementById('duracionMin').value) : null,
            fechaCreacion: document.getElementById('fechaCreacion').value || new Date().toISOString().split('T')[0]
        };
 
        const id = document.getElementById('idPelicula').value;
        
        if (id) {
            this.actualizarPelicula(id, peliculaData);
        } else {
            this.crearPelicula(peliculaData);
        }
    }
 
    mostrarAlerta(mensaje, tipo) {
        const alertContainer = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${tipo} alert-dismissible fade show`;
        alert.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertContainer.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }
 
    limpiarFormulario() {
        document.getElementById('formPelicula').reset();
        document.getElementById('formPelicula').classList.remove('was-validated');
        document.getElementById('idPelicula').value = '';
        document.getElementById('modalTitulo').textContent = 'Agregar Película';
        document.getElementById('fechaCreacion').value = new Date().toISOString().split('T')[0];
        this.peliculaEditando = null;
    }
 
    cerrarModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalPelicula'));
        if (modal) modal.hide();
    }
 
    cerrarModalEliminar() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminar'));
        if (modal) modal.hide();
    }
}