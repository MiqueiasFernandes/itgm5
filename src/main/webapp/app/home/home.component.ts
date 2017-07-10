import {Component, ElementRef, OnInit, AfterViewInit} from '@angular/core';

import { EventManager, JhiLanguageService } from 'ng-jhipster';
// import {DomSanitizer} from '@angular/platform-browser';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
/// https://www.npmjs.com/package/angular2-highlight-js
// import { HighlightJsModule, HighlightJsService } from 'angular2-highlight-js';

import { Account, LoginModalService, Principal } from '../shared';

import {HomeService} from './home.service';

import {
    trigger,
    state,
    style,
    animate,
    transition,
    keyframes,
    group
} from '@angular/animations';
import {CustomizeService} from "../entities/customize/customize.service";
import {Customize} from "../entities/customize/customize.model";
import {Card} from "../entities/card/card.model";
import {AccountService} from "../shared/auth/account.service";
import {Terminal} from "../entities/terminal/terminal.model";
import {Observable} from "rxjs/Observable";
import {TerminalService} from "../entities/terminal/terminal.service";
import {Prognose} from "../entities/prognose/prognose.model";
import {PrognoseService} from "../entities/prognose/prognose.service";
import {ModeloService} from "../entities/modelo/modelo.service";
import {Modelo} from "../entities/modelo/modelo.model";
import {FabAddPrognoseComponent} from "../entities/prognose/fab-add-prognose/fab-add-prognose.component";

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: [
        'home.scss'
    ],
    animations: [
        trigger('flyInOut', [
            state('in', style({transform: 'translateX(0)'})),
            state('out', style({opacity: 0, transform: 'translateX(0)',  offset: 1.0})),
            transition('void => *', [
                animate(300, keyframes([
                    style({opacity: 0, transform: 'translateX(-100%)', offset: 0}),
                    style({opacity: 1, transform: 'translateX(15px)',  offset: 0.3}),
                    style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
                ]))
            ]),
            transition('in => *', [
                animate(300, keyframes([
                    style({opacity: 1, transform: 'translateX(0)',     offset: 0}),
                    style({opacity: 1, transform: 'translateX(-15px)', offset: 0.7}),
                    style({opacity: 0, transform: 'translateX(100%)',  offset: 1.0})
                ]))
            ])
        ])
    ]

})
export class HomeComponent implements OnInit {
    account: Account;
    modalRef: NgbModalRef;
    cards: Card[][] = [];
    dropdows = [];
    windowRef: any;
    transitions = [];
    terminais: Terminal[] = [];
    prognoses: Prognose[] = [];
    prognoses2: Prognose[] = [];
    modelos: Modelo[] = [];

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private principal: Principal,
        private loginModalService: LoginModalService,
        private eventManager: EventManager,
        private homeService: HomeService,
        private customizeService: CustomizeService,
        private prognoseService: PrognoseService,
        private terminalService: TerminalService,
        private modalService: NgbModal,
    ) {
        this.jhiLanguageService.setLocations(['home']);
        this.windowRef = homeService.getNativeWnidow();
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.registers();
        this.loop();
    }

    loop() {
        this.prognoses.forEach((p, i) => {
            if (p.status < 4) { ///se rodando verificar se terminou
                console.log('requisitar prognose...')
                this.prognoseService.find(p.id).subscribe( (prognose) => {
                    try {
                        if (prognose.status === 4) {   ///terminou!
                            p.resultado.split(',').forEach( (id) => { this.prognoses2[id] = prognose; } );
                            this.prognoses.splice(i, 1);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }
        });
        setTimeout( () => { this.loop(); }, 10000);
    }
    getResultados(card, val: boolean) {
        let obj: any;
        try {
            obj = JSON.parse(
                this.prognoses2[card.id].relatorio)
                .resultados[this.modelos[this.getMeta(card).modelo].nome];
        } catch (e) {
            console.log(e);
            return {};
        }
        return val ? (obj.ajuste ? obj.ajuste : {}) : (obj.validacao ? obj.validacao : {});
    }
    getGrafico(card, ajuste) {
        const res = this.getResultados(card, ajuste);
        if (res.grafico) {
            return res.grafico;
        }
        return 'grafico.png';
    }
    getEstatisticas(card, ajuste) {
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
            obj = Object.assign(obj, this.getResultados(card, ajuste).estatisticas);
        } catch (e) {
            console.log(e);
        }
       return obj;
    }
    getWarning(card) {
        try {
            return JSON.parse(this.prognoses2[card.id].relatorio).relatorio.warning;
        } catch (e) {
            console.log(e);
            return '';
        }
    }
    getError(card) {
        try {
            const obj = JSON.parse(this.prognoses2[card.id].relatorio);
            // console.log(obj);
            const error =  obj.resultados[
                this.modelos[this.getMeta(card).modelo].nome
                ].error;
            return (obj.relatorio.error ? obj.relatorio.error  + '; ' : '') +
                (error ? error : '') + (obj.error ? ('; ' + obj.error) : '');
        } catch (e) {
            console.log(e);
            return '';
        }
    }

    registers() {
        this.eventManager.subscribe('authenticationSuccess', (message) => {
            this.principal.identity().then((account) => {
                this.account = account;
                this.updateCards();
            });
        });

        this.eventManager.subscribe('logout', () => {
            this.cards = [];
            this.terminais = [];
        });

        this.eventManager.subscribe('customizeListModification', () => {
            this.updateCards();
        });

        this.eventManager.subscribe('cardListModification', () => {
            this.updateCards();
        });

        this.updateCards();
    }

    updateCards() {
        const atualizar: Card[] = [];
        this.customizeService.getCustomize().subscribe(
            (custom: Customize) => {
                if (custom && custom.cenario) {
                    this.homeService.getCards(custom.cenario).subscribe(
                        (cards: Card[][]) => {
                            cards.forEach((cars: Card[], linha: number) => {
                                cars.forEach((card: Card, coluna: number) => {
                                    this.transitions[card.id] = 'in';
                                    let meta: any = this.getMeta(card);
                                    meta = Object.assign(meta,
                                        {endereco: 'http://itgm.mikeias.net:8098/temp/',
                                            enderecoseguro: 'https://itgm.mikeias.net:8099/temp/',
                                            enderecows: 'ws://itgm.mikeias.net:8080/ITGMRest2/jriaccesslive/'
                                        });
                                    card.meta = JSON.stringify(meta);
                                    if (!this.cards[linha] ||
                                        !this.cards[linha][coluna] ||
                                        (JSON.stringify(this.cards[linha][coluna]) !=
                                        JSON.stringify(card))) {
                                        if (!this.cards[linha]) {
                                            this.cards[linha] = [];
                                        }
                                        if (card.linha !== linha || card.coluna !== coluna) {
                                            card.linha = linha;
                                            card.coluna = coluna;
                                            atualizar.push(card);
                                        }
                                        this.cards[linha][coluna] = card;
                                        if (card.modo === 'terminal') {
                                            this
                                                .getTerminal(this.getMeta(card).terminal)
                                                .subscribe((terminal: Terminal) => {
                                                    this.terminais[card.id] = terminal =
                                                        Object.assign(new Terminal(), terminal);
                                                    if (terminal.status === 2) {
                                                        terminal.conectar(JSON.parse(card.meta).enderecows);
                                                    }
                                                });
                                        }

                                        if (card.modo === 'prognose') {
                                            const meta2 = this.getMeta(card);
                                            if (meta2 && meta2.prognose) {
                                                const index = this.prognoses
                                                    .findIndex((p) => p.id === meta2.prognose);
                                                if (index >= 0) {
                                                    this.prognoses[index].resultado += (',' + card.id);
                                                } else {
                                                    this.prognoseService.find(meta2.prognose).
                                                    subscribe((prognose) => {
                                                        prognose.modeloExclusivos.forEach( (me) => {
                                                            this.modelos[me.id] = me.modelo;
                                                        });
                                                        if (prognose.status < 4) {
                                                            prognose.resultado = (card.id + '');
                                                            this.prognoses.push(prognose);
                                                        } else {
                                                            this.prognoses2[card.id] = prognose;
                                                        }
                                                    });
                                                }

                                            } else {
                                                console.log('error card ' + card.id + ' nao possui meta valida');
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    );
                } else {
                    this.cards = [];
                    this.transitions = [];
                    this.dropdows = [];
                    this.terminais = [];
                }
            }
        );

        atualizar.forEach( (card) => this.homeService.atualizar(card));

    }


    getTerminal(id: number): Observable<Terminal> {
        return this.terminalService.find(id);
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    getMeta(card: Card): any {
        if (card && card.meta && card.meta.length > 2) {
            try {
                return JSON.parse(card.meta);
            } catch (e) {
                console.log('impossivel obter meta de ' + card.meta + ' error ' + e);
            }
        }
        return {};
    }

    getSize(card: Card): string {
        const meta = this.getMeta(card);
        let tam = -1;
        if (meta) {
            tam = parseInt(meta.size);
            if (tam > (1024 * 1024)) {
                return Math.ceil(tam / (1024 * 1024)) + ' Mb';
            } else if (tam > 1024) {
                return Math.ceil(tam / 1024) + ' Kb';
            }
            return tam + ' bytes';
        }
    }

    toogleDropDown(card: Card) {
        this.closeDropDown();
        this.dropdows[card.id] = this.dropdows[card.id] ? false : true;
    }

    closeDropDown() {
        this.dropdows = [];
    }

    getURL(card: Card): string {
        const meta = this.getMeta(card);
        if (meta) {
            return (card.https ?  meta.enderecoseguro : meta.endereco)  + card.url;
        }
    }

    isResize(card: Card): boolean {
        return ['figura', 'rbokeh', 'texto', 'codigo'].indexOf(card.modo) >= 0;
    }

    getPrevia(text: string): string {
        return '<code>' +
            this.homeService
                .getNativeWnidow()
                .atob(text).split('\n')
                .join('</code><br><code>') + '</code>';
    }

    isArquivo(card: Card): boolean {
        return [ 'figura', 'rbokeh', 'texto', 'codigo', 'planilha', 'rdata' ].indexOf(card.modo) >= 0;
    }
    duplicar(card: Card) {
        const ref = this.modalService.open(FabAddPrognoseComponent, {size: 'lg'});
        ref.componentInstance.setPrognose(this.prognoses2[card.id]);
        this.closeDropDown();
    }

///////////////////////////////////////////////////////////////////////////////

    isDestacavel(card: Card): boolean {
        return ['figura', 'rbokeh', 'planilha', 'texto', 'codigo'].indexOf(card.modo) >= 0;
    }

    destacar(card: Card, carde: any) {
        const meta = this.getMeta(card);
        const rect = carde.getBoundingClientRect();
        const url = this.getURL(card);
        const myWindow = window.open(url,
            '_blank',
            'fullscreen=no,' +
            'menubar=no,' +
            'toolbar=no,' +
            'location=yes,' +
            'resizable=yes,' +
            'top=' + (rect.top + 100) + ',' +
            'left=' + rect.left + ',' +
            'height=' + (card.modo === 'figura' && meta !== null ? meta.height : '500') + ',' +
            'width=' + (card.modo === 'figura' && meta !== null ? meta.width : '500')  + ',' +
            'scrollbars=yes,' +
            'status=yes');
        switch (card.modo){
            case 'figura':
                const prefix = '<body style="background-image: url(\'';
                const sufix = '\'); background-repeat: no-repeat; background-size: cover;"></body>';
                myWindow.document.write(prefix + url + sufix);
                break;
            case 'rbokeh':
                break;
            case  'planilha':
                const html = `<!DOCTYPE html>
                        <html lang=en>
                        <head>
                        <meta charset=utf-8 />
                        <title>jQuery CSVToTable</title>
                        <style>TABLE.CSVTable{font:.8em Verdana,Arial,Geneva,Helvetica,sans-serif;border-collapse:collapse;width:450px}TABLE.CSVTable THEAD TR{background:#e8edff}TABLE.CSVTable TH{font-family:"Lucida Sans Unicode","Lucida Grande",Sans-Serif;font-size:1.2em}TABLE.CSVTable TD,TABLE.CSVTable TH{padding:8px;text-align:left;border-bottom:1px solid #fff;border-top:1px solid transparent}TABLE.CSVTable TR{background:#f0f0f0}TABLE.CSVTable TR.odd{background:#f9f9f9}TABLE.CSVTable TR:hover{background:#e8edff}.source{background-color:#fafafa;border:1px solid #999}</style>
                        <script src=https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js></script>
                        <script>(function(a){String.prototype.splitCSV=function(e){for(var d=this.split(e=e||","),b=d.length-1,c;b>=0;b--){if(d[b].replace(/"\s+$/,'"').charAt(d[b].length-1)=='"'){if((c=d[b].replace(/^\s+"/,'"')).length>1&&c.charAt(0)=='"'){d[b]=d[b].replace(/^\s*"|"\s*$/g,"").replace(/""/g,'"')}else{if(b){d.splice(b-1,2,[d[b-1],d[b]].join(e))}else{d=d.shift().split(e).concat(d)}}}else{d[b].replace(/""/g,'"')}}return d};a.fn.CSVToTable=function(c,b){var d={tableClass:"CSVTable",theadClass:"",thClass:"",tbodyClass:"",trClass:"",tdClass:"",loadingImage:"",loadingText:"Loading CSV data...",separator:",",startLine:0};var b=a.extend(d,b);return this.each(function(){var f=a(this);var e="";(b.loadingImage)?loading='<div style="text-align: center"><img alt="'+b.loadingText+'" src="'+b.loadingImage+'" /><br>'+b.loadingText+"</div>":loading=b.loadingText;f.html(loading);a.get(c,function(k){var g='<table class="'+b.tableClass+'">';var i=k.replace("\\r","").split("\\n");if(k.split(";").length>k.split(b.separator).length){b.separator=";"};if(k.split("\\t").length>k.split(b.separator).length){b.separator="\\t"}var h=0;var j=0;var l=new Array();a.each(i,function(n,m){if((n==0)&&(typeof(b.headers)!="undefined")){l=b.headers;j=l.length;g+='<thead class="'+b.theadClass+'"><tr class="'+b.trClass+'">';a.each(l,function(p,q){g+='<th class="'+b.thClass+'">'+q+"</th>"});g+='</tr></thead><tbody class="'+b.tbodyClass+'">'}if((n==b.startLine)&&(typeof(b.headers)=="undefined")){l=m.splitCSV(b.separator);j=l.length;g+='<thead class="'+b.theadClass+'"><tr class="'+b.trClass+'">';a.each(l,function(p,q){g+='<th class="'+b.thClass+'">'+q+"</th>"});g+='</tr></thead><tbody class="'+b.tbodyClass+'">'}else{if(n>=b.startLine){var o=m.splitCSV(b.separator);if(o.length>1){h++;if(o.length!=j){e+="error on line "+n+": Item count ("+o.length+") does not match header count ("+j+") \\n"}(h%2)?oddOrEven="odd":oddOrEven="even";g+='<tr class="'+b.trClass+" "+oddOrEven+'">';a.each(o,function(q,p){g+='<td class="'+b.tdClass+'">'+p+"</td>"});g+="</tr>"}}}});g+="</tbody></table>";if(e){f.html(e)}else{f.fadeOut(500,function(){f.html(g)}).fadeIn(function(){setTimeout(function(){f.trigger("loadComplete")},0)})}})})}})(jQuery);</script>
                        </head>
                        <body>
                        <div id=CSVTable>
                        </div>
                        </body>
                        <script>$("#CSVTable").CSVToTable("url",{loadingImage:"imagemgif",startLine:0});</script>
                        </html>`;

                // não se esqueça de atribuir:
                // <Directory "/var/www/html/temp">
                // Header set Access-Control-Allow-Origin "*"
                // </Directory>
                myWindow.document.write(html.replace('url', url).replace('imagemgif', this.getMeta(card).endereco + 'loading.gif'));
                break;
            case 'rdata':
            case 'texto':
            case 'codigo':
                //  myWindow.document.write(card.codigo); ///substituir pela url
                break;
            default:
                break;
        }
        this.closeDropDown();
    }

    baixar(card: Card) {
        this.closeDropDown();
    }

    reduzir(card: Card) {
        this.homeService.reduzirCard(card).subscribe( (card2: Card) =>{
            this.cards[card2.linha][card2.coluna] = card2;
        });
        this.closeDropDown();
    }

    ampliar(card: Card) {
        this.homeService.ampliarCard(card).subscribe( (card2: Card) =>{
            this.cards[card2.linha][card2.coluna] = card2;
        });
        this.closeDropDown();
    }

    fechar(card: Card) {
        if (card) {
            this.transitions[card.id] = 'out';
            card.tipo = 0;
        }
        this.closeDropDown();
    }

///////////////////////////////////////////////////////////////////////////////

    animationDone($event: any, card: Card) {
        if ($event.fromState === 'in' && $event.toState === 'out' && card && card.tipo === 0){
            const  id = card.id;
            this.homeService.removeCard(id).subscribe(
                () => {
                    this.closeDropDown();
                    // this.transitions[id] = null;
                }
            );
        }
    }
}
