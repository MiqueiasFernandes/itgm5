import { Component, OnInit } from '@angular/core';

import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AlertService} from 'ng-jhipster';
import { HomeService } from '../../../home/home.service';

import {
    Customize, CustomizeService,
    Prognose, PrognoseService,
    Base, BaseService,
    ModeloExclusivo, ModeloExclusivoService
} from '../../';

@Component({
    selector: 'jhi-fab-add-prognose',
    templateUrl: './fab-add-prognose.component.html',
    styleUrls: [
        './fab-add-prognose.scss'
    ]
})
export class FabAddPrognoseComponent implements OnInit {

    prognose: Prognose;
    primeira = 1;
    ultima = 6;
    etapa = 1;
    atual = 1;
    feito = true;
    onLoad = false;
    labelBase1 = 'selecione a base';
    labelBase2 = 'selecione a base';
    campos: string[] = [];
    labeldap1 = 'campo';
    labeldap2 = 'campo';
    labelht1 = 'campo';
    labelht2 = 'campo';
    estatisticasLabel = [
        'MAI',
        'RMSE',
        'BIAS',
        'Bias percentual',
        'CE',
        'correlação',
        'correlação percentual',
        'covariância',
        'covariância percentual',
        'MAE',
        'R2',
        'Resíduo percentual',
        'Resíduo absoluto',
        'RMSE',
        'Rmse percentual',
        'RRMSE'
    ];
    estatisticas = [
        'MAI',
        'RMSE',
        'BIAS',
        'BiasPERCENTUAL',
        'CE',
        'CORR',
        'CorrPERCENTUAL',
        'CV',
        'CvPERCENTUAL',
        'MAE',
        'R2',
        'ResiduoPERCENTUAL',
        'Residuos',
        'RMSE',
        'RmsePERCENTUAL',
        'RRMSE'
    ];
    graficosLabel = [
        'Graphico ggplot Observado vesrsus Estimado',
        'Graphico de Histograma',
        'Graphicp de Observado versus Estimado padrão',
        'Graphico de Resíduo Absoluto',
        'Graphico de Resíduo Percentual'
    ];
    graficos = [
        'getggplot2GraphicObservadoXEstimado',
        'getGraphicHistogram',
        'getGraphicObservadoXEstimado',
        'getGraphicResiduoAbs',
        'getGraphicResiduoPerc'
    ];
    bases: Base[] = [];
    modelos: ModeloExclusivo[] = [];
    avaliacao: Avaliacao = new Avaliacao();
    constructor(
        public activeModal: NgbActiveModal,
        private customizeService: CustomizeService,
        private alertService: AlertService,
        private prognoseService: PrognoseService,
        private baseService: BaseService,
        private modeloExclusivoService: ModeloExclusivoService,
        private homeService: HomeService,
    ) {
        this.prognose = new Prognose();
    }

    ngOnInit() {
        this.customizeService.getCustomize()
            .subscribe( (customize: Customize) => {
                if (customize && customize.projeto && customize.cenario) {

                    this.baseService.getBasesByProjeto(customize.projeto)
                        .subscribe( (bases) => {
                            this.bases = bases;
                            bases.forEach((base: Base) => {
                                this.baseService.getFieldsOfBase(base).subscribe(
                                    (res: string[]) => {
                                        if (res && (res.length > 0)) {
                                            res.forEach((campo) => {
                                                if (this.campos.indexOf(campo) < 0) {
                                                    this.campos.push(campo);
                                                }
                                            });
                                        }
                                    },
                                    (error) => {
                                        console.log('erro ao obter base: ' + JSON.stringify(error.json()));
                                    }
                                );
                            });
                        });

                    this.modeloExclusivoService.getModeloExclusivoByCenario(customize.cenario)
                        .subscribe( (modelos) => {
                            this.modelos = modelos;
                        });

                }
            });
    }

    voltar() {
        this.atual = this.etapa = Math.max(this.primeira, --this.etapa);
    }

    avancar() {
        this.atual = this.etapa = this.feito ? Math.min(this.ultima, ++this.etapa) : this.atual;
    }

