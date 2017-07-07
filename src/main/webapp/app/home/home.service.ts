import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';

import { EventManager } from 'ng-jhipster';

import {Customize, CustomizeService} from '../entities/customize/';
import {Card, CardService} from '../entities/card';
import {Cenario} from '../entities/cenario/cenario.model';
import {Terminal} from '../entities/terminal';


@Injectable()
export class HomeService {

    constructor(
        private eventManager: EventManager,
        private customizeService: CustomizeService,
        private cardService: CardService,
    ) { }


    public getCards(cenario: Cenario):Observable<Card[][]> {
        if(!cenario)
            return Observable.of([]);
        return this.cardService.getCardsByCenario(cenario)
            .map((cards: Card[]) => this.mapearCards(cards));
    }

    public mapearCards(cards: Card[]):Card[][] {

        let linhas: Card[][] = [];

        for(let i: number = 0; i < 100 ; i++){
            let linha: Card[] = cards.filter((card) => card.linha === i);
            if(linha.length > 0) {
                linhas.push(linha.sort((a, b) => a.coluna - b.coluna));
            }
        }

        return linhas;
    }

    public getAllCards(cards: Card[][]): Card[] {
        let array = [];

        cards.forEach((linha: Card[]) => {
            linha.forEach((card: Card) => {
                array.push(card);
            });
        });

        return array;
    }

    public abrirArquivo(arquivo: string, meta: any, caminho: string, previa: string) {
        const modo: string =  this.getTipoPorArquivo(arquivo);
        const largura: number = this.getTamanhoIdealDeColuna(modo);

        let decoded = 'formato imprevisivel';

        if (previa && previa.length > 0) {
            decoded = previa
                .split('.')
                .map((linha) => { return linha ? window.atob(linha) : ""; } )
                .join('\n');

            decoded = decoded.substring(0, Math.min(250, decoded.length));

            let tirar = 0;
            let prev = window.btoa(decoded);
            while(prev.length > 250 && tirar < 240) {
                prev = window.btoa(decoded.substring(0, decoded.length - tirar++));
            };
            decoded = prev;
        }

        this.customizeService.getCustomize().subscribe(
            (custom:Customize) => {
                if(custom && custom.cenario) {
                    this.getLinhaEColunaIdeal(largura, custom.cenario).subscribe(
                        (tamanho: number[]) => {
                            this.cardService.create(new Card(
                                undefined, //     id
                                arquivo, // nome
                                meta.file, // url
                                (modo === 'rbokeh'), // https
                                JSON.stringify(meta), // meta
                                decoded, // previa
                                '{\"x\":0,\"y\":0}', // disposicao
                                this.abreAberto(modo) , // tipo - como o card esta aberto: aberto fechado
                                tamanho[0],// linha
                                tamanho[1], // coluna
                                modo,  // modo = figuram, textom, grafco
                                caminho, // caminho
                                arquivo,  //arquivo
                                this.getExtensao(arquivo), //extensao
                                largura,  // largura
                                this.getClassePorTipo(modo), // classe
                                '', // codigo
                                custom.cenario // cenario
                            )).subscribe((card) => {
                                    console.log(card);
                                    this.notificar();
                                },
                                (error) => {
                                    alert('houve um erro ao abrir o card: ' + error);
                                });
                        }
                    );
                }else{
                    alert('selecione o cenario!');
                }
            }
        );
    }

    public getLinhaEColunaIdeal(tamanho: number, cenario: Cenario): Observable<number[]> {
        return  this.getCards(cenario).map(
            (cards: Card[][]) => {

                let alinha: number = 0;
                let acoluna: number = 0;
                let achou = false;

                cards.forEach((linha: Card[], index: number) => {

                    if (achou) {
                        return;
                    }

                    console.log(linha);

                    let largura: number = 0;
                    let col = 0;

                    linha.forEach((card: Card) => {
                        largura += card.largura;
                        col = Math.max(col, card.coluna);
                    });

                    alinha = index;
                    if ((largura + tamanho) <= 12) {
                        acoluna = ++col;
                        achou = true;
                    }

                });

                if (!achou) {
                    alinha++;
                }

                return [alinha, acoluna];
            }
        )
    }

    public getTamanhoIdealDeColuna(tipo: string):number {
        switch (tipo) {
            case 'figura':
            case 'planilha':
            case 'rdata':
                return 2;
            case 'texto':
            case 'codigo':
                return 4;
            case 'rbokeh':
            case 'terminal':
                return 6;
            default:
                return 2;
        }
    }

