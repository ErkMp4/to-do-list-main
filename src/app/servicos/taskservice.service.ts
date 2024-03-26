import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../classes/task';

@Injectable({
  providedIn: 'root',
})
export class TaskserviceService {
  constructor(private http: HttpClient) {}

  criarTarefa(task: Task): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<any>('http://localhost:3000/adicionar', task, {
      headers,
    });
  }
  getTarefas(): Observable<Task[]> {
    return this.http.get<Task[]>('http://localhost:3000/exibir');
  }
  editarTarefa(tarefa: Task): Observable<any> {
    const url = `http://localhost:3000/editar/${tarefa.id}`;
    return this.http.put<any>(url, tarefa);
  }
  excluirTarefa(tarefa: Task): Observable<any> {
    const url = `http://localhost:3000/excluir/${tarefa.id}`;
    return this.http.delete<any>(url);
  }
  buscarTarefasPorDescricao(descricao: string): Observable<Task[]> {
    const url = `http://localhost:3000/buscar?descricao=${descricao}`;
    return this.http.get<Task[]>(url);
  }
  buscarTarefasOrdenadasPorData(): Observable<Task[]> {
    const url = 'http://localhost:3000/exibirOrdenadoPorData';
    return this.http.get<Task[]>(url);
  }
  marcarConcluido(tarefa: Task): Observable<any> {
    const url = `http://localhost:3000/marcarConcluido/${tarefa.id}`;
    return this.http.post<any>(url, tarefa);
  }
  getTarefasConcluidas(): Observable<Task[]> {
    return this.http.get<Task[]>('http://localhost:3000/concluidas');
  }
}
