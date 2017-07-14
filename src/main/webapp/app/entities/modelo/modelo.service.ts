import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, BaseRequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { Modelo } from './modelo.model';
import {User} from "../../shared/user/user.model";
@Injectable()
export class ModeloService {

    private resourceUrl = 'api/modelos';

    constructor(private http: Http) { }

    create(modelo: Modelo): Observable<Modelo> {
        const copy: Modelo = Object.assign({}, modelo);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            return res.json();
        });
    }

    update(modelo: Modelo): Observable<Modelo> {
        const copy: Modelo = Object.assign({}, modelo);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            return res.json();
        });
    }

    find(id: number): Observable<Modelo> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            return res.json();
        });
    }

    query(req?: any): Observable<Response> {
        const options = this.createRequestOption(req);
        return this.http.get(this.resourceUrl, options)
            ;
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }
    private createRequestOption(req?: any): BaseRequestOptions {
        const options: BaseRequestOptions = new BaseRequestOptions();
        if (req) {
            const params: URLSearchParams = new URLSearchParams();
            params.set('page', req.page);
            params.set('size', req.size);
            if (req.sort) {
                params.paramsMap.set('sort', req.sort);
            }
            params.set('query', req.query);

            options.search = params;
        }
        return options;
    }

    getAllModelos(): Observable<Modelo[]> {
        return this.query({
            page: 0,
            size: 100,
            sort: ['id']
        }).map(
            (res: Response) => {
                const modelos: Modelo[] = res.json();
                return modelos;
            });
    }

    addModelosDaLiteratura(user: User) {

        this.create(new Modelo(
            undefined, // id
            'pienaar e schiver', // nome
            'red', // cor
            'y2~y1*exp(-b0*(((I2)^b1)-((I1)^b1)))', // formula
            'nlsLM', // funcao
            'I1,I2', // variaveis
            'b0=1, b1=-0.05', // palpite
            '', // parametros
            'minpack.lm', // requires
            'criaModeloGenerico(nome ="pienaar e schiver", formula = "y2~y1*exp(-b0*(((I2)^b1)-((I1)^b1)))", funcaoRegre' +
            'ssao = "nlsLM", variaveis = c("I1", "I2"), palpite = "b0=1, b1=-0.05", requires = "minpack.lm")', // codigo
            user // user
        )).subscribe( (modelo) => { alert('Modelo ' + modelo.nome + ' adicionado com sucesso!' ); });
        this.create(new Modelo(
            undefined, // id
            'amaro et al', // nome
            'green', // cor
            'y2~y1+((b0/(1+exp(b1-b2*I2)))-(b0/(1+exp(b1-b2*I1))))', // formula
            'nlsLM', // funcao
            'I1,I2', // variaveis
            'b0=1, b1=1, b2=0.5', // palpite
            '', // parametros
            'minpack.lm', // requires
            'criaModeloGenerico(nome ="amaro et al", formula = "y2~y1+((b0/(1+exp(b1-b2*I2)))-(b0/(1+exp(b1-b2*I1))))", ' +
            'funcaoRegressao = "nlsLM", variaveis = c("I1", "I2"), palpite = "b0=1, b1=1, b2=0.5", requires = "minpack.lm")', // codigo
            user // user
        )).subscribe( (modelo) => { alert('Modelo ' + modelo.nome + ' adicionado com sucesso!' ); });
        this.create(new Modelo(
            undefined, // id
            'richards zeide', // nome
            'orange', // cor
            'y2~y1+((b0/(1+exp((b1-b2*I2)*1/b3)))-(b0/(1+exp((b1-b2*I1)*1/b3))))', // formula
            'nlsLM', // funcao
            'I1,I2', // variaveis
            'b0=1, b1=1, b2=1, b3=1', // palpite
            '', // parametros
            'minpack.lm', // requires
            'criaModeloGenerico(nome ="richards zeide", formula = "y2~y1+((b0/(1+exp((b1-b2*I2)*1/b3)))-(b0/(1+exp((b1-b2*I1)*1/b3))))", ' +
            'funcaoRegressao = "nlsLM", variaveis = c("I1", "I2"), palpite = "b0=1, b1=1, b2=1, b3=1", requires = "minpack.lm")', // codigo
            user // user
        )).subscribe( (modelo) => { alert('Modelo ' + modelo.nome + ' adicionado com sucesso!' ); });
        this.create(new Modelo(
            undefined, // id
            'schumacher tome', // nome
            'blue', // cor
            'y2~y1+exp(b0-(b1*I2))-exp(b0-(b1*I1))', // formula
            'nlsLM', // funcao
            'I1,I2', // variaveis
            'b0=1, b1=-0.05', // palpite
            '', // parametros
            'minpack.lm', // requires
            'criaModeloGenerico(nome ="schumacher tome", formula = "y2~y1+exp(b0-(b1*I2))-exp(b0-(b1*I1))",' +
            ' funcaoRegressao = "nlsLM", variaveis = c("I1", "I2"), palpite = "b0=1, b1=-0.05", requires = "minpack.lm")', // codigo
            user // user
        )).subscribe( (modelo) => { alert('Modelo ' + modelo.nome + ' adicionado com sucesso!' ); });
        this.create(new Modelo(
            undefined, // id
            'adaptado bella e campos e leite', // nome
            'brown', // cor
            'y2~y1+(b0+b1*((1/I2)-(1/I1))+b2*BAI+b3*S)', // formula
            'nlsLM', // funcao
            'I1,I2,BAI,S', // variaveis
            'b0=-1, b1=-1, b2 = -1, b3 = 0.05', // palpite
            '', // parametros
            'minpack.lm', // requires
            'criaModeloGenerico(nome ="adaptado bella e campos e leite", formula = "y2~y1+(b0+b1*((1/I2)-(1/I1))+b2*BAI+b3*S)", ' +
            'funcaoRegressao = "nlsLM", variaveis = c("I1", "I2", "BAI", "S"), palpite = "b0=-1, b1=-1, b2 = -1, b3 = 0.05", requires = "minpack.lm")', // codigo
            user // user
        )).subscribe( (modelo) => { alert('Modelo ' + modelo.nome + ' adicionado com sucesso!' ); });

    }

}
