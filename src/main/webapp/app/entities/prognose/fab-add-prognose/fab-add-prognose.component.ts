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
import {Modelo} from "../../modelo/modelo.model";

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
    labelparcela = 'campo';
    labelidade2 = 'campo';
    labelareacorr = 'campo';
    chekMod = [];
    chekEst = [];
    chekGraf = [];
    radio1 = false;
    radio2 = false;
    ediarPalpites = false;
    estatisticasLabel = [
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
        'estatisticasBIAS',
        'estatisticasBiasPERCENTUAL',
        'estatisticasCE',
        'estatisticasCORR',
        'estatisticasCorrPERCENTUAL',
        'estatisticasCV',
        'estatisticasCvPERCENTUAL',
        'estatisticasMAE',
        'estatisticasR2',
        'estatisticasResiduoPERCENTUAL',
        'estatisticasResiduos',
        'estatisticasRMSE',
        'estatisticasRmsePERCENTUAL',
        'estatisticasRRMSE'
    ];
    graficosLabel = [
        // 'getggplot2GraphicObservadoXEstimadoTotal',
        'Graphico ggplot Observado vesrsus Estimado Colorido',
        'Gráfico de Histograma',
        'Gráficp de Observado versus Estimado padrão',
        'Gráfico de Resíduo Absoluto',
        'Gráfico de Resíduo Percentual',
        'Gráfico Total por parcela',
        'Gráfico dinâmico'
    ];
    graficos = [
        // 'getggplot2GraphicObservadoXEstimadoTotal',
        'getggplot2GraphicObservadoXEstimado',
        'getGraphicHistogram',
        'getGraphicObservadoXEstimado',
        'getGraphicResiduoAbs',
        'getGraphicResiduoPerc',
        'getGraphicVolumeTotal',
        'plotRB'
    ];
    bases: Base[] = [];
    modelos: ModeloExclusivo[] = [];
    codigo: Codigo;
    removerColSus = true;
    maxIt = true;
    palpites = [];
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
        this.prognose.dividir = 'campo';
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
                            if (bases.length === 1) {
                                this.setBase1(bases[0]);
                            }
                            bases.forEach((base: Base) => {
                                this.baseService.getFieldsOfBase(base).subscribe(
                                    (res: string[]) => {
                                        if (res && (res.length > 0)) {
                                            res.forEach((campo) => {
                                                if (this.campos.indexOf(campo) < 0) {
                                                    this.campos.push(campo);

                                                    if (campo.toLowerCase().indexOf('parcela') >= 0) {
                                                        if ('campo' === this.prognose.dividir) {
                                                            this.setDividir(campo);
                                                        }
                                                        this.setparcela(campo);
                                                    } else {
                                                        switch (campo.toLowerCase()) {
                                                            case 'dap1':
                                                                this.setdap1(campo);
                                                                break;
                                                            case 'dap2':
                                                                this.setdap2(campo);
                                                                break;
                                                            case 'ht1':
                                                                this.setht1(campo);
                                                                break;
                                                            case 'ht2':
                                                                this.setht2(campo);
                                                                break;
                                                            case 'idadearred2':
                                                                this.setidade2(campo);
                                                                break;
                                                            case 'areacorr':
                                                                this.setareacorr(campo);
                                                                break;
                                                        }
                                                    }

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
                            this.modelos.forEach( (me) => {
                                this.palpites[me.id] = me.palpite;
                            });
                        });
                }
            });
        this.prognose.treino = 70;
        this.prognose.graficos = 'getggplot2GraphicObservadoXEstimadoTotal';
    }

    setPrognose(prognose: Prognose) {
        this.setBase1(prognose.ajuste);
        this.setBase2(prognose.validacao);
        this.codigo.modo = (prognose.validacao !== null && prognose.validacao !== undefined) ? 2 : 1;
        this.radio1 = !( this.radio2 = (this.codigo.modo === 2));
        this.prognose.dividir = prognose.dividir;
        this.prognose.treino = prognose.treino;
        prognose.modeloExclusivos.forEach((me) => { this.addModelo({target: { checked: true }}, me); });
        prognose.estatisticas.split(',').forEach( (stat) => this.addEstatistica({ target: { checked: true}}, ('estatisticas' + stat), false ) );
        prognose.graficos.split(',').forEach( (graf) => this.addGraficos({target: { checked: true }}, graf) );
        try {
            const obj = JSON.parse(prognose.mapeamento);
            this.setdap1( obj.dap1);
            this.setdap2( obj.dap2);
            this.setht1(obj.ht1);
            this.setht2(obj.ht2);
            this.setparcela(obj.parcela);
            this.setidade2(obj.idade2);
        } catch (e) {
            console.log(e);
        }
        this.verificar();
    }

    voltar() {
        this.atual = this.etapa = Math.max(this.primeira, --this.etapa);
        this.verificar();
    }

    avancar() {
        this.atual = this.etapa = this.feito ? Math.min(this.ultima, ++this.etapa) : this.atual;
        this.verificar();
        if (this.etapa > 5) {
            this.compilar();
        }
    }

    compilar() {

        this.prognose.modeloExclusivos.forEach( (me, idx) => {
            me.palpite = this.palpites[me.id];
            this.prognose.modeloExclusivos[idx] = me;
        });

        this.prognose.codigo = this.codigo.resetCodigo().getCodigo(this.prognose, this.removerColSus, this.maxIt);
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
                this.prognose.estatisticas = this.codigo.estatisitcas.join(',');
                this.feito = this.prognose.estatisticas && this.prognose.estatisticas.length > 1;
                break;
            case 4:
                this.prognose.graficos = this.codigo.graficos.join(',');
                this.feito = this.prognose.graficos && this.prognose.graficos.length > 1;
                break;
            case 5:
                this.prognose.mapeamento = JSON.stringify(this.codigo.mapeamento);
                this.feito = this.codigo.isMapeado();
                break;
            case 6:
                this.feito = this.prognose.nome && (this.prognose.nome.length > 1);
                break;
        }
    }
    enviar() {
        if (this.etapa === 6 && this.feito) {
            this.prognose.estatisticas = this.prognose.estatisticas.replace(/estatisticas/g, '');
            this.prognoseService.create(this.prognose).subscribe((prog) => {
                    // alert('Prognose ' + prog.nome + ' criada com sucesso');
                    // console.log(prog);
                    this.homeService.openPrognose(prog);
                    this.close();
                },
                (error) => this.onError(error.json())
            );
        } else {
            alert('Complete todos pasos!');
        }
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
        if (base) {
            this.prognose.validacao = base;
            this.labelBase2 = base.nome + ' (' + base.id + ')';
        }
        this.verificar();
    }
    setDividir(campo) {
        this.prognose.dividir = campo;
        this.verificar();
    }
    addModelo($event, modelo: ModeloExclusivo) {
        const index = this.prognose.modeloExclusivos.findIndex( (modeloE) => modeloE.id === modelo.id );
        this.chekMod[modelo.id] = true;
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

    addEstatistica($event, estatistica: string, compare: boolean) {
        const index = this.codigo.estatisitcas.findIndex( (obj) => obj === estatistica );
        this.chekEst[estatistica] = $event.target.checked;
        if ($event.target.checked) {
            if (index < 0) {
                this.codigo.estatisitcas.push(estatistica);
            }
        } else {
            if (index >= 0) {
                this.codigo.estatisitcas.splice(index, 1);
            }
        }

        if (compare) {
            if (!$event.target.checked) {
                if (estatistica.indexOf('PERCENTUAL') < 0) {
                    switch (estatistica) {
                        case 'estatisticasBIAS':
                            this.addEstatistica({target: {checked: false}}, 'estatisticasBiasPERCENTUAL', false);
                            break;
                        case 'estatisticasCORR' :
                            this.addEstatistica({target: {checked: false}}, 'estatisticasCorrPERCENTUAL', false);
                            break;
                        case 'estatisticasCV' :
                            this.addEstatistica({target: {checked: false}}, 'estatisticasCvPERCENTUAL', false);
                            break;
                        case 'estatisticasResiduos':
                            this.addEstatistica({target: {checked: false}}, 'estatisticasResiduoPERCENTUAL', false);
                            break;
                        case 'estatisticasRMSE':
                            this.addEstatistica({target: {checked: false}}, 'estatisticasRmsePERCENTUAL', false);
                            break;
                    }
                }
            } else {
                if (estatistica.indexOf('PERCENTUAL') > 0) {
                    switch (estatistica) {
                        case 'estatisticasBiasPERCENTUAL':
                            this.addEstatistica({target: {checked: true}}, 'estatisticasBIAS', false);
                            break;
                        case 'estatisticasCorrPERCENTUAL':
                            this.addEstatistica({target: {checked: true}}, 'estatisticasCORR', false);
                            break;
                        case 'estatisticasCvPERCENTUAL':
                            this.addEstatistica({target: {checked: true}}, 'estatisticasCV', false);
                            break;
                        case 'estatisticasResiduoPERCENTUAL':
                            this.addEstatistica({target: {checked: true}}, 'estatisticasResiduos', false);
                            break;
                        case 'estatisticasRmsePERCENTUAL':
                            this.addEstatistica({target: {checked: true}}, 'estatisticasRMSE', false);
                            break;
                    }
                }
            }
        }
        this.codigo.estatisitcas.sort((a, b) => a.indexOf('PERCENTUAL') > 0 ? 1 : a.localeCompare(b) );
        this.prognose.estatisticas = this.codigo.estatisitcas.join(',');
        this.verificar();
    }

    addGraficos($event, grafico: string) {
        const index = this.codigo.graficos.findIndex( (obj) => obj === grafico );
        this.chekGraf[grafico] = $event.target.checked;
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
        this.verificar();
    }

    setdap2(campo) {
        this.codigo.mapeamento.dap2 =  this.labeldap2 = campo;
        this.verificar();
    }
    setht1(campo) {
        this.codigo.mapeamento.ht1 =  this.labelht1 = campo;
        this.verificar();
    }
    setht2(campo) {
        this.codigo.mapeamento.ht2 =  this.labelht2 = campo;
        this.verificar();
    }
    setparcela(campo) {
        this.codigo.mapeamento.parcela =  this.labelparcela = campo;
        this.verificar();
    }
    setareacorr(campo) {
        this.codigo.mapeamento.areacorr =  this.labelareacorr = campo;
        this.verificar();
    }
    setidade2(campo) {
        this.codigo.mapeamento.idade2 =  this.labelidade2 = campo;
        this.verificar();
    }
    invertMod() {
        this.modelos.forEach( (me) => {
            const index = this.prognose.modeloExclusivos.findIndex( (modeloE) => modeloE.id === me.id );
            if (index < 0) {
                this.prognose.modeloExclusivos.push(me);
            } else {
                this.prognose.modeloExclusivos.splice(index, 1);
            }
            this.chekMod[me.id] = (index < 0);
        });
        this.verificar();
    }
    invertEst() {
        this.estatisticas.forEach( (stat) => {
            const index = this.codigo.estatisitcas.indexOf(stat);
            if (index < 0) {
                this.addEstatistica({target: { checked: true }}, stat, false);
            } else {
                this.addEstatistica({target: { checked: false }}, stat, false);
            }
            this.chekEst[stat] = (index < 0);
        });
        this.verificar();
    }
    invertGraf() {
        this.graficos.forEach( (graf) => {
            const index = this.codigo.graficos.indexOf(graf);
            if (index < 0) {
                this.codigo.graficos.push(graf);
            } else {
                this.codigo.graficos.splice(index, 1);
            }
            this.chekGraf[graf] = (index < 0);
        });
        this.verificar();
    }
    getLabelModelo() {
        return ((this.prognose.modeloExclusivos.length  < 1) ?
            'Marcar todos' : ((this.prognose.modeloExclusivos.length < this.modelos.length) ?
                'inverter' : 'Desmarcar Todos'));
    }
    getLabelEstatistica() {
        return ((this.codigo.estatisitcas.length < 1) ?
            'Marcar todos' :
            ((this.codigo.estatisitcas.length < this.estatisticas.length) ? 'inverter' : 'Desmarcar Todos'));
    }

    getLabelGrafico() {
        return  ((this.codigo.graficos.length < 2) ?
            'Marcar todos' :
            ((this.codigo.graficos.length < (this.graficos.length + 1)) ?
                'inverter' : 'Desmarcar Todos'));
    }

    desfazerPalpites() {
        this.modelos.forEach( (me) => {
            this.palpites[me.id] = me.palpite;
        });
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
        ht2: null,
        parcela: null,
        idade2: null,
        areacorr: null
    };
    constructor() {
        this.modo = 0;
        this.estatisitcas = [];
        this.graficos = [];
        this.graficos.push('getggplot2GraphicObservadoXEstimadoTotal');
        this.resetCodigo();
    }
    isMapeado(): boolean {
        return this.mapeamento.dap1 && this.mapeamento.dap2 &&
            this.mapeamento.ht1 && this.mapeamento.ht2
            && this.mapeamento.parcela && this.mapeamento.idade2 && this.mapeamento.areacorr;
    }

    resetCodigo(): Codigo {
        this.codigo = 'require(ITGM)\n' +
            'cfg=list()\n';
        this.modelos = this.base1 = this.base2 = null;
        return this;
    }

    private addModeloExclusivo(modeloEx: ModeloExclusivo, maxIt) {
        try {
            let modelo = modeloEx.modelo;
            if (maxIt && (!modelo.parametros ||
                modelo.parametros.indexOf('control = c(maxiter=500, maxfev=500)') < 0)) {
                modelo = Object.assign(new Modelo(), modelo);
                modelo.parametros = ((modelo.parametros && modelo.parametros.length > 2 ) ? (modelo.parametros + ',') : '') +
                    'control = c(maxiter=500, maxfev=500)';
            }
            this.codigo += 'mg' + modeloEx.id + '=' + new Modelo().buildCodigoForModelo(modelo) + '\n' +
                'me' + modeloEx.id + '=mg' + modeloEx.id + '(' + modeloEx.mapeamento
                    .split(',')
                    .map( (str) => str.split('=')[0] + '=\"' + str.split('=')[1] + '\"' )
                    .join(',') +
                ((modeloEx.palpite && (modeloEx.palpite.length > 1)) ? (',palpite=c(' + modeloEx.palpite +  '))') : ')') + '\n';
            this.modelos = (this.modelos ? (this.modelos + ',') : '') + 'me' + modeloEx.id;
        } catch (e) {
            alert('Há um problema: ' + e + ' revise modelos no código gerado.');
        }
    }

    getCodigo(prognose: Prognose, removeCols, maxIt) {
        try {
            if (this.modo === 1) {
                this.codigo += 'df=separaDados(get(load(\"../../bases/' + prognose.ajuste.id + '/' + prognose.ajuste.id + '.RData\")),' +
                    '\"' + prognose.dividir + '\", percTraining=' + (prognose.treino / 100) + ')\n' +
                    'cfg$basePredicao=df$treino\n' +
                    'cfg$baseProjecao=df$validacao\n';
            }
            if (this.modo === 2) {
                this.codigo += 'cfg$basePredicao=load(get(\"../../bases/' + prognose.ajuste.id + '/' + prognose.ajuste.id + '.RData\"))\n' +
                    'cfg$baseProjecao=load(get(\"../../bases/' + prognose.validacao.id + '/' + prognose.validacao.id + '.RData\"))\n';
            }
            prognose.modeloExclusivos.forEach((modelo) => this.addModeloExclusivo(modelo, maxIt));
            this.codigo +=
                'cfg$modelos=c('  + this.modelos + ')\n' +
                'cfg$estatisticas=list(funcoes=c(' + prognose.estatisticas + '))\n' +
                'cfg$graficos=list(funcoes=c(' + prognose.graficos + '),vetorial=F,diretorio=prognose.caminho,totalizar=TRUE,campoID="' + this.mapeamento.parcela + '")\n' +
                'cfg$mapeamento=list(' +
                'dap1=\"' + this.mapeamento.dap1 + '\",' +
                'dap2=\"' + this.mapeamento.dap2 + '\",' +
                'ht1=\"' + this.mapeamento.ht1 + '\",' +
                'ht2=\"' + this.mapeamento.ht2 + '\",' +
                'parcela=\"' + this.mapeamento.parcela + '\",' +
                'areacorr=\"' + this.mapeamento.areacorr + '\",' +
                'idade2=\"' + this.mapeamento.idade2 + '\")\n' +
                'cfg$salvar=' + prognose.salvar + '\n' +
                'cfg$fnCalculaVolume=' + prognose.fncalculavolume + '\n' +
                'cfg$forcePredict=' + (prognose.forcepredict  ? 'TRUE' : 'FALSE') + '\n' +
                'cfg$rmColsSuspicious=' + (removeCols ? 'TRUE' : 'FALSE') + '\n' +
                'sd=avaliaModeloEspecial(cfg)';
            return this.codigo;
        } catch (e) {
            return 'Impossível gerar o codigo: ERRO ' + e;
        }
    }
}