    goto(netapa: number) {
        if (this.etapa >= netapa) {
            this.atual = netapa;
        }
    }
    enviar() {
        alert('e');
        // require(ITGM)
        // mg = criaModeloGenerico("basico", "y2~y1+b1+idade1 * idade2", "nlsLM", c("idade1", "idade2"), "b1=0.5", requires = "minpack.lm")
        // me = criaModeloExclusivo(mg,variaveis = NULL)
        // configuracao = list();
        // configuracao$basePredicao = data.frame(dap1 = runif(1000,1,3), dap2 = runif(1000,1,3),ht1 = runif(1000,1,3), ht2 = runif(1000,1,3), idade1 = 48, idade2 = 72)
        // configuracao$baseProjecao = data.frame(dap1 = runif(300,1,3), dap2 = runif(300,1,3),ht1 = runif(300,1,3), ht2 = runif(300,1,3), idade1 = 72, idade2 = 96)
        // configuracao$modelos = c(me)
        // configuracao$estatisticas = list(funcoes = getAllEstatisticsFn())
        // configuracao$mapeamento = list(dap1 = "dap1", dap2 = "dap2", ht1 = "ht1", ht2 = "ht2")
        // configuracao$graficos = list(funcoes = getAllGraphicsFn(), vetorial = F)
        // configuracao$salvar = list(diretorio = "avaliaModeloEspecial/", diretorioDAP = "dap/", diretorioHT = "ht/")
        // sd = avaliaModeloEspecial(configuracao)

        // this.onLoad = true;
        // this.customizeService.getCustomize()
        //     .subscribe((customize: Customize) => {
        //         if (customize && customize.cenario) {
        //
        //         }
        //     });
    }
    radiobases($event) {
        if ($event.target.checked) {
            switch ($event.target.id) {
                case 'uma':
                    this.avaliacao.bases.modo = 1;
                    break;
                case 'duas':
                    this.avaliacao.bases.modo = 2;
                    break;
            }
        }
    }

    setBase1(base: Base) {
        this.avaliacao.bases.treino = base;
        this.labelBase1 = base.nome + ' (' + base.id + ')';
    }

    setBase2(base: Base) {
        this.avaliacao.bases.avaliacao = base;
        this.labelBase2 = base.nome + ' (' + base.id + ')';
    }
    addModelo($event, modelo: ModeloExclusivo) {
        if ($event.target.checked) {
            if (this.avaliacao.modelos.indexOf(modelo) < 0) {
                this.avaliacao.modelos.push(modelo);
            }
        } else {
            this.avaliacao.modelos = this.avaliacao.modelos
                .splice(this.avaliacao.modelos.indexOf(modelo), 1);
        }
    }

    addEstatistica($event, estatistica: string) {
        if ($event.target.checked) {
            if (this.avaliacao.estatisitcas.indexOf(estatistica) < 0) {
                this.avaliacao.estatisitcas.push(estatistica);
            }
        } else {
            this.avaliacao.estatisitcas = this.avaliacao.estatisitcas
                .splice(this.avaliacao.estatisitcas.indexOf(estatistica), 1);
        }

    }

    addGraficos($event, grafico: string) {
        if ($event.target.checked) {
            if (this.avaliacao.graficos.indexOf(grafico) < 0) {
                this.avaliacao.graficos.push(grafico);
            }
        } else {
            this.avaliacao.graficos = this.avaliacao.graficos
                .splice(this.avaliacao.graficos.indexOf(grafico), 1);
        }

    }
    setdap1(campo) {
        this.avaliacao.mapeamento['dap1'] =  this.labeldap1 = campo;
    }

    setdap2(campo) {
        this.avaliacao.mapeamento['dap2'] =  this.labeldap2 = campo;
    }

    setht1(campo) {
        this.avaliacao.mapeamento['ht1'] =  this.labelht1 = campo;
    }

    setht2(campo) {
        this.avaliacao.mapeamento['ht2'] =  this.labelht2 = campo;
    }
    private onError(error) {
        this.alertService.error(error.message);
    }

    private close() {
        this.activeModal.dismiss('closed');
    }

}

export class Avaliacao {

    bases: Bases;
    modelos: ModeloExclusivo[];
    estatisitcas: string[];
    graficos: string[];
    mapeamento = [];

    constructor() {
        this.bases = new Bases();
        this.modelos = [];
        this.estatisitcas = [];
        this.graficos = [];
    }
}

export class Bases {
    modo: number;
    treino: Base;
    avaliacao: Base;
    percentual: number;

    constructor() {
        this.modo = 0;
        this.treino = null;
        this.avaliacao = null;
        this.percentual = 0.3;
    }
}
