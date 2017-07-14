import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'jhi-show-image',
    templateUrl: './show-image.component.html',
    styles: [
        '#backg{ width: 100%; }'
    ]
})
export class ShowImageComponent implements OnInit {

    src = 'http://itgm.miekias.net:8098/temp/error.png';
    codigo = '';
    image = true;

    constructor() { }

    ngOnInit() {
    }

    setImageSRC(src: string) {
        this.src = src;
    }

    setCodigo(codigo: string) {
        this.image = false;
        this.codigo = codigo;
    }

}
