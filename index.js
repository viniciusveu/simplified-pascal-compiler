const express = require('express')
const fs = require('fs')
const { analisadorLexico } = require('./analisadorLexico')
const analisadorSintatico = require('./analisadorSintatico')
const path = './uploads/'

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const app = express()

//View Engine
app.set('view engine', 'ejs')

//Static
app.use(express.static('public'))

//endpoint principal
app.get('/', (req, res) => {
    res.render("index", { data: [], logs: [], tokens: [], originalname: 'Carregar arquivo' })
})

//endpoint de compilação
app.post('/upload', upload.single("filetoupload"), (req, res) => {

    if (req.file == undefined) return res.send({ "ERRO": "Você não carregou um arquivo. :( " })
    const { filename, originalname } = req.file
    console.log(originalname)
    let datas = []

    fs.readFile(path + filename, 'utf-8', (err, data) => {
        if (err) throw err

        //datas = Array.from(data)
        datas = (Array.from(data)).slice()
        let tokens = []
        let linhas = []
        let logs = []

        analisadorLexico(datas, tokens, linhas)
        analisadorSintatico(tokens, logs)

        try {
            fs.unlinkSync(path + filename);
            console.log('successfully deleted ' + originalname);
        } catch (err) { console.error(err) }


        return res.render("index", { data: linhas.join(''), logs, tokens, originalname })
    })
})

//Rodando a aplicação na porta 8080
app.listen(8080, () => {
    console.log("Seu app está rodando 🚀")
})