const { tipoToken } = require('./analisadorLexico')

const codErros = [
    "0 - Programa principal não encontrado",
    "1 - Identificador inválido",
    "2 - Palavra reservada 'begin' não encontrada",
    "3 - Esperava declaração de tipo - 'int ou boolean'",
    "4 - Esperava ';'",
    "5 - Comando mal formatado",
    "6 - Esperava ')'",
    "7 - Expressão ou fator mal formatado",
    "8 - Esperava finalização do programa '.'",
    "9 - Esperava ':'"
]


let i_token = 1 //Incrementar para pegar prox. token


function programa(tokens, logs) {
    console.log("--> Programa. Lexema: " + tokens[i_token].lexema)
    if (tokens[i_token].token == tipoToken.IDENTIFICADOR && tokens[i_token + 1].lexema == ';') {
        i_token = i_token + 2
        bloco(tokens, logs)
        if (tokens[i_token].lexema == '.') {
            console.log("Analise Sintática finalizada sem erros.")
            logs.push({
                tokens: tokens[i_token],
                err: null
            })
        }
        else erro(tokens[i_token], logs, codErros[8])
    } else {
        console.log("Um programa precisa iniciar com a palavra program seguido de um identificardor e depois ;\n" + tokens[i_token].lexema, i_token)
        erro(tokens[i_token], logs, codErros[1])
        return
    }
}

function bloco(tokens, logs) {
    console.log("--> Bloco. Lexema: " + tokens[i_token].lexema)
    if (tokens[i_token].lexema == 'int' || tokens[i_token].lexema == 'real' || tokens[i_token].lexema == 'boolean') parteDeclarVar(tokens, logs)
    while (tokens[i_token].lexema == 'procedure') parteDeclarSubRot(tokens, logs)
    if (tokens[i_token].lexema == 'begin') comandoComposto(tokens, logs)
    else {
        console.error("ERRO: Erro na sintaxe do bloco: " + tokens[i_token].lexema)
        erro(tokens[i_token], logs, codErros[3])
    }
}

function parteDeclarVar(tokens, logs) {
    console.log("--> Parte declaração de variáveis. Lexema: " + tokens[i_token].lexema)
    if (tokens[i_token].lexema == 'int' || tokens[i_token].lexema == 'real' || tokens[i_token].lexema == 'boolean') {

        while (tokens[i_token].lexema == 'int' || tokens[i_token].lexema == 'real' || tokens[i_token].lexema == 'boolean') {
            i_token++
            if (tokens[i_token].token == tipoToken.IDENTIFICADOR) {
                while (tokens[i_token].token == tipoToken.IDENTIFICADOR) {
                    i_token++
                    if (tokens[i_token].lexema != ',') break
                    else i_token++
                }
                if (tokens[i_token].lexema == ';') {
                    i_token++
                } else {
                    console.error("ERRO: Esperava um ;")
                    erro(tokens[i_token], logs, codErros[5])
                    return
                }
            } else {
                console.error("ERRO: Esperava um identificador: " + tokens[i_token].lexema)
                erro(tokens[i_token], logs, codErros[1])
                i_token++
            }
        }
    } else {
        console.error("ERRO: Esperava uma declaração de tipo")
        erro(tokens[i_token], logs, codErros[4])
        return
    }

}


function parteDeclarSubRot(tokens, logs) {
    console.log("--> Parte declaração de sub-rotinas. Lexema: " + tokens[i_token].lexema)
        //console.log("Palavra reservada procedure encontrada")
    i_token++
    if (tokens[i_token].token == tipoToken.IDENTIFICADOR) {
        i_token++
        if (tokens[i_token].lexema == '(') {
            i_token++
            while (1) {
                if (tokens[i_token].lexema == 'var') {
                    i_token++
                }
                if (tokens[i_token].token == tipoToken.IDENTIFICADOR) {
                    while (tokens[i_token].token == tipoToken.IDENTIFICADOR) {
                        i_token++
                        if (tokens[i_token].lexema != ',') break
                        else i_token++
                    }
                    if (tokens[i_token].lexema == ':') {
                        i_token++
                        if (tokens[i_token].lexema == 'int' || tokens[i_token].lexema == 'real' || tokens[i_token].lexema == 'boolean') {
                            i_token++
                            if (tokens[i_token].lexema == ')') {
                                i_token++
                                break
                            } else if (tokens[i_token].lexema == ';') i_token++
                        } else {
                            console.error("ERRO: Esperava uma definição de tipo")
                            erro(tokens[i_token], logs, codErros[4])
                            return
                        }
                    } else {
                        console.error("ERRO: Esperava um :")
                        erro(tokens[i_token], logs, codErros[9])
                        return
                    }
                } else {
                    console.error("ERRO: Esperava um identificador")
                    erro(tokens[i_token], logs, codErros[1])
                    return
                }
            }
        }
        if (tokens[i_token].lexema == ';') {
            i_token++
            bloco(tokens, logs)
            if (tokens[i_token].lexema == ';') i_token++
                else {
                    erro(tokens[i_token], logs, codErros[5])
                    return
                }
        } else {
            erro(tokens[i_token], logs, codErros[5])
            return
        }
    } else {
        console.error("ERRO: Esperava um identificador pro procedimento")
        erro(tokens[i_token], logs, codErros[1])
        return
    }
}

