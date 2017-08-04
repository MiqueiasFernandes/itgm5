import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';

import {EventManager} from 'ng-jhipster';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Account, AccountService, Principal} from '../../shared';
import {SidebarService} from './sidebar.service';
import { HomeService } from '../../home/home.service';
import {
    Projeto,
    Cenario,
    CenarioService,
    Base,
    BaseService,
    Modelo,
    ModeloService,
    SelecionarProjetoComponent,
    SelecionarCenarioComponent,
    ModeloExclusivo,
    ModeloExclusivoService,
    FabAddBaseComponent,
    FabAddModeloComponent,
    Customize,
    CustomizeService,
    Prognose,
    PrognoseService
} from '../../entities/';

import { ShareService } from '../share/share.service';
import { FolderComponent } from './folder/folder.component';
import {FabAddPrognoseComponent} from '../../entities/prognose/fab-add-prognose/fab-add-prognose.component';
import {MapearModeloComponent} from '../../entities/modelo-exclusivo/mapear-modelo/mapear-modelo.component';

@Component({
    selector: 'jhi-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.scss'],
    entryComponents: [
        FolderComponent,
    ]
})
export class SidebarComponent implements OnInit {

    // private isViewInitialized = false;

    isSidebarFixed = false;
    nome = '';
    email = '';
    image = null;
    projeto: Projeto = undefined;
    cenario: Cenario = undefined;
    isbasesOpen = false;
    isModelosOpen = false;
    isArquivosOpen = false;
    isResultadosOpen = false;
    bases: Base[] = null;
    modelos: Modelo[] = null;
    modelosMapeados: number[] = [];
    prognoses: Prognose[] = [];
    modelosExclusivos: ModeloExclusivo[] = [];
    customize: Customize = null;
    arquivos = [];
    loadArquivos = false;
    loadBases = false;
    loadModelos = false;
    lista = [];

    constructor(
        private principal: Principal,
        private eventManager: EventManager,
        private sidebarService: SidebarService,
        private router: Router,
        private modalService: NgbModal,
        private modeloExclusivoService: ModeloExclusivoService,
        private shareService: ShareService,
        private customizeService: CustomizeService,
        private baseService: BaseService,
        private modeloService: ModeloService,
        private prognoseService: PrognoseService,
        private cenarioService: CenarioService,
        private homeService: HomeService
    ) {
        this.isSidebarFixed = sidebarService.isLock();

        sidebarService.lockedObserver$.subscribe((lock: boolean) => {
            this.isSidebarFixed = lock;
        });

        this.eventManager.subscribe('customizeListModification', () => {
            this.customizeService.getCustomize()
                .subscribe(
                    (customize: Customize) => {
                        if (customize) {
                            this.projeto = customize.projeto;
                            this.cenario = customize.cenario;
                            this.customize = customize;
                        }else {
                            this.projeto =  null;
                            this.cenario =  null;
                            this.customize = null;
                        }
                        this.closeMenuBases();
                        this.closeMenuModelos();
                    }
                );
        });
    }

    ngOnInit() {
        this.principal.identity().then((account: Account) => {
            this.getDados(account);
        });
        this.principal.getAuthenticationState().subscribe((account) => {
            this.getDados(account);
        });
        this.registerAuthenticationSuccess();
        this.openSidebar();
    }

    private registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', () => {
            this.principal.identity().then((account: Account) => {
                this.getDados(account);
                this.openSidebar();
            });
        });
    }

    getDados(account: Account) {
        if (!account) {
            this.closeSidebar();
        } else {
            this.nome =
                (account.firstName ? account.firstName : '') + ' ' +
                (account.lastName ? account.lastName : '');
            this.email = account.email;
            this.image = account.imageUrl ? ('http://localhost:8098/temp/' + account.imageUrl) : null;
        }
    }

    toogleBlockSideBar() {
        this.sidebarService.toogleSidebarFixed();
        if (!this.sidebarService.isLock()) {
            this.closeSidebar();
        }
    }

    openSidebar() {
        this.sidebarService.openSidebar();
    }

    closeSidebar() {
        this.sidebarService.closeSidebar();
    }

    isUserAuthenticated() {
        return this.principal.isAuthenticated();
    }

    configurar() {
        if (!this.nome || this.nome === ' ' || !this.image) {
            this.router.navigate(['/settings']);
        }
    }

    closeMenuModelos() {
        this.isModelosOpen = false;
        this.modelosMapeados = [];
        this.modelos = null;
    }

    closeMenuBases() {
        this.isbasesOpen = false;
        this.bases = null;
    }

    trackId(index: number, item: any) {
        return item.id;
    }

    isModeloMapeado(modelo: Modelo): boolean {
        return (this.modelosMapeados.indexOf(modelo.id) > -1);
    }

    mapear(modelo: Modelo) {
        if (!this.isModeloMapeado(modelo) && this.cenario) {
            let ref: NgbModalRef;
            ref = this.modalService.open(MapearModeloComponent);
            ref.componentInstance.setModelo(modelo);
            ref.componentInstance.setCenario(this.cenario);
            ref.componentInstance.setProjeto(this.projeto);
        }
    }

    excluirMapeamento(modelo: Modelo) {
        this.modeloExclusivoService.getModeloExclusivoByModeloAndCenario(modelo, this.cenario)
            .subscribe(
                (modelosExclusivos: ModeloExclusivo[]) => {
                    modelosExclusivos.forEach((modeloEx: ModeloExclusivo) => {
                        this.router.navigate(['/', { outlets: { popup: 'modelo-exclusivo/' + modeloEx.id + '/delete'} }]);
                        this.closeMenuModelos();
                    });
                }
            );
    }

    addNewBase() {
        this.customizeService.getCustomize()
            .subscribe(
                (customize: Customize) => {
                    if ( customize && customize.projeto) {
                        this.modalService.open(FabAddBaseComponent);
                    }
                }
            );
    }

    addNewModelo() {
        this.modalService.open(FabAddModeloComponent);
    }

    loadAllBases() {
        this.closeMenuModelos();
        this.closeMenuArquivos();
        this.closeMenuResultados();
        if (this.bases === null) {
            this.loadBases = true;
            this.customizeService.getCustomize()
                .subscribe(
                    (customize: Customize) => {
                        if (customize && customize.projeto) {
                            this.baseService
                                .getBasesByProjeto(customize.projeto)
                                .subscribe(
                                    (bases: Base[]) => {
                                        this.bases = bases;
                                        this.isbasesOpen = true;
                                    },
                                    () => {
                                        this.bases = null;
                                        this.isbasesOpen = false;
                                    });
                        }
                    },
                    () => {

                    },
                    () => {
                        this.loadBases = false;
                    });

        } else {
            this.bases = null;
            this.isbasesOpen = false;
        }
    }

    loadAllModelos() {
        this.closeMenuBases();
        this.closeMenuArquivos();
        this.closeMenuResultados();
        if (this.modelos === null) {
            this.loadModelos = true;
            this.modeloService.getAllModelos().subscribe(
                (modelos: Modelo[]) => {
                    this.modelos = modelos;
                    this.isModelosOpen = true;
                    modelos.forEach((modelo) => {
                        this.modeloExclusivoService
                            .getModeloExclusivoByModeloAndCenario(modelo, this.cenario)
                            .subscribe((modelosExclusivos: ModeloExclusivo[]) => {
                                if (
                                    modelosExclusivos !== null &&
                                    modelosExclusivos !== undefined &&
                                    modelosExclusivos.length > 0) {
                                    this.modelosMapeados.push(modelo.id);
                                }
                            });
                    });
                },
                () => {

                },
                () => {
                    this.loadModelos = false;
                }
            );
        } else {
            this.isModelosOpen = false;
            this.modelos = null;
        }
    }

    selecionarProjeto() {
        this.modalService.open(SelecionarProjetoComponent);
    }

    selecionarCenario() {
        this.customizeService.getCustomize()
            .subscribe(
                (customize: Customize) => {
                    if (customize && customize.projeto) {
                        this.modalService.open(SelecionarCenarioComponent);
                    }
                });
    }

    compartilharBase(base: Base) {
        this.shareService.compartilharBase(base);
    }

    compartilharModelo(modelo: Modelo) {
        this.shareService.compartilharModelo(modelo);
    }

    listar() {
        if ( this.isArquivosOpen ) {
            this.closeMenuArquivos();
        } else {
            this.loadArquivos = true;
            this.closeMenuBases();
            this.closeMenuModelos();
            this.closeMenuResultados();
            this.isArquivosOpen = true;
            this.cenarioService
                .listFiles(this.cenario)
                .subscribe(
                    (res: string) => {
                        res.split(',').forEach((arq) => {
                            this.arquivos.push(
                                arq.substring(
                                    this.cenario.caminho.length
                                )
                            );
                        });
                    },
                    () => {
                        alert('Houve um erro ao obter a lista de arquivos!');
                        this.closeMenuArquivos();
                    },
                    () => {
                        this.loadArquivos = false;
                    }
                );
        }
    }

    closeMenuArquivos() {
        this.isArquivosOpen = false;
        this.arquivos = [];
    }

    novaPrognose() {
        this.modalService.open(FabAddPrognoseComponent, {size: 'lg'});
    }

    closeMenuResultados() {
        this.isResultadosOpen = false;
        this.prognoses = [];
    }

    closeMenus() {
        this.closeMenuArquivos();
        this.closeMenuModelos();
        this.closeMenuBases();
        this.closeMenuResultados();
    }

    mostrarResultados() {
        this.closeMenus();
        this.isResultadosOpen = true;
        this.prognoseService
            .getPrognosesByCenario(this.cenario)
            .subscribe( (prognoses: Prognose[]) => {
                this.prognoses = prognoses;
            });
    }

    loadPrognose($event, p) {
        this.prognoseService.find(p.id).subscribe((prognose) => {
            console.log(prognose);
            p.modeloExclusivos = prognose.modeloExclusivos;
        });
        this.setLocal($event, 0, p.id);
    }

    setLocal($event, nivel, local) {
        $event.stopPropagation();
        this.lista[nivel] = local;
        for (let i = nivel + 1; i < 5; i++) {
            this.lista[i] = 0;
        }
        console.log(this.lista);
    }

    getObj(prognose: Prognose, modelo: ModeloExclusivo, ajuse, modo) {
        try {
            return JSON.parse(prognose.relatorio)
                .resultados[modelo.modelo.nome];
        } catch (e) {
            console.log(e);
            return {};
        }
    }

    getResultados(prognose: Prognose, modelo: ModeloExclusivo, ajuse, modo) {
        let obj: any;
        try {
            obj = this.getObj(prognose, modelo, ajuse, modo);
        } catch (e) {
            console.log(e);
            return {};
        }
        return ajuse ? (obj.ajuste ? obj.ajuste : {}) : (obj.validacao ? obj.validacao : {});
    }

    getEstatisticas(prognose, modelo, ajuse, modo) {
        let obj = {
            bias: undefined,
            biasPERCENTUAL: undefined,
            ce: undefined,
            corr: undefined,
            corr_PERCENTUAL: undefined,
            cv: undefined,
            cvPERCENTUAL: undefined,
            mae: undefined,
            r2: undefined,
            rmse: undefined,
            rmsePERCENTUAL: undefined,
            rrmse: undefined
        };
        try {
            obj = Object.assign(obj, this.getResultados(prognose, modelo, ajuse, modo).estatisticas);
        } catch (e) {
            console.log(e);
        }
        return obj;
    }

    getDiretorio(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
        const obj = this.getObj(prognose, modelo, ajuste, modo);
        // const resultados = this.getResultados(prognose, modelo, ajuste, modo);
        const alias = obj.alias;

        let str = '';
        let md = 'Volume';
        if (modo === 0) {
            str += 'dap/';
            md = 'DAP';
        } else if (modo === 1) {
            str += 'ht/';
            md = 'HT';
        }

        str += alias;
        let tp = 'Ajuste';
        if (!ajuste) {
            str += '/validacao';
            tp = 'Validacao';
        }

        const ret =  [ str, tp, md, alias];
        console.log(ret);

        return ret;
    }

    // getArquivo(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
    //     const dados = this.getDiretorio(prognose, modelo, ajuste, modo);
    //     return dados[0] + dados[1] + ' ' + dados[2] + ' ' + dados[3] + ' - estatisticas do modelo.csv';
    // }
    getArquivoSTAT1(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
        const dados = this.getDiretorio(prognose, modelo, ajuste, modo);
        // return dados[0] + dados[1] + ' ' + dados[2] + ' ' + dados[3] + ' - estatisticas.csv';
        this.show(prognose, dados[0], dados[1].toLowerCase() + ' ' + dados[2] + ' ' + dados[3] + ' - estatisticas.csv');
    }
    getArquivoSTAT2(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
        const dados = this.getDiretorio(prognose, modelo, ajuste, modo);
        // return dados[0] + dados[1] + ' ' + dados[2] + ' ' + dados[3] + ' - estatisticas do modelo.csv';
        this.show(prognose, dados[0], dados[1].toLowerCase() + ' ' + dados[2] + ' ' + dados[3] + ' - estatisticas do modelo.csv');
    }
    getArquivoGrafGG(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
        const dados = this.getDiretorio(prognose, modelo, ajuste, modo);
        // return dados[0] + dados[3] + ' ' + dados[2] + ' ' + dados[1] + '.png';
        this.show(prognose, dados[0], dados[3] + ' ' + dados[2] + ' ' + dados[1] + '.png');
    }
    getArquivoGrafHIST(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
        const dados = this.getDiretorio(prognose, modelo, ajuste, modo);
        // return dados[0] + dados[3] + ' ' + dados[2] + ' ' + dados[1] + 'Histogram.png';
        this.show(prognose, dados[0], dados[3] + ' ' + dados[2] + ' '  + dados[1]  + 'Histogram.png');
    }
    getArquivoGrafDINAM(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
        const dados = this.getDiretorio(prognose, modelo, ajuste, modo);
        // return dados[0] + dados[3] + ' ' + dados[2] + ' ' + dados[1] + 'ObservadoXEstimado.html';
        this.show(prognose, dados[0], dados[3] + ' ' + dados[2] + ' '  + dados[1]  +  'ObservadoXEstimado.html');
    }
    getArquivoGrafBASE(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
        const dados = this.getDiretorio(prognose, modelo, ajuste, modo);
        // return dados[0] + dados[3] + ' ' + dados[2] + ' ' + dados[1] + 'ObservadoXEstimado.png';
        this.show(prognose, dados[0], dados[3] + ' ' + dados[2] + ' '  + dados[1]  + 'ObservadoXEstimado.png');
    }
    getArquivoGrafRES(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
        const dados = this.getDiretorio(prognose, modelo, ajuste, modo);
        // return dados[0] + dados[3] + ' ' + dados[2] + ' ' + dados[1] + 'ResiduoAbs.png';
        this.show(prognose, dados[0], dados[3] + ' ' + dados[2] + ' '  + dados[1]  + 'ResiduoAbs.png');
    }
    getArquivoGrafRESP(prognose: Prognose, modelo: ModeloExclusivo, ajuste: boolean, modo: number) {
        const dados = this.getDiretorio(prognose, modelo, ajuste, modo);
        // return dados[0] + dados[3] + ' ' + dados[2] + ' ' + dados[1] + 'ResiduoPerc.png';
        this.show(prognose, dados[0], dados[3] + ' ' + dados[2] + ' ' + dados[1]  + 'ResiduoPerc.png');
    }

    show(prognose, subdiretorio, file) {
        ////publicar arquivo
        // this.loading[file] = true;
        subdiretorio = '/resultados/' + subdiretorio + '/';
        const isText = this.homeService.isText(file);
        this.customizeService.getCustomize()
            .subscribe((custom: Customize) => {
                    if (custom.cenario) {
                        this.cenarioService.publicarArquivo(
                            custom.cenario,
                           'prognose' + prognose.id,
                            subdiretorio,
                            file,
                            !isText,  ///meta
                            isText,  ///content
                            isText, ////cript
                            this.homeService.getTipoPorArquivo(file) === 'figura'   ///imagem
                        )
                            .subscribe((nfile: any) => {
                                    if (isText) {
                                        this.cenarioService.publicarArquivo(
                                            custom.cenario,
                                            'prognose' + prognose.id,
                                            subdiretorio,
                                            file,
                                            true,  ///meta
                                            false,
                                            false,
                                            false
                                        )
                                            .subscribe((url: any) => {
                                                    this.homeService.abrirArquivo(
                                                        file,       ///arquivo
                                                        url,        ///meta
                                                        prognose.caminho,    ///caminho
                                                        nfile.file  ///previa
                                                    );
                                                },
                                                (error) => {
                                                    alert('152) houve um erro: ' + error.json());
                                                    this.pararLoading(file);
                                                });
                                    } else {
                                        this.homeService.abrirArquivo(
                                            file,       ///arquivo
                                            nfile,      ///meta
                                            prognose.caminho,    ///caminho
                                            null
                                        );
                                    }
                                    this.pararLoading(file);
                                },
                                (error) => {
                                    alert('169) houve um erro: ' + error);
                                    this.pararLoading(file);
                                }
                            );
                    } else {
                        alert('173) selecione um cenario!');
                    }
                },
                (error) => {
                    alert('177) houve um erro: ' + error.json());
                    this.pararLoading(file);
                }
            );

    }

    public pararLoading(file: string) {
        // this.loading[file] = false;
    }

}

