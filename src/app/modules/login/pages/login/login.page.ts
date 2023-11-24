import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../../../core/state/session/session.service';
import { LoginApiBody } from '../../../../core/state/session/session.interface';
import { finalize, tap } from 'rxjs';
import { ToastService } from '../../../../core/toasts/services/toast-service/toast.service';
import { IonInput } from '@ionic/angular';
import { Usuario } from '../../../../core/state/gerenciamento/usuario/usuario.entity';
import { CanalService } from '../../../../core/state/gerenciamento/canal/canal.service';
import { UsuarioLogado } from '../../../../shared/utilities/usuario-logado/usuario-logado.utility';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  @ViewChild('password', { static: false }) password: IonInput | undefined;

  loading = false;

  usuario!: Usuario;
  // form: UntypedFormGroup;

  form: FormGroup<{ cpf: FormControl; password: FormControl }>;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private sessionService: SessionService,
    private canalService: CanalService,
    private toastService: ToastService,
    private usuarioLogado: UsuarioLogado
  ) {
    this.form = this.formBuilder.group({
      cpf: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  ionViewWillEnter() {
    this.loading = false;
  }

  submit() {
    // const cpfForm = this.form.value.cpf;
    // const senhaForm = this.form.value.senha;

    this.loading = true;

    const body: LoginApiBody = {
      cpf: this.form.controls.cpf.value,
      password: this.form.controls.password.value,
    };

    this.sessionService
      .login(body).subscribe({
        next: () => {
          this.sessionService.getUserInfo().subscribe({
            next: (usuario) => {
              this.canalService.buscarTodosCanaisMensagem().subscribe({
                next: (canal) => {
                  if (usuario.responsavel === undefined) {
                    this.form.reset();
                    this.navegaParaApp();
                  } else {
                    this.canalService.buscarCanalResponsavelTodos({idResponsavel: usuario.responsavel.responsavel_id}).subscribe({
                      next: () => {
                        this.form.reset();
                        this.navegaParaApp();
                      },
                      error: (err) => {
                        this.toastService.error('Falha ao realizar o login');
                        this.loading = false;
              
                        if (err?.original?.status === 422) {
                          return;
                        }
                      },
                    })
                  }
                },
                error: (err) => {
                  this.toastService.error('Falha ao realizar o login');
                  this.loading = false;
        
                  if (err?.original?.status === 422) {
                    return;
                  }
                },
              })
            },
            error: (err) => {
              this.toastService.error('Falha ao realizar o login');
              this.loading = false;
    
              if (err?.original?.status === 422) {
                return;
              }
            },
          })
        },
        error: (err) => {
          this.toastService.error('Falha ao realizar o login');
          this.loading = false;

          if (err?.original?.status === 422) {
            return;
          }
        },
      });
  }

  focusin(ev: any) {
    ev.stopPropagation();
  }

  private navegaParaApp() {
    this.router.navigate(['/app']);
  }
}