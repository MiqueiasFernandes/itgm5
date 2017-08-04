import { Cenario } from '../cenario';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Observer} from 'rxjs/Observer';

export class Terminal {

    input = '';
    linhas: string[] = [];
    classes: string[] = [];
    prompt = '';
    cursor = 'default';
    recursos: any = {};
    linhaTemp = '';
    sessoes:string[] = ['CONSOLE', 'BUSY', 'ECHO', 'FLUSH', 'MESSAGE', 'ERROR', 'STATUS', 'PROMPT'];
    private sockets: Subject<any>[] = [];


    constructor(
        public id?: number,
        public nome?: string,
        public url?: string,
        public status?: number,
        public cenario?: Cenario,
    ) {
    }


    public conectar(endereco: string) {
        if (this.status === 2) {

            this.sessoes.forEach((sessao: string, index: number) => {
                // alert('conectar! ' + endereco + this.url + '/' + sessao);
                this.sockets[index] = this.create(endereco + this.url + '/' + sessao);
            });

            this.status = 3;

            this.sockets.forEach((socket, i) => {
                socket
                    .subscribe((msg: MessageEvent) => {
                        const message = msg.data;
                        // console.log('message ' + this.sessoes[i] + ' : ' + message);
                        switch (i) {
                            case 0: ////'CONSOLE'
                                const tipo = message.substring(1, message.indexOf(']'));
                                const msg = message.substring(2 + tipo.length);
                                this.linhaTemp += msg;
                                if (message.indexOf('\n') >= 0) {
                                    this.pushLinha(this.linhaTemp, (tipo === '0' ? 'linha' : 'linha-error'));
                                    this.linhaTemp = '';
                                    if (this.linhas.length > 10) {
                                        this.linhas[0] = null;
                                        this.classes[0] = null;
                                    }
                                }
                                break;
                            case 1: ////'BUSY'
                                this.cursor = message;
                                break;
                            case 2: ////'ECHO'
                                this.pushLinha(message, 'linha-input');
                                this.input = '';
                                break;
                            case 3: ////'FLUSH'
                                this.linhaTemp = '';
                                // this.linhas = [];
                                // this.classes = [];
                                break;
                            case 4: ////'MESSAGE'
                                alert(message);
                                break;
                            case 5: ////'ERROR'
                                this.pushLinha(message, 'linha-error');
                                break;
                            case 6: ////'STATUS'
                                this.status = JSON.parse(message);
                                break;
                            case 7: ////'PROMPT'
                                this.prompt = message;
                                break;
                        }
                    });
            });

        }else{
            alert('error status ' + this.status);
        }

    }

    sendLinha() {
        console.log('enviar: ' + this.input);
        this.sockets[0].next(this.input);
    }

    pushLinha(message, classe) {
        this.linhas.push(message);
        this.classes.push(classe);
    }

    public desconectar() {
        if (this.status > 2) {
            alert('desconectar!');
        }
    }


    private create(url): Subject<any> {
        const ws = new WebSocket(url);

        const observable = Observable.create(
            (obs: Observer<MessageEvent>) => {
                ws.onmessage = obs.next.bind(obs);
                ws.onerror = obs.error.bind(obs);
                ws.onclose = obs.complete.bind(obs);

                return ws.close.bind(ws);
            }
        );

        const observer = {
            next: (data: any) => {
                if (ws.readyState === WebSocket.OPEN) {
                    console.log('enviando: ' + data);
                    ws.send(data);
                }
            },
        };

        return Subject.create(observer, observable);
    }


}
