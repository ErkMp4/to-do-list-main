export interface Task {
    id: number;
    nome: string;
    descricao: string;
    data: string;
    situacao: boolean;
    mostrarDetalhes?: boolean;
    editando?: boolean;
    importante?: boolean;
}
