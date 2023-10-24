interface UsuarioLogado {
  nome: string,
  tipoUsuario: 'F' | 'R',
  idCargo?: number,
  funcionalidadesAcessoId?: number[],
}

export interface Session {
  accessToken: string;
  tokenType: string;
  usuarioLogado: UsuarioLogado
}
