import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { TaskserviceService } from '../../servicos/taskservice.service';
import { Task } from '../../classes/task';
import { format } from 'date-fns';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [TaskserviceService],
})
export class HomeComponent {
  mostrarFormulario = false;
  novaTarefa: Task = {
    id: 0,
    nome: '',
    descricao: '',
    data: new Date().toISOString(),
    situacao: true,
  };
  listaTarefas: Task[] = [];
  listaTarefasConcluidas: Task[] = [];

  constructor(private taskService: TaskserviceService) {}

  ngOnInit() {
    this.carregarTarefas();
    this.carregarTarefasConcluidas();
  }

  toggleForm() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }
  toggleDetalhes(tarefa: Task) {
    tarefa.mostrarDetalhes = !tarefa.mostrarDetalhes;
  }
  toggleEdicao(tarefa: Task) {
    tarefa.editando = !tarefa.editando;
  }
  marcarImportante(tarefa: Task) {
    tarefa.importante = !tarefa.importante;
  }

  adicionarTarefa() {
    const dataFormatada = format(this.novaTarefa.data, 'yyyy-MM-dd');
    this.novaTarefa.data = dataFormatada;

    this.taskService.criarTarefa(this.novaTarefa).subscribe(
      (resposta: any) => {
        if (resposta && resposta.status === 'success') {
          this.novaTarefa = {
            id: 0,
            nome: '',
            descricao: '',
            data: new Date().toISOString(),
            situacao: true,
            
          };
          
          console.log('Tarefa adicionada:', resposta.message);
          window.location.reload();
        } else {
          console.error('Erro ao adicionar tarefa:', resposta);
          window.location.reload();
        }
      },
      (erro: HttpErrorResponse) => {
        console.error('Erro ao adicionar tarefa:', erro);
      }
    );
  }

  buscarTarefasPorDescricao(event: Event) {
    const descricao = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    if (descricao === '') {
      this.carregarTarefas();
    } else {
      const tarefasFiltradas = this.listaTarefas.filter((tarefa) =>
        tarefa.descricao.toLowerCase().includes(descricao)
      );

      if (tarefasFiltradas.length === 0) {
        this.taskService.buscarTarefasPorDescricao(descricao).subscribe(
          (data: Task[]) => {
            this.listaTarefas = data;
          },
          (erro) => {
            console.error('Erro ao buscar tarefas por descrição:', erro);
          }
        );
      } else {
        this.listaTarefas = tarefasFiltradas;
      }
    }
  }

  ordenarPorData() {
    this.taskService.buscarTarefasOrdenadasPorData().subscribe(
      (data: Task[]) => {
        this.listaTarefas = data;
      },
      (erro) => {
        console.error('Erro ao buscar tarefas ordenadas por data:', erro);
      }
    );
  }

  marcarConcluido(tarefa: Task) {
    if (!this.listaTarefasConcluidas.some((item) => item.id === tarefa.id)) {
      tarefa.situacao = true;
      this.listaTarefasConcluidas.push(tarefa);
      console.log(this.listaTarefasConcluidas);

      this.taskService.marcarConcluido(tarefa).subscribe(
        (resposta: any) => {
          if (resposta && resposta.status === 'success') {
            console.log(
              'Tarefa marcada como concluída no banco de dados:',
              resposta.message
            );
            this.listaTarefas = this.listaTarefas.filter(
              (item) => item.id !== tarefa.id
            );
          } else {
            console.error('Erro ao marcar tarefa como concluída:', resposta);
            window.location.reload();
          }
        },
        (erro) => {
          console.error('Erro ao marcar tarefa como concluída:', erro);
        }
      );
    }
  }

  carregarTarefas() {
    this.taskService.getTarefas().subscribe(
      (data: Task[]) => {
        console.log('dados das tarefas', data);
        this.listaTarefas = data;
      },
      (erro) => {
        console.error('Erro ao carregar tarefas:', erro);
      }
    );
  }

  salvarEdicao(tarefa: Task) {
    this.taskService.editarTarefa(tarefa).subscribe(
      (resposta: any) => {
        if (resposta && resposta.status === 'success') {
          console.log('Tarefa editada:', resposta.message);
          tarefa.editando = false;
        } else {
          console.error('Erro ao editar tarefa:', resposta);
          window.location.reload();
        }
      },
      (erro: HttpErrorResponse) => {
        console.error('Erro ao editar tarefa:', erro);
      }
    );
  }

  excluirTarefa(tarefa: Task) {
    this.taskService.excluirTarefa(tarefa).subscribe(
      (resposta: any) => {
        if (resposta && resposta.status === 'success') {
          console.log('Tarefa excluída:', resposta.message);
          this.listaTarefas = this.listaTarefas.filter(
            (item) => item.id !== tarefa.id
          );
        } else {
          console.error('Erro ao excluir tarefa:', resposta);
          window.location.reload();
        }
      },
      (erro: HttpErrorResponse) => {
        console.error('Erro ao excluir tarefa:', erro);
      }
    );
  }

  carregarTarefasConcluidas() {
    this.taskService.getTarefasConcluidas().subscribe(
      (data: Task[]) => {
        console.log('dados das tarefas', data);
        this.listaTarefasConcluidas = data;
      },
      (erro) => {
        console.error('Erro ao carregar tarefas:', erro);
      }
    );
  }

  generatePdf() {
    const data = this.listaTarefas.map((tarefa) => [
      tarefa.nome,
      tarefa.descricao,
      format(new Date(tarefa.data), 'dd/MM/yyyy'), // Formate a data aqui
    ]);

    const docDefinition = {
      content: [
        { text: 'Lista de Tarefas', style: 'header' },
        { table: { body: data } },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 10, 0, 10] as [number, number, number, number],
        },
      },
    };

    pdfMake.createPdf(docDefinition).download('lista_tarefas.pdf');
  }
}
