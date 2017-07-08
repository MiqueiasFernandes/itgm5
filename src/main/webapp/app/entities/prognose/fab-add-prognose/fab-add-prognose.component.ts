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
    feito = false;
    onLoad = false;
    campos: string[] = [];
    labelBase1 = 'selecione a base';
    labelBase2 = 'selecione a base';
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
        'estatisticaMAI',
        'estatisticaRMSE',
        'estatisticaBIAS',
        'estatisticaBiasPERCENTUAL',
        'estatisticaCE',
        'estatisticaCORR',
        'estatisticaCorrPERCENTUAL',
        'estatisticaCV',
        'estatisticaCvPERCENTUAL',
        'estatisticaMAE',
        'estatisticaR2',
        'estatisticaResiduoPERCENTUAL',
        'estatisticaResiduos',
        'estatisticaRMSE',
        'estatisticaRmsePERCENTUAL',
        'estatisticaRRMSE'
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
    codigo: Codigo;
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
        this.prognose.salvar = 'list(diretorio = "resultados/", diretorioDAP = "dap/", diretorioHT = "ht/")';
        this.prognose.status = 1;
        this.prognose.fncalculavolume = 'calculaVolumeDefault';
        this.prognose.forcepredict = false;
        this.codigo = new Codigo();
    }

    ngOnInit() {
        this.customizeService.getCustomize()
            .subscribe( (customize: Customize) => {
                if (customize && customize.projeto && customize.cenario) {
                    this.prognose.cenario = customize.cenario;
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
        this.prognose.treino = 0.3;
    }

    voltar() {
        this.atual = this.etapa = Math.max(this.primeira, --this.etapa);
        this.verificar();
    }

    avancar() {
        this.atual = this.etapa = this.feito ? Math.min(this.ultima, ++this.etapa) : this.atual;
        this.verificar();
        if (this.etapa > 5) {
            this.prognose.codigo = this.codigo.resetCodigo().getCodigo(this.prognose);
        }
    }

    goto(netapa: number) {
        if (this.etapa >= netapa) {
            this.atual = netapa;
        }
        this.verificar();
    }
    verificar() {
        switch (this.atual) {
            case 1:
                if (this.codigo.modo === 1) {
                    this.feito = (this.prognose.ajuste !== undefined) && (this.prognose.treino > 0) && (this.prognose.dividir && this.prognose.dividir.length > 0);
                } else if ( this.codigo.modo === 2 ) {
                    this.feito = (this.prognose.ajuste !== undefined) &&  (this.prognose.validacao !== undefined) ;
                } else {
                    this.feito = false;
                }
                break;
            case 2:
                this.feito = this.prognose.modeloExclusivos.length > 0;
                break;
            case 3:
                this.feito = this.prognose.estatisticas && this.prognose.estatisticas.length > 1;
                break;
            case 4:
                this.feito = this.prognose.graficos && this.prognose.graficos.length > 1;
                break;
            case 5:
                this.feito = this.codigo.isMapeado();
                break;
            case 6:
                this.feito = this.prognose.nome && (this.prognose.nome.length > 1);
                break;
        }
        console.log(this.prognose);
        // 'mg = criaModeloGenerico("basico", "y2~y1+b1+idade1 * idade2", "nlsLM", c("idade1", "idade2"), "b1=0.5", requires = "minpack.lm")'
        // 'me = criaModeloExclusivo(mg,variaveis = NULL)'
        // 'configuracao = list();'
        // 'configuracao$basePredicao = data.frame(dap1 = runif(1000,1,3), dap2 = runif(1000,1,3),ht1 = runif(1000,1,3), ht2 = runif(1000,1,3), idade1 = 48, idade2 = 72)'
        // 'configuracao$baseProjecao = data.frame(dap1 = runif(300,1,3), dap2 = runif(300,1,3),ht1 = runif(300,1,3), ht2 = runif(300,1,3), idade1 = 72, idade2 = 96)'
        // 'configuracao$modelos = c(me)'
        // 'configuracao$estatisticas = list(funcoes = getAllEstatisticsFn())'
        // 'configuracao$mapeamento = list(dap1 = "dap1", dap2 = "dap2", ht1 = "ht1", ht2 = "ht2")'
        // 'configuracao$graficos = list(funcoes = getAllGraphicsFn(), vetorial = F)'
        // 'configuracao$salvar = list(diretorio = "avaliaModeloEspecial/", diretorioDAP = "dap/", diretorioHT = "ht/")'
        // 'sd = avaliaModeloEspecial(configuracao)'
    }
    enviar() {
        this.prognoseService.create(this.prognose).subscribe( (prog) => {
                alert('Prognose ' + prog.nome + ' criada com sucesso');
                console.log(prog);
                this.close();
            },
            (error) => this.onError(error.json())
        );
    }
    radiobases($event) {
        if ($event.target.checked) {
            switch ($event.target.id) {
                case 'uma':
                    this.codigo.modo = 1;
                    break;
                case 'duas':
                    this.codigo.modo = 2;
                    break;
            }
        }
        this.verificar();
    }

    setBase1(base: Base) {
        this.prognose.ajuste = base;
        this.labelBase1 = base.nome + ' (' + base.id + ')';
        this.verificar();
    }

    setBase2(base: Base) {
        this.prognose.validacao = base;
        this.labelBase2 = base.nome + ' (' + base.id + ')';
        this.verificar();
    }
    setDividir(campo) {
        this.prognose.dividir = campo;
        this.verificar();
    }
    addModelo($event, modelo: ModeloExclusivo) {
        const index = this.prognose.modeloExclusivos.findIndex( (modeloE) => modeloE.id === modelo.id );
        if ($event.target.checked) {
            if (index < 0) {
                this.prognose.modeloExclusivos.push(modelo);
            }
        } else {
            if (index >= 0) {
                this.prognose.modeloExclusivos.splice(index, 1);
            }
        }
        this.verificar();
    }

    addEstatistica($event, estatistica: string) {
        const index = this.codigo.estatisitcas.findIndex( (obj) => obj === estatistica );
        if ($event.target.checked) {
            if (index < 0) {
                this.codigo.estatisitcas.push(estatistica);
            }
        } else {
            if (index >= 0) {
                this.codigo.estatisitcas.splice(index, 1);
            }
        }
        this.prognose.estatisticas = this.codigo.estatisitcas.join(',');
        this.verificar();
    }

    addGraficos($event, grafico: string) {
        const index = this.codigo.graficos.findIndex( (obj) => obj === grafico );
        if ($event.target.checked) {
            if (index < 0) {
                this.codigo.graficos.push(grafico);
            }
        } else {
            if (index >= 0) {
                this.codigo.graficos.splice(index, 1);
            }
        }
        this.prognose.graficos = this.codigo.graficos.join(',');
        this.verificar();
    }
    setdap1(campo) {
        this.codigo.mapeamento.dap1 =  this.labeldap1 = campo;
        this.prognose.mapeamento = JSON.stringify(this.codigo.mapeamento);
        this.verificar();
    }

    setdap2(campo) {
        this.codigo.mapeamento.dap2 =  this.labeldap2 = campo;
        this.prognose.mapeamento = JSON.stringify(this.codigo.mapeamento);
        this.verificar();
    }

    setht1(campo) {
        this.codigo.mapeamento.ht1 =  this.labelht1 = campo;
        this.prognose.mapeamento = JSON.stringify(this.codigo.mapeamento);
        this.verificar();
    }

    setht2(campo) {
        this.codigo.mapeamento.ht2 =  this.labelht2 = campo;
        this.prognose.mapeamento = JSON.stringify(this.codigo.mapeamento);
        this.verificar();
    }
    private onError(error) {
        this.alertService.error(error.message);
    }

    private close() {
        this.activeModal.dismiss('closed');
    }

}

export class Codigo {
    modo: number;
    estatisitcas: string[];
    graficos: string[];
    codigo;
    modelos = null;
    base1;
    base2;
    mapeamento = {
        dap1: null,
        dap2: null,
        ht1: null,
        ht2: null
    };
    constructor() {
        this.modo = 0;
        this.estatisitcas = [];
        this.graficos = [];
        this.resetCodigo();
    }
    isMapeado(): boolean {
        return this.mapeamento.dap1 && this.mapeamento.dap2 &&
            this.mapeamento.ht1 && this.mapeamento.ht2;
    }

    resetCodigo(): Codigo {
        this.codigo = 'require(ITGM)\n' +
            'configuracao = list();\n';
        this.modelos = this.base1 = this.base2 = null;
        return this;
    }

    private addModeloExclusivo(modeloEx: ModeloExclusivo) {
        try {
            this.codigo += 'mg' + modeloEx.id + ' = ' + modeloEx.modelo.codigo + '\n' +
                'me' + modeloEx.id + ' = criaModeloExclusivo(mg' + modeloEx.id +
                ',variaveis = c(' + modeloEx.mapeamento + ')' +
                ((modeloEx.palpite && (modeloEx.palpite.length > 1)) ? (', palpite=' + modeloEx.palpite) : '') +
                '\n';
            this.modelos = (this.modelos ? (this.modelos + ', ') : '') + 'me' + modeloEx.id;
        } catch (e) {
            alert('Há um problema: ' + e);
        }
    }

    getCodigo(prognose: Prognose) {
        try {
            if (this.modo === 1) {
                this.codigo += 'dftv = separaDados(load(\"../../bases/' + prognose.ajuste.id + '/' + prognose.ajuste.id + '.RData\"),' +
                    ' \"' + prognose.dividir + '\", percTraining = ' + prognose.treino + ')\n' +
                    'configuracao$basePredicao = dftv$treino\n' +
                    'configuracao$baseProjecao = dftv$validacao\n';
            }
            if (this.modo === 2) {
                this.codigo += 'configuracao$basePredicao = load(\"../../bases/' + prognose.ajuste.id + '/' + prognose.ajuste.id + '.RData\")\n' +
                    'configuracao$baseProjecao = load(\"../../bases/' + prognose.validacao.id + '/' + prognose.validacao.id + '.RData\")\n';
            }
            prognose.modeloExclusivos.forEach((modelo) => this.addModeloExclusivo(modelo));
            this.codigo +=
                'configuracao$modelos = c('  + this.modelos + ')\n' +
                'configuracao$estatisticas = list(funcoes = c(' + prognose.estatisticas + '))\n' +
                'configuracao$graficos = list(funcoes = c(' + prognose.graficos + '), vetorial = F)\n' +
                'configuracao$mapeamento = list(' +
                'dap1 = "' + this.mapeamento.dap1 + '", ' +
                'dap2 = "' + this.mapeamento.dap2 + '", ' +
                'ht1 = "' + this.mapeamento.ht1 + '", ' +
                'ht2 = "' + this.mapeamento.ht2 + '")\n' +
                'configuracao$salvar = ' + prognose.salvar + '\n' +
                'configuracao$fnCalculaVolume = ' + prognose.fncalculavolume + '\n' +
                'configuracao$forcePredict = ' + prognose.forcepredict + '\n' +
                'sd = avaliaModeloEspecial(configuracao)';
            return this.codigo;
        } catch (e) {
            return 'Impossível gerar o codigo: ERRO ' + e;
        }
    }
}
