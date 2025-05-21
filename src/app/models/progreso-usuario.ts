export interface ProgresoUsuario {
    reto: {
      idReto: number;
      nombreReto: string;
      categoria: string;
    };
    estadoReto: string;
    fechaFinalizacion: string;
  }