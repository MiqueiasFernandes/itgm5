import {Component, OnInit} from '@angular/core';

import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Response} from '@angular/http';
import {AlertService} from 'ng-jhipster';
import {Customize, CustomizeService} from '../../customize';
import {Base, BaseService} from '../index';

@Component({
  selector: 'jhi-fab-add-base',
  templateUrl: './fab-add-base.component.html',
  styles: []
})
export class FabAddBaseComponent implements OnInit {

    file: File;
    tipo: number;
    onLoad = false;
    extra = '';
    visivel = false;
    variaveis: string[] = [];
    active = true;

    constructor(
        public activeModal: NgbActiveModal,
        private customizeService: CustomizeService,
        private alertService: AlertService,
        private baseService: BaseService
    ) {}

  ngOnInit() {
  }
  adicionarBase() {

        if (!this.file) {
            this.onError({message: 'selecione o arquivo!'});
            return;
        }

        this.customizeService.getCustomize()
            .subscribe((customize: Customize) => {
                if (customize && customize.projeto) {
                    const base: Base =
                        new Base(null, this.file.name, null, customize.projeto);
                    if (!base.projeto || base.projeto === null || base.projeto === undefined) {
                        this.onError({message: 'ative um projeto!'});
                        return;
                    }

                    this.baseService.create(base)
                        .subscribe(
                            (res: Base) => this.onSaveSuccess(res),
                            (res: Response) => this.onError(res.json()));
                }
            });
    }

    setFile($event) {
        this.file = $event.target.files[0];
        if (this.file.name.endsWith('.csv')) {
            this.tipo = 1;
            this.extra = ';';
        } else if (this.file.name.endsWith('.RData')) {
            this.tipo = 2;
            this.extra = '';
            this.getVariaveis();
        } else {
            this.tipo = 0;
            this.onError({message: 'arquivo invalido!'});
            this.file = null;
            return;
        }
    }

    onSaveSuccess(base: Base) {
        this.onLoad = true;  ///////////VERIFICAR ISTO 07/07/2017 ////////////////////////////////
        this.baseService.sendBase(base, this.tipo === 1 ? this.file : new File([''], base.nome), this.extra).subscribe(
            (res) => {
                this.alertService.success(res.toString());
                this.close();
            },
            (err) => {
                this.onError(err);
            }
        );
    }

    getVariaveis() {
        this.onLoad = true;
        this.customizeService.getCustomize()
            .subscribe((customize: Customize) => {
                if (customize && customize.projeto) {
                    this.baseService.sendBaseToTemp(
                        customize.projeto.user.login,
                        customize.projeto.nome,
                        this.file,
                        '999')
                        .map((res: Response) => res.json())
                        .subscribe(
                            (data) => {
                                console.log(data);
                                this.onLoad = false;
                                if (data.sucesso) {
                                    this.getVar();
                                } else {
                                    if (this.active) {
                                        alert('erro! tentando novamente!');
                                        setTimeout(() => {
                                            this.getVariaveis();
                                        }, 2000);
                                    }
                                }
                            },
                            () => {
                                this.onLoad = false;
                                alert('Aguarde 3 segundos e tente novamente! se o arquivo for grande ele aida esta sendo enviado!');
                            }
                        );
                }
            });
    }

    private onError(error) {
        this.alertService.error(error.message);
    }

    private close() {
        this.activeModal.dismiss('closed');
        this.active = false;
    }

    toogleDropdown() {
        this.visivel = (this.onLoad ? false : (!this.visivel));
    }

    setVar(variavel: string) {
        this.visivel = false;
        this.extra = variavel;
    }

    getVar() {
        this.onLoad = true;
        this.customizeService.getCustomize()
            .subscribe((customize: Customize) => {
                this.baseService.getVarsOfBase(
                    customize.projeto.user.login,
                    customize.projeto.nome,
                    '999'
                ).subscribe(
                    (vars: any) => {
                        if (vars.variaveis) {
                            this.variaveis = vars.variaveis;
                            this.visivel = true;
                        } else {
                            this.retentar();
                            alert('impossivel completar solicitação, tentando novamente em 1 segundo! ' + vars.error);
                        }
                    },
                    (error) => {
                        this.retentar();
                        alert('Erro! tentando novamente em 1 segundo! ' + error.json());
                    },
                    () => {
                        this.onLoad = false;
                    }
                );
            });
    }

    retentar() {
        if (this.active) {
            setTimeout(() => {
                this.getVar();
            }, 1500);
        }
    }

}
