const express = require('express')
const fs = require('fs')
const analizadorLexico = require('./analisadorLexico')


const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

let datas = []

const app = express()

//View Engine
app.set('view engine', 'ejs')

//Static
app.use(express.static('public'))


app.get('/', (req, res) => {
    res.render("index", { data: ['Seu código aparecerá aqui'], logs: [], tokens: [], originalname: 'Carregar arquivo' })
})

app.post('/upload', upload.single("filetoupload"), (req, res) => {
    if(req.file == undefined) return res.send({ "ERRO": "Você não carregou um arquivo. :( " })
    const { filename, originalname } = req.file
    console.log(originalname)

    fs.readFile('./uploads/'+filename, 'utf-8', (err, data) => {
        if(err) throw err 
        datas = Array.from(data)
        const logs = []
        const tokens = []
        analizadorLexico(datas, logs, tokens)

        console.log({data, logs, tokens})
        return res.render("index", {data, logs, tokens, originalname})
    })
})

app.listen(8080, () => {
    console.log("Seu app está rodando 🚀")
})