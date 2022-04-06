var jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const db = require("./db");
const cors = require("cors");
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  app.use(cors());
  next();
});

db.connect((err) => {
  if (err) {
    throw err;
  } else {
    console.log("Connect to DB!");
  }
});

app.post("/login", (req, res, next) => {
  if (req.body.user === "admin_cgs" && req.body.pwd === "cgsAdmin*@") {
    //auth ok
    const id = 1; //esse id viria do banco de dados
    var token = jwt.sign({ id }, "mysecret", {
      expiresIn: 300, // expires in 5min
    });
    return res.status(200).json({ auth: true, token: token });
  }

  return res.status(500).json({ mensage: "Login invalid!" });
});

function verifyJWT(req, res, next) {
  var token = req.headers["x-access-token"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token, "mysecret", function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });

    req.userId = decoded.id;
    next();
  });
}

app.get("/", verifyJWT, async (req, res) => {
  res.send("Pagina Init");
});

app.get("/all", verifyJWT, (req, res) => {
  const sql = "SELECT * FROM app_cartelas_vendidas";
  db.connect((err) => {
    db.query(sql, (err, results) => {
      if (err) {
        throw err;
      }
      res.send(results);
    });
  });
});

app.post("/customize-select", verifyJWT, (req, res) => {
  const sql = `SELECT * FROM app_cartelas_vendidas WHERE ${req.body.header} = ${req.body.value}`;
  db.connect((err) => {
    try {
      db.query(sql, (err, results) => {
        if (err) {
          res.status(400).json({
            message: err.message,
            status: 400,
          });
        }
        res.send(results);
      });
    } catch (err) {
      throw new Error(err);
    }
  });
});

app.post("/save-data", verifyJWT, async function (req, res) {
  const ID_EMPRESA = req.body.ID_EMPRESA;
  const ID_EXTRACAO = req.body.ID_EXTRACAO;
  const ID_TIPO = req.body.ID_TIPO;
  const TITULO1 = req.body.TITULO1;
  const TITULO2 = req.body.TITULO2;
  const TITULO3 = req.body.TITULO3;
  const TITULO4 = req.body.TITULO4;
  const AUTORIZACAO = req.body.AUTORIZACAO;
  const SELO = req.body.SELO;
  const NOME = req.body.NOME;
  const CELULAR = req.body.CELULAR;
  const EMAIL = req.body.EMAIL;
  const CPF = req.body.CPF;
  const CEP = req.body.CEP;
  const ENDERECO = req.body.ENDERECO;
  const COMPLEMENTO = req.body.COMPLEMENTO;
  const BAIRRO = req.body.BAIRRO;
  const UF = req.body.UF;

  const body = [
    ID_EMPRESA,
    ID_EXTRACAO,
    ID_TIPO,
    TITULO1,
    TITULO2,
    TITULO3,
    TITULO4,
    AUTORIZACAO.toString(),
    SELO.toString(),
    NOME.toString(),
    CELULAR.toString(),
    EMAIL.toString(),
    CPF.toString(),
    CEP.toString(),
    ENDERECO.toString(),
    COMPLEMENTO.toString(),
    BAIRRO.toString(),
    UF.toString(),
  ];

  await db.connect(() => {
    console.log(body);
    try {
      db.query(
        `INSERT INTO app_cartelas_vendidas (ID_EMPRESA, ID_EXTRACAO, ID_TIPO, TITULO1, TITULO2, TITULO3, TITULO4, AUTORIZACAO, SELO, NOME, CELULAR, EMAIL, CPF, CEP, ENDERECO, COMPLEMENTO, BAIRRO, UF) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        body,
        (err, results, fields) => {
          if (err) {
            res.status(400).json({
              message: err.message,
              status: 400,
            });
          }
          res.status(200).json({
            data: req.body,
            status: 200,
          });
        }
      );
    } catch (err) {
      throw new Error(err);
    }
  });
});

app.listen("3030", () => {
  console.log("Server init");
});