    public getTipoByNome(tipo: string): number{
        return ['figura', 'rbokeh', 'codigo', 'texto',  'planilha','rdata', "generic" ].indexOf(tipo);
    }

    public getNomeByTipo(tipo: number): string{
        const array = ['figura', 'rbokeh', 'codigo', 'texto',  'planilha','rdata', "generic" ];
        return array[tipo];
    }

    public getTipoPorArquivo(arquivo: string): string {
        switch (this.getExtensao(arquivo)) {
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'bmp':
            case 'tiff':
                return 'figura';
            case 'html':
                return 'rbokeh';
            case 'R':
                return  'codigo';
            case 'txt':
                return 'texto';
            case 'csv':
                return 'planilha';
            case 'RData':
                return 'rdata';
            default:
                return "generic";
        }
    }

    public getExtensao(arquivo: string):string {
        const ext =  (arquivo.indexOf('.') >= 0) ? arquivo.split('.')[1] : '';
        return ext;
    }

    public getClassePorTipo(tipo: string): string {
        let classe = "card jh-card";
        switch (tipo) {
            case 'figura':
                // classe += ' figura';
                break;
            case 'rbokeh':
                classe += ' meta';
                break;
            case 'texto':
                break;
            case 'codigo':
                break;
            case  'planilha':
                classe += ' meta';
                break;
            case 'rdata':
                classe += ' meta';
                break;
            case 'terminal':
                classe += ' terminal';
                break;
            default:
                classe += ' meta';
        }
        return classe;
    }

    public abreAberto(tipo: string): number {
        switch (tipo) {
            case 'figura':
            case 'rbokeh':
            case 'texto':
            case 'codigo':
            case 'terminal':
                return 2;
            case  'planilha':
            case 'rdata':
            default:
                return 1;
        }
    }

    public isText(file: string):boolean {
        return ['texto', 'codigo'].indexOf(this.getTipoPorArquivo(file)) >= 0;
    }

    public getNativeWnidow(){
        return window;
    }

    public reduzirCard(card: Card): Observable<Card> {
        card.tipo = 1;
        return this.cardService.update(card);
    }

    public ampliarCard(card: Card): Observable<Card>  {
        card.tipo = 2;
        return this.cardService.update(card);
    }

    public removeCard(id: number):Observable<boolean> {
        return this.cardService.delete(id)
            .map(() => {
                // this.notificar();
                return true;
            });
    }

    private notificar() {
        this.eventManager
            .broadcast({ name: 'cardListModification', content: 'OK'});
    }

    openTerminal(terminal: Terminal) {
        const modo = 'terminal';
        const largura: number = this.getTamanhoIdealDeColuna(modo);
        this.customizeService.getCustomize().subscribe(
            (custom:Customize) => {
                if(custom && custom.cenario) {
                    this.getLinhaEColunaIdeal(largura, custom.cenario)
                        .subscribe(
                            (tamanho: number[]) => {
                                this.cardService.create(new Card(
                                    undefined, //     id
                                    terminal.nome, // nome
                                    terminal.url, // url
                                    false, // https
                                    '{\"codigo\":\"' + terminal.url +
                                    '\",\"status\":' + terminal.status +
                                    ',\"terminal\":' + terminal.id +
                                    '}', // meta
                                    '', // previa
                                    '{\"x\":0,\"y\":0}', // disposicao
                                    this.abreAberto(modo), // tipo - como o card esta aberto: aberto fechado
                                    tamanho[0],// linha
                                    tamanho[1], // coluna
                                    modo,  // modo = figuram, textom, grafco
                                    custom.cenario.caminho + terminal.nome + '/', // caminho
                                    '',  //arquivo
                                    '', //extensao
                                    largura,  // largura
                                    this.getClassePorTipo(modo), // classe
                                    terminal.url, // codigo
                                    custom.cenario // cenario
                                )).subscribe((card) => {
                                        console.log(card);
                                        this.notificar();
                                    },
                                    (error) => {
                                        alert('houve um erro ao abrir o card: ' + error);
                                    });
                            }
                        );
                }else{
                    alert('selecione o cenario!');
                }
            }
        );
    }

    atualizar(card: Card) {
        this.cardService.update(card).subscribe(
            () => { console.log('card ' + card.id + ' atualizado! ') }
        );
    }

}