function comandoComposto(tokens, logs) {
    console.log("--> Comando composto. Lexema: " + tokens[i_token].lexema)
        //console.log("Palavra reservada begin, if, while ou identificador encontrado")
    i_token++
    comando(tokens, logs)
    while (tokens[i_token].token == tipoToken.PT_VIRG) {
        i_token++
        comando(tokens, logs)
    }
    if (tokens[i_token].lexema == 'end') {
        console.log("Encontrado: " + tokens[i_token].lexema)
        i_token++
    } else {
        console.error("ERRO: Esperava palavra reservada end ou ;")
        erro(tokens[i_token], logs, codErros[6])
    }
}

function comando(tokens, logs) {
    console.log("--> Comando. Lexema: " + tokens[i_token].lexema)
    if (tokens[i_token].lexema == 'begin') comandoComposto(tokens, logs)
    else if (tokens[i_token].token == tipoToken.IDENTIFICADOR || tokens[i_token].lexema == 'write' || tokens[i_token].lexema == 'read') {
        i_token++
        if (tokens[i_token].token == tipoToken.ATRIBUICAO) {
            i_token++
            //console.log(tokens[i_token].lexema)
            expressao(tokens, logs)
        } else if (tokens[i_token].token == tipoToken.ABRE_PAR) {
            i_token++
            expressao(tokens, logs)
            while (tokens[i_token].token == tipoToken.VIRGULA) {
                expressao(tokens, logs)
            }
            if (tokens[i_token].token == tipoToken.FECHA_PAR) i_token++
                else {
                    console.log("ERRO: Faltou )")
                    erro(tokens[i_token], logs, codErros[6])
                    return
                }
        } else {
            console.error("ERRO: Comando mal formatado")
            erro(tokens[i_token], logs, codErros[5])
            return
        }
        // if (tokens[i_token].token == tipoToken.PT_VIRG) comandoComposto(tokens, logs)
        // else if (tokens[i_token].lexema == 'end') i_token++

    } else if (tokens[i_token].lexema == 'if' || tokens[i_token].lexema == 'while') {
        i_token++
        expressao(tokens, logs)
        comando(tokens, logs)
    } else {
        console.error("ERRO: Comando mal formatado." + tokens[i_token].lexema)
        erro(tokens[i_token], logs, codErros[5])
        return
    }
}

function expressao(tokens, logs) {
    console.log("--> Expressão. Lexema: " + tokens[i_token].lexema)
        //console.log("Aqui tem uma expressão")
    expSimples(tokens, logs)
    if (tokens[i_token].token == tipoToken.DIFERENTE || tokens[i_token].token == tipoToken.MENOR_IGUAL || tokens[i_token].token == tipoToken.MENOR_QUE || tokens[i_token].token == tipoToken.MAIOR_QUE || tokens[i_token].token == tipoToken.MAIOR_IGUAL || tokens[i_token].token == tipoToken.IGUAL) {
        i_token++
        expSimples(tokens, logs)
    }

}

function expSimples(tokens, logs) {
    console.log("--> Expressão simples. Lexema: " + tokens[i_token].lexema)
    if (tokens[i_token].token == tipoToken.OP_SOMA || tokens[i_token.token] == tipoToken.OP_SUB) {
        i_token++
    }
    termo(tokens, logs)
    while (tokens[i_token].token == tipoToken.OP_SOMA || tokens[i_token].token == tipoToken.OP_SUB || tokens[i_token].lexema == 'or') {
        i_token++
        termo(tokens, logs)
    }
}

function termo(tokens, logs) {
    console.log("--> Termo. Lexema: " + tokens[i_token].lexema)
    fator(tokens, logs)
    while (tokens[i_token].token == tipoToken.OP_MULT || tokens[i_token].token == tipoToken.OP_DIV || tokens[i_token].lexema == 'and' || tokens[i_token].lexema == 'div') {
        i_token++
        fator(tokens, logs)
    }
}

function fator(tokens, logs) {
    console.log("--> Fator. Lexema: " + tokens[i_token].lexema)
    if (tokens[i_token].token == tipoToken.IDENTIFICADOR) {
        i_token++
    } else if (tokens[i_token].token == tipoToken.NUM_INT || tokens[i_token].token == tipoToken.NUM_REAL || tokens[i_token].lexema == 'true' || tokens[i_token].lexema == 'false') {
        i_token++
    } else if (tokens[i_token].token == tipoToken.ABRE_PAR) {
        i_token++
        expressao(tokens, logs)
        if (tokens[i_token].token == tipoToken.FECHA_PAR) i_token++
    } else if (tokens[i_token].lexema == 'not') fator(tokens, logs)
    else {
        console.error("ERRO: Fator mal formatado")
        erro(tokens[i_token], logs, codErros[7])
        return
    }

}

//===================================================================================================

function analisadorSintatico(tokens_lex, logs) {
    let tokens = []

    tokens_lex.forEach(element => {
        if (element.token != tipoToken.COMENT) tokens.push(element)
    })
    //console.log(tokens_lex)
    i_token = 1
    if (tokens_lex[0].lexema === "program") programa(tokens, logs)
    else {
        console.error("Programa principal não encontrado!")
        erro(tokens[i_token], logs, codErros[0])
    }
}

function erro(token, logs, cod) {
    logs.push({
        token,
        err: cod
    })
}

module.exports = analisadorSintatico