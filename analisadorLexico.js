const tipoToken = {
    NUM_INT: "numInt",
    NUM_REAL: "numReal",
    OP_SOMA: "opSoma",
    OP_SUB: "opSub",
    OP_MULT: "opMult",
    OP_DIV: "opDiv",
    ABRE_PAR: "abrePar",
    FECHA_PAR: "fechaPar",
    VIRGULA: "virgula",
    PT_VIRG: "pontoEVirgula",
    DOIS_PTS: "doisPontos",
    MAIOR_QUE: "maiorQue",
    MENOR_QUE: "menorQue",
    MAIOR_IGUAL: "maiorIgualQue",
    MENOR_IGUAL: "menorIgualQue",
    DIFERENTE: "diferenteQue",
    ATRIBUICAO: "atribuicao",
    IGUAL: "igualA",
    PALAVRA: "palavraReservada",
    IDENTIFICADOR: "palavraIdentificadora",
    COMENT: "comentario",
    PT: "pontoFinal",
    ERRO: "erroLexico"
}

const tipoErro = {
    NUM_MAL_FORMATADO: "numMalFormatado",
    SIMB_DESCONHECIDO: "simbNaoConhecido",
    OVERFLOW: "muitoLongo",
    COMENT_NAO_FECHADO: "comentNuncaFechado"
}

const simbolos = [
    '+', '-', '*', '/', '(', ')', ',', ';', ':', '>', '<', '=', "."
]

const palavrasRes = [
    'program', 'procedure', 'var', 'begin', 'end', 'if', 'then', 'else', 'while', 'do', 'or', 'div', 'and', 'not', 'int', 'boolean', 'true', 'false', 'read', 'write'
]

function geraToken(lexema, token, linha, colIni, colFin, erro) {
    //console.log('< '+nome+', '+lexema+' >')
    return {
        lexema,
        token,
        linha,
        colIni,
        colFin,
        erro
    }
}

function pertenceListaSimbolos(element) {
    if (simbolos.indexOf(element) != -1) return true
    return false
}

function pertenceListaPalavrasRes(element) {
    if (palavrasRes.indexOf(element) != -1) return true
    return false
}

function verificaCaracteres(element) {
    let regex = /^[a-zA-Z0-9]+$/
    return regex.test(element) && isNaN(element[0])
}

function analisadorLexico(data, tokens, linhas) {

    let buffer = []
    let bufferStr = ''
    let linha = 1
    let coluna = 0
    let eComentario = false
    let eComentarioLinha = false
    linhas.push('1  | ')

    data.forEach((element, index) => {
        linhas.push(element)
        coluna++
        if (element != '\n' || element != ' ' || element != '\t') { //Estado de partida

            if (element != '\n' && element != ' ' && element != '\t' && !pertenceListaSimbolos(element) || eComentario || eComentarioLinha) {

                if (element == '{' || element == '}') {
                    element == '{' ? eComentario = true : eComentario = false
                }
                if (eComentarioLinha) {
                    if (element == '\n') {
                        eComentarioLinha = false
                        linhas.push(linha + 1 + '  | ')
                    }
                }
                buffer.push(element) // Caso possa ser um numero (numeros e '.')
                coluna--
            } else {
                if (buffer.length) {
                    bufferStr = buffer.join('')
                    if (buffer[0] == '{' || buffer[0] == '/') {
                        tokens.push(geraToken(bufferStr, tipoToken.COMENT, linha, coluna, coluna + buffer.length - 1, ' - '))
                        coluna = 1
                        buffer.length = 0
                    } else if (buffer.length > 15) {
                        tokens.push(geraToken(bufferStr, tipoToken.ERRO, linha, coluna, coluna + buffer.length - 1, tipoErro.OVERFLOW))
                    } else if (buffer.indexOf('.') == -1) {
                        if (!isNaN(bufferStr)) tokens.push(geraToken(bufferStr, tipoToken.NUM_INT, linha, coluna, coluna + buffer.length - 1, ' - '))
                        else {
                            if (pertenceListaPalavrasRes(bufferStr)) tokens.push(geraToken(bufferStr, tipoToken.PALAVRA, linha, coluna, coluna + buffer.length - 1, ' - '))
                            else {
                                if (verificaCaracteres(bufferStr)) tokens.push(geraToken(bufferStr, tipoToken.IDENTIFICADOR, linha, coluna, coluna + buffer.length - 1, ' - '))
                                else
                                    tokens.push(geraToken(bufferStr, tipoToken.ERRO, linha, coluna, coluna + buffer.length - 1, tipoErro.SIMB_DESCONHECIDO))

                            }
                        }
                    } else {
                        if (!isNaN(bufferStr)) tokens.push(geraToken(bufferStr, tipoToken.NUM_REAL, linha, coluna, coluna + buffer.length - 1, ' - '))
                        else
                            tokens.push(geraToken(bufferStr, tipoToken.ERRO, linha, coluna, coluna + buffer.length - 1, tipoErro.NUM_MAL_FORMATADO))
                    }
                    coluna = coluna + buffer.length
                    buffer.length = 0
                }
                if (element == '+') tokens.push(geraToken(element, tipoToken.OP_SOMA, linha, coluna, coluna, ' - '))
                else if (element == '-') tokens.push(geraToken(element, tipoToken.OP_SUB, linha, coluna, coluna, ' - '))
                else if (element == '*') tokens.push(geraToken(element, tipoToken.OP_MULT, linha, coluna, coluna, ' - '))
                else if (element == '(') tokens.push(geraToken(element, tipoToken.ABRE_PAR, linha, coluna, coluna, ' - '))
                else if (element == ')') tokens.push(geraToken(element, tipoToken.FECHA_PAR, linha, coluna, coluna, ' - '))
                else if (element == ',') tokens.push(geraToken(element, tipoToken.VIRGULA, linha, coluna, coluna, ' - '))
                else if (element == ';') tokens.push(geraToken(element, tipoToken.PT_VIRG, linha, coluna, coluna, ' - '))
                else if (element == '.') tokens.push(geraToken(element, tipoToken.PT, linha, coluna, coluna, ' - '))
                else if (element == '/') {
                    if (data[index + 1] != '/' && data[index - 1] != '/') tokens.push(geraToken(element, tipoToken.OP_DIV, linha, coluna, coluna, ' - '))
                    else {
                        eComentarioLinha = true
                        buffer.push(element)
                        coluna--
                    }
                } else if (element == ':') {
                    if (data[index + 1] != '=')
                        tokens.push(geraToken(element, tipoToken.DOIS_PTS, linha, coluna, coluna, ' - '))
                } else if (element == '<') {
                    if (data[index + 1] != '=' && data[index + 1] != '>')
                        tokens.push(geraToken(element, tipoToken.MENOR_QUE, linha, coluna, coluna, ' - '))
                } else if (element == '>') {
                    if (data[index + 1] != '=' && data[index - 1] != '<')
                        tokens.push(geraToken(element, tipoToken.MAIOR_QUE, linha, coluna, coluna, ' - '))
                    else if (data[index - 1] == '<') tokens.push(geraToken(data[index - 1] + element, tipoToken.DIFERENTE, linha, coluna - 1, coluna, ' - '))
                } else if (element == '=') {
                    if (data[index - 1] == ':')
                        tokens.push(geraToken(data[index - 1] + element, tipoToken.ATRIBUICAO, linha, coluna - 1, coluna, ' - '))
                    else if (data[index - 1] == '>')
                        tokens.push(geraToken(data[index - 1] + element, tipoToken.MAIOR_IGUAL, linha, coluna - 1, coluna, ' - '))
                    else if (data[index - 1] == '<')
                        tokens.push(geraToken(data[index - 1] + element, tipoToken.MENOR_IGUAL, linha, coluna - 1, coluna, ' - '))
                    else tokens.push(geraToken(element, tipoToken.IGUAL, linha, coluna, coluna, ' - '))
                }

                if (element == '\n') {
                    linha++
                    coluna = 0
                    linhas.push(linha + '  | ')
                }
                if (element == '\t') coluna = coluna + 3
            }
        }

    });
    if (eComentario) {
        bufferStr = buffer.join('')
        tokens.push(geraToken(bufferStr, tipoToken.ERRO, linha, coluna, coluna + buffer.length - 1, tipoErro.COMENT_NAO_FECHADO))
    }


}


module.exports = {
    analisadorLexico,
    tipoToken
}