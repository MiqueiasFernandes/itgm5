import { User } from '../../shared';
export class Modelo {
    constructor(
        public id?: number,
        public nome?: string,
        public cor?: string,
        public formula?: string,
        public funcao?: string,
        public variaveis?: string,
        public palpite?: string,
        public parametros?: string,
        public requires?: string,
        public codigo?: string,
        public user?: User,
    ) {
    }

    buildCodigo() {
        return this.codigo =
            'criaModeloGenerico(' +
            'nome ="' + this.nome + '", ' +
            'formula = "' + this.formula + '", ' +
            'funcaoRegressao = "' + this.funcao + '", ' +
            'variaveis = c("' + this.variaveis.split(',').join('", "') + '"), ' +
            'palpite = "' + this.palpite + '"' +
            (this.requires ?  ',requires = "' + this.requires + '",' : '') +
            (this.parametros ? ',maisParametros="' + this.parametros + '"'  : '') +
            '")';
    }

    public buildCodigoForModelo(modelo: Modelo) {
        return modelo.codigo =
            'criaModeloGenerico(' +
            'nome ="' + modelo.nome + '", ' +
            'formula = "' + modelo.formula + '", ' +
            'funcaoRegressao = "' + modelo.funcao + '", ' +
            'variaveis = c("' + modelo.variaveis.split(',').join('", "') + '"), ' +
            'palpite = "' + modelo.palpite + '"' +
            ((modelo.requires && modelo.requires.length > 2) ?  ',requires = "' + modelo.requires + '"' : '') +
            ((modelo.parametros && modelo.parametros.length > 2) ? ',maisParametros="' + modelo.parametros + '"'  : '') +
            ')';
    }
}
