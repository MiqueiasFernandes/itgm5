import { Component, OnInit } from '@angular/core';

import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Response} from '@angular/http';
import {AlertService} from 'ng-jhipster';
import {Customize, CustomizeService } from '../../customize/';
import { HomeService } from '../../../home/home.service';
import {Terminal, TerminalService} from '../';

@Component({
  selector: 'jhi-fab-add-terminal',
  templateUrl: './fab-add-terminal.component.html',
  styles: []
})
export class FabAddTerminalComponent implements OnInit {

    terminal: Terminal;
    onLoad = false;

    constructor(
        public activeModal: NgbActiveModal,
        private customizeService: CustomizeService,
        private alertService: AlertService,
        private terminalService: TerminalService,
        private homeService: HomeService,
    ) {
        this.terminal = new Terminal;
    }

    ngOnInit() {
    }

    adicionarTerminal() {
        this.onLoad = true;
        this.customizeService.getCustomize()
            .subscribe((customize: Customize) => {
                if (customize && customize.cenario) {
                    this.terminal.cenario = customize.cenario;
                    this.terminalService.create(this.terminal)
                        .subscribe(
                            (res: Terminal) =>
                                this.onSaveSuccess(res),
                            (res: Response) => this.onError(res.json()));
                }
            });
    }

    onSaveSuccess(terminal: Terminal) {
        if (terminal.status > 1) {
            // alert( 'terminal ' + terminal.nome + ' criado em ' + terminal.url);
            this.homeService.openTerminal(terminal);
            this.close();
        } else {
            this.onError({message: 'Houve um erro, tente novamente'});
            this.onLoad = false;
        }
    }

    private onError(error) {
        this.alertService.error(error.message);
    }

    private close() {
        this.activeModal.dismiss('closed');
    }


}
