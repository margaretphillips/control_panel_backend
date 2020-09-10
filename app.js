const express = require("express");
const bodyParser = require("body-parser");
const dateFormat = require("dateformat");
const tasks = require("./handlers/tasks");
const app = express();
const port = process.env.PORT || 8088;
const debug = true;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
});

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const connectionStr =
  "";

/*transactions*/

app.get("/savings/transactions", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("savings_transactions")
      .find({})
      .sort({
        _id: -1
      })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.post("/savings/transaction/insert/", (req, res) => {
  var transaction = {
    type: req.body.type || "",
    account: req.body.account || 0,
    amount: req.body.amount || 0,
    date: formatDate(new Date())
  };

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    dbo
      .collection("savings_transactions")
      .insertOne(transaction, function (err, response) {
        if (err) throw err;

        dbo
          .collection("savings_transactions")
          .find({})
          .toArray(function (err, result) {
            if (err) throw err;
            res.send(transaction);
            db.close();
          });
      });
  });
});

app.get("/budget/transactions", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("budget_transactions")
      .find({})
      .sort({
        _id: -1
      })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.post("/budget/transaction/insert/", (req, res) => {
  var transaction = {};
  var transtype = req.body.transtype ? req.body.transtype : "expense";

  if (transtype == "expense") {
    transaction = {
      category: req.body.category || "Category",
      label: req.body.label || "Expense",
      projected: req.body.projected || 0,
      actual: req.body.actual || 0,
      duedate: req.body.duedate || formatDate(new Date()),
      notes: req.body.notes || "",
      paid: req.body.paid || 0,
      paidon: req.body.paidon ? req.body.paidon : new Date(),
      transtype: transtype
    };
  } else {
    transaction = {
      title: req.body.title ? req.body.title : "Title",
      duedate: req.body.duedate ? req.body.duedate : 0,
      amount: req.body.amount ? req.body.amount : 0,
      paidon: req.body.paidon ? req.body.paidon : new Date(),
      transtype: transtype
    };
  }

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    dbo
      .collection("budget_transactions")
      .insertOne(transaction, function (err, response) {
        if (err) throw err;
        res.send(transaction);
        db.close();
        // dbo
        //   .collection("budget_transactions")
        //   .find({})
        //   .toArray(function(err, result) {
        //     if (err) throw err;
        //     res.send(transaction);
        //     db.close();
        //   });
      });
  });
});

app.get("/budget/transaction/delete/:id", (req, res) => {
  if (req.params.id == "" || req.params.id == undefined) throw err;

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    dbo.collection("budget_transactions").deleteOne(c_id, (err, response) => {
      if (err) throw err;
      res.send(JSON.stringify(response));
      db.close();
    });
  });
});

/*savings*/

app.get("/savings", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("savings")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/savings/:id", (req, res) => {
  MongoClient.connect(
    connectionStr,
    {
      useNewUrlParser: true
    },
    function (err, db) {
      if (err) throw err;

      var dbo = db.db("personal-planner");

      if (err) throw err;

      var c_id = {
        _id: ObjectId(req.params.id)
      };

      dbo
        .collection("savings")
        .find(c_id)
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    }
  );
});

app.post("/savings/update/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    var savings = {
      account: req.body.account || "Savings Account",
      amount: req.body.amount || 0,
      payment_type: req.body.payment_type || "payment"
    };

    var c_new = {
      $set: savings
    };

    dbo.collection("savings").updateOne(c_id, c_new, (err, response) => {
      if (err) throw err;
      res.send(JSON.stringify(savings));
      db.close();
    });
  });
});

app.post("/savings/insert/", (req, res) => {
  var savings = {
    account: req.body.account || "Savings Account",
    amount: req.body.amount || 0,
    payment_type: req.body.payment_type || ""
  };

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    dbo.collection("savings").insertOne(savings, function (err, response) {
      if (err) throw err;

      dbo
        .collection("savings")
        .find({})
        .toArray(function (err, response) {
          if (err) throw err;
          res.send(JSON.stringify(response));
          db.close();
        });
    });
  });
});

app.get("/savings/delete/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };
    dbo.collection("savings").deleteOne(c_id, (err, response) => {
      if (err) throw err;


      dbo
        .collection("savings")
        .find({})
        .toArray(function (err, response) {
          if (err) throw err;
          res.send(JSON.stringify(response));
          db.close();
        });


    });
  });
});

/*end savings */

/*credit */

app.get("/credit", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("credit_items")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/credit/payments", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("credit_payments")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/credit/:id", (req, res) => {
  MongoClient.connect(
    connectionStr,
    {
      useNewUrlParser: true
    },
    function (err, db) {
      if (err) throw err;

      var dbo = db.db("personal-planner");

      if (err) throw err;

      var c_id = {
        _id: ObjectId(req.params.id)
      };

      dbo
        .collection("credit_items")
        .find(c_id)
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    }
  );
});

app.post("/credit/update/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    var credit = {
      label: req.body.label,
      creditlimit:
        req.body.creditlimit != null && req.body.creditlimit != ""
          ? req.body.creditlimit
          : 0,
      creditbalance:
        req.body.creditbalance != null && req.body.creditbalance != ""
          ? req.body.creditbalance
          : 0,
      creditavailable:
        req.body.creditavailable != null && req.body.creditavailable != ""
          ? req.body.creditavailable
          : 0,
      paymentdue:
        req.body.paymentdue != null && req.body.paymentdue != ""
          ? req.body.paymentdue
          : 0,
      paymentduedate:
        req.body.paymentduedate != null && req.body.paymentduedate != ""
          ? req.body.paymentduedate
          : new Date(),
      paid: req.body.paid != null && req.body.paid != "" ? req.body.paid : "no",
      revolving:
        req.body.revolving != null && req.body.revolving != ""
          ? req.body.revolving
          : "yes"
    };

    var c_new = {
      $set: credit
    };

    dbo.collection("credit_items").updateOne(c_id, c_new, (err, response) => {
      if (err) throw err;
      dbo
        .collection("credit_items")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    });
  });
});

app.post("/credit/insert/", (req, res) => {
  var credit = {
    label: req.body.label || "",
    creditlimit: req.body.creditlimit || 0,
    creditbalance: req.body.creditbalance || 0,
    creditavailable: req.body.creditavailable || 0,
    paymentdue: req.body.paymentdue || 0,
    paymentduedate: req.body.paymentduedate || "",
    paid: false,
    revolving:
      req.body.revolving != null && req.body.revolving != ""
        ? req.body.revolving
        : "yes"
  };

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    dbo.collection("credit_items").insertOne(credit, function (err, response) {
      if (err) throw err;

      dbo
        .collection("credit_items")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(result);
          db.close();
        });
    });
  });
});

app.get("/credit/delete/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };
    dbo.collection("credit_items").deleteOne(c_id, (err, response) => {
      if (err) throw err;
      dbo
        .collection("credit_items")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    });
  });
});

app.get("/credit/payment/delete/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };
    dbo.collection("credit_payments").deleteOne(c_id, (err, response) => {
      if (err) throw err;
      res.send(JSON.stringify(response));
      db.close();
    });
  });
});

/*end credit */

/*expense category*/

app.get("/categories", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("category_items")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/category/:id", (req, res) => {
  MongoClient.connect(
    connectionStr,
    {
      useNewUrlParser: true
    },
    function (err, db) {
      if (err) throw err;

      var dbo = db.db("personal-planner");

      if (err) throw err;

      var c_id = {
        _id: ObjectId(req.params.id)
      };

      dbo
        .collection("category_items")
        .find(c_id)
        .toArray(function (err, result) {
          if (err) throw err;
          dbo
            .collection("category_items")
            .find({})
            .toArray(function (err, result) {
              if (err) throw err;
              res.send(JSON.stringify(result));
              db.close();
            });
        });
    }
  );
});

app.post("/category/update/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    const income_label = req.body.label || "Income Label";

    var category = {
      label: income_label
    };

    var c_new = {
      $set: category
    };

    dbo.collection("category_items").updateOne(c_id, c_new, (err, response) => {
      if (err) throw err;
      dbo
        .collection("category_items")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    });
  });
});

app.post("/category/insert/", (req, res) => {
  let category = {
    label: req.body.label != "" ? req.body.label : "Category"
  };

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    let dbo = db.db("personal-planner");

    dbo
      .collection("category_items")
      .insertOne(category, function (err, response) {
        if (err) throw err;
        dbo
          .collection("category_items")
          .find({})
          .toArray(function (err, result) {
            if (err) throw err;
            res.send(JSON.stringify(result));
            db.close();
          });
      });
  });
});

app.get("/category/delete/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };
    dbo.collection("category_items").deleteOne(c_id, (err, response) => {
      if (err) throw err;
      dbo
        .collection("category_items")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    });
  });
});

/*end expense category*/

/*income*/

app.get("/incomes", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("income_items")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(result);
        db.close();
      });
  });
});

// app.get("/incomes/:type", (req, res) => {
//   MongoClient.connect(connectionStr, function (err, db) {
//     if (err) throw err;

//     var dbo = db.db("personal-planner");

//     if (err) throw err;

//     dbo
//       .collection("income_items")
//       .find({
//         type: req.params.type
//       })
//       .toArray(function (err, result) {
//         if (err) throw err;
//         res.send(JSON.stringify(result));
//         db.close();
//       });
//   });
// });

// app.get("/income/:id", (req, res) => {
//   MongoClient.connect(
//     connectionStr, {
//       useNewUrlParser: true
//     },
//     function (err, db) {
//       if (err) throw err;

//       var dbo = db.db("personal-planner");

//       if (err) throw err;

//       var c_id = {
//         _id: ObjectId(req.params.id)
//       };

//       dbo
//         .collection("income_items")
//         .find(c_id)
//         .toArray(function (err, result) {
//           if (err) throw err;
//           res.send(JSON.stringify(result));
//           db.close();
//         });
//     }
//   );
// });

app.post("/income/update/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    const dbo = db.db("personal-planner");

    const c_id = {
      _id: ObjectId(req.params.id)
    };

    let title = req.body.title != "" ? req.body.title : "Income Title";
    let amount = req.body.amount != "" ? req.body.amount : 0;
    //let type = req.body.type != "" ? req.body.type : "projected";
    let type = "actual";
    let duedate = req.body.duedate != "" ? req.body.duedate : "1";
    // if (type === "actual") {
    //   duedate = new Date();
    // } else {
    //   duedate =
    //     req.body.duedate != "" ? req.body.duedate : formatDate(new Date());
    // }

    let income = {
      title,
      amount,
      duedate,
      type
    };

    var c_new = {
      $set: income
    };

    dbo.collection("income_items").updateOne(c_id, c_new, (err, response) => {
      if (err) throw err;
      res.send(income);
      db.close();
    });
  });
});

app.post("/income/insert/", (req, res) => {
  let title = req.body.title != "" ? req.body.title : "Income Title";
  let amount = req.body.amount != "" ? req.body.amount : 0;
  let duedate = req.body.duedate != "" ? req.body.duedate : "1";
  let type = req.body.type != "" ? req.body.type : "projected";
  let transtype = "income";
  let paidon = req.body.paidon != "" ? req.body.paidon : new Date();

  let income = {
    title,
    amount,
    duedate,
    type,
    paidon
  };

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    const dbo = db.db("personal-planner");

    dbo.collection("income_items").insertOne(income, function (err, response) {
      if (err) throw err;

      // dbo
      //   .collection("income_items")
      //   .find({})
      //   .toArray(function (err, result) {
      //     if (err) throw err;
      res.send(income);
      db.close();
      // });
    });
  });
});

app.get("/income/delete/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    const dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    dbo.collection("income_items").deleteOne(c_id, (err, response) => {
      if (err) throw err;
      res.send(response);
      db.close();
    });
  });
});

/*end income*/

/*expense*/

app.get("/expenses", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("expense_items")
      .find({})
      .sort({
        duedate: -1
      })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/expenses/cat/:cat", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    const category = req.params.cat;

    dbo
      .collection("expense_items")
      .find({
        category: category
      })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/expense/:id", (req, res) => {
  MongoClient.connect(
    connectionStr,
    {
      useNewUrlParser: true
    },
    function (err, db) {
      if (err) throw err;

      var dbo = db.db("personal-planner");

      if (err) throw err;

      var c_id = {
        _id: ObjectId(req.params.id)
      };

      dbo
        .collection("expense_items")
        .find(c_id)
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    }
  );
});

app.post("/expense/update/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    console.log("before");
    console.log(req);

    let category = req.body.category != "" ? req.body.category : "housing";
    let label = req.body.label != "" ? req.body.label : "label";
    let projected = req.body.projected != "" ? req.body.projected : 0;
    let actual = req.body.actual != "" ? req.body.actual : 0;
    let duedate = req.body.duedate != "" ? req.body.duedate : new Date();
    let nextdate = req.body.nextdate != "" ? req.body.nextdate : new Date();
    //let duedate = new Date();
    //let nextdate = new Date();

    let recurrance = req.body.recurrance != "" ? req.body.recurrance : 0;
    let paid = req.body.paid != "" ? req.body.paid : "no";
    let next = 0;
    let notes = req.body.notes != "" ? req.body.notes : "";
    let active = req.body.active != "" ? req.body.active : "no";
    let paidOn = new Date();

    //console.log(nextdate);
    //console.log(formatDate(nextdate));
    //return;

    var expense = {
      category: category,
      label: label,
      projected: projected,
      actual: actual,
      duedate: duedate,
      nextdate: nextdate,
      recurrance: recurrance,
      paid: paid,
      next: next,
      notes: notes,
      active: active,
      paidon: paidOn
    };

    console.log("during");
    console.log(expense);

    var c_new = {
      $set: expense
    };

    dbo.collection("expense_items").updateOne(c_id, c_new, (err, response) => {
      if (err) throw err;
      dbo
        .collection("expense_items")
        .find({})
        .sort({
          duedate: -1
        })
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    });
  });
});

app.post("/expense/recurrance/update/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    if (debug) {
      console.log("expense/recurrance/update");
      console.log(req);
    }

    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    let category = req.body.category != "" ? req.body.category : "housing";
    let label = req.body.label != "" ? req.body.label : "label";
    let projected = req.body.projected != "" ? req.body.projected : 0;
    let actual = req.body.actual != "" ? req.body.actual : 0;
    let recurrance = req.body.recurrance != "" ? req.body.recurrance : 4;
    let duedate =
      req.body.duedate != "" ? new Date(req.body.duedate) : new Date();
    let nextdate =
      req.body.nextdate != "" ? new Date(req.body.nextdate) : new Date();
    let paid = req.body.paid != "" ? req.body.paid : 0;
    let next = req.body.next != "" ? req.body.next : 0;
    let notes = req.body.notes != "" ? req.body.notes : "";

    if (debug) {
      console.log("duedate : " + formatDate(duedate));
      console.log("nextdate : " + formatDate(nextdate));
    }

    if (next === 1) {
      paid = 0;
    }

    if (paid === 1) {
      if (recurrance < 4) {
        duedate = formatDate(nextdate);
        nextdate = getRecurrance(nextdate, recurrance);
      }

      next = 1;
    }

    var expense = {
      category: category,
      label: label,
      projected: projected,
      actual: actual,
      recurrance: recurrance,
      duedate: formatDate(duedate),
      nextdate: formatDate(nextdate),
      paid: paid,
      next: next,
      notes: notes
    };

    if (debug) {
      console.log("after");
      console.log(expense);
    }

    var c_new = {
      $set: expense
    };

    dbo.collection("expense_items").updateOne(c_id, c_new, (err, response) => {
      if (err) throw err;
      res.send(expense);
      db.close();
    });
  });
});

app.post("/expense/insert/", (req, res) => {
  let category = req.body.category != "" ? req.body.category : "housing";
  let label = req.body.label != "" ? req.body.label : "expense";
  let projected = req.body.projected != "" ? req.body.projected : 0;
  let actual = req.body.actual != "" ? req.body.actual : 0;
  let duedate = req.body.duedate != "" ? req.body.duedate : new Date();
  let nextdate = req.body.nextdate != "" ? req.body.nextdate : new Date();
  let recurrance = req.body.recurrance != "" ? req.body.recurrance : 0;
  let paid = req.body.paid != "" ? req.body.paid : "no";
  let active = req.body.active != "" ? req.body.active : "no";
  let next = 0;
  let notes = "";

  var expense = {
    category: category,
    label: label,
    projected: projected,
    actual: actual,
    duedate: duedate,
    nextdate: nextdate,
    recurrance: recurrance,
    paid: paid,
    next: next,
    notes: notes,
    active: active
  };

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    dbo.collection("expense_items").insertOne(expense, function (err, response) {
      if (err) throw err;

      dbo
        .collection("expense_items")
        .find({})
        .sort({
          duedate: -1
        })
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    });
  });
});

app.post("/expense/recurring/insert/", (req, res) => {
  //initialize
  if (debug) {
    console.log("expense/recurring/insert");
    console.log(req);
  }
  let category = req.body.category != "" ? req.body.category : "housing";
  let label = req.body.label != "" ? req.body.label : "label";
  let projected = req.body.projected != "" ? req.body.projected : 0;
  let actual = req.body.actual != "" ? req.body.actual : 0;
  let duedate =
    req.body.duedate != "" ? new Date(req.body.duedate) : new Date();
  let nextdate = "";
  let recurrance = req.body.recurrance != "" ? req.body.recurrance : 4;
  let paid = 0;
  let next = 0;

  //logic
  // recurrance: 1 = every two weeks , 2 = 1st paycheck, 3 = 2nd paycheck, 4 = manual
  if (recurrance < 4) {
    //console.log("due date prior to get recurrance" + duedate);

    nextdate = getRecurrance(duedate, recurrance);
    duedate = formatDate(duedate);
  } else {
    duedate = formatDate(duedate);
    nextdate = formatDate(nextdate);
  }

  var expense = {
    category: category,
    label: label,
    projected: projected,
    actual: actual,
    duedate: duedate,
    nextdate: nextdate,
    recurrance: recurrance,
    paid: paid,
    next: next
  };

  if (debug) {
    console.log("before insert");
    console.log(expense);
  }

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    dbo.collection("expense_items").insertOne(expense, function (err, response) {
      if (err) throw err;

      //dbo
      //.collection("expense_items")
      //.find({})
      //.toArray(function(err, result) {
      //if (err) throw err;
      res.send(expense);
      db.close();
      //});
    });
  });
});

app.get("/expense/delete/:id", (req, res) => {
  if (req.params.id == "" || req.params.id == undefined) throw err;

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    dbo.collection("expense_items").deleteOne(c_id, (err, response) => {
      if (err) throw err;
      dbo
        .collection("expense_items")
        .find({})
        .sort({
          duedate: -1
        })
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    });
  });
});

app.get("/current", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    // var c_id = {
    //   _id: ObjectId(req.params.id)
    // };

    dbo
      .collection("current_expenses")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(result);
        db.close();
      });
  });
});

app.post("/current/insert", (req, res) => {
  if (debug) {
    console.log("before insert");
    console.log(req);
  }

  let category = req.body.category != "" ? req.body.category : "housing";
  let label = req.body.label != "" ? req.body.label : "label";
  let projected = req.body.projected != "" ? req.body.projected : 0;
  let actual = req.body.actual != "" ? req.body.actual : 0;
  let duedate =
    req.body.duedate != "" ? new Date(req.body.duedate) : new Date();
  let nextdate =
    req.body.nextdate != "" ? new Date(req.body.nextdate) : new Date();
  let recurrance = req.body.recurrance != "" ? req.body.recurrance : 4;
  let paid = 0;
  let next = 0;
  let notes = req.body.notes != "" ? req.body.notes : "";

  const current = {
    category,
    label,
    projected,
    actual,
    duedate: formatDate(duedate),
    nextdate: formatDate(nextdate),
    recurrance,
    paid,
    next,
    notes
  };

  //var dbo = db.db("personal-planner");
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    let dbo = db.db("personal-planner");

    dbo
      .collection("current_expenses")
      .insertOne(current, function (err, response) {
        if (err) throw err;
        res.send(response);
        db.close();
      });
  });
});

app.get("/current/delete/:id", (req, res) => {
  if (req.params.id == "" || req.params.id == undefined) throw err;

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    dbo.collection("current_expenses").deleteOne(c_id, (err, response) => {
      if (err) throw err;
      res.send(JSON.stringify(response));
      db.close();
    });
  });
});
/*end expense*/

/*tasks*/
app.get("/tasks", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("tasks")
      .find()
      .sort({
        priority: 1
      })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/tasks/priorities", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("tasks")
      .find({})
      .sort({
        priority: 1
      })
      .limit(5)
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/tasks/reminders", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("tasks")
      .find({})
      .filter({
        reminder: true
      })
      .sort({
        priority: 1
      })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/tasks/:id", (req, res) => {
  MongoClient.connect(
    connectionStr,
    {
      useNewUrlParser: true
    },
    function (err, db) {
      if (err) throw err;

      var dbo = db.db("personal-planner");

      if (err) throw err;

      var c_id = {
        _id: ObjectId(req.params.id)
      };

      dbo
        .collection("tasks")
        .find(c_id)
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    }
  );
});

app.post("/tasks/insert/", (req, res) => {
  var task = {
    title: req.body.title || "Task Title",
    description: req.body.description ? req.body.description : "Task Description",
    duedate: req.body.duedate || formatDate(new Date()),
    priority: Number(req.body.priority) || 1,
    reminder: req.body.reminder || 1
  };

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    dbo.collection("tasks").insertOne(task, function (err, response) {
      if (err) throw err;

      dbo
        .collection("tasks")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(task);
          db.close();
        });
    });
  });
});

app.get("/tasks/delete/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    dbo.collection("tasks").remove(c_id, (err, response) => {
      if (err) throw err;
      res.send(JSON.stringify(response));
      db.close();
    });
  });
});

app.post("/tasks/update/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    let dbo = db.db("personal-planner");

    let c_id = {
      _id: ObjectId(req.params.id)
    };

    let title = req.body.title != "" ? req.body.title : "Task Name";
    let duedate =
      req.body.duedate != "" ? req.body.duedate : formatDate(new Date());
    let priority = req.body.priority != "" ? Number(req.body.priority) : 1;
    let reminder = req.body.reminder != "" ? req.body.reminder : 0;
    let description = req.body.description != "" ? req.body.description : null;

    let task = {
      title,
      duedate,
      priority,
      reminder,
      description
    };

    var c_new = {
      $set: task
    };

    dbo.collection("tasks").updateOne(c_id, c_new, (err, response) => {
      if (err) throw err;
      res.send(task);
      db.close();
    });
  });
});
/*end tasks*/

/*daily*/
app.get("/daily", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("daily_items")
      .find()
      .sort({
        title: 1
      })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});

app.get("/daily/:id", (req, res) => {
  MongoClient.connect(
    connectionStr,
    {
      useNewUrlParser: true
    },
    function (err, db) {
      if (err) throw err;

      var dbo = db.db("personal-planner");

      if (err) throw err;

      var c_id = {
        _id: ObjectId(req.params.id)
      };

      dbo
        .collection("daily_items")
        .find(c_id)
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(result);
          db.close();
        });
    }
  );
});

app.post("/daily/insert/", (req, res) => {
  var daily = {
    title: req.body.title || "Morning Task",
    category: req.body.category || "morning",
    completed: false
  };

  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    dbo.collection("daily_items").insertOne(daily, function (err, response) {
      if (err) throw err;

      dbo
        .collection("daily_items")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(daily);
          db.close();
        });
    });
  });
});

app.get("/daily/delete/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    dbo.collection("daily_items").deleteOne(c_id, (err, response) => {
      if (err) throw err;
      res.send(response);
      db.close();
    });
  });
});

app.post("/daily/update/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    var daily = {
      title: req.body.title || "Daily Name",
      category: req.body.category || "anytime",
      completed: req.body.completed || "yes",
      completed_date: formatDate(new Date()),
      reminder: req.body.reminder || "yes",
      reset: req.body.reset || "yes",
      frequency: req.body.frequency || null
    };

    if (daily.completed === "yes" && daily.reset === "yes") {
      daily.completed = "no";
    }

    var c_new = {
      $set: daily
    };

    dbo.collection("daily_items").updateOne(c_id, c_new, (err, response) => {
      if (err) throw err;

      dbo
        .collection("daily_items")
        .find({})
        .sort({
          title: -1
        })
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });

      //db.close();
    });
  });
});
/*end daily*/

//calendar
app.get("/events", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    if (err) throw err;

    dbo
      .collection("calendar_items")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result));
        db.close();
      });
  });
});
app.post("/events/insert", (req, res) => {
  const event = {
    summary: req.body.summary,
    description: req.body.description,
    location: req.body.location,
    start: {
      dateTime: req.body.start, // ISO 8601 formatted
      timeZone: "America/California" // Timezone listed as a separate IANA code
    },
    end: {
      dateTime: req.body.end,
      timeZone: "America/California"
    },
    color: "purple",
    category: "work"
  };
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;

    var dbo = db.db("personal-planner");

    dbo.collection("calendar_items").insertOne(event, function (err, response) {
      if (err) throw err;

      dbo
        .collection("calendar_items")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(result);
          db.close();
        });
    });
  });
});
app.post("/events/update/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    var event = {
      summary: req.body.summary,
      description: req.body.description,
      location: req.body.location,
      start: { dateTime: req.body.start },
      end: { dateTime: req.body.end }
    };

    var c_new = {
      $set: event
    };

    dbo.collection("calendar_items").updateOne(c_id, c_new, (err, response) => {
      if (err) throw err;

      dbo
        .collection("calendar_items")
        .find({})
        .sort({
          title: -1
        })
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });

      //db.close();
    });
  });
});
app.get("/events/delete/:id", (req, res) => {
  MongoClient.connect(connectionStr, function (err, db) {
    if (err) throw err;
    var dbo = db.db("personal-planner");

    var c_id = {
      _id: ObjectId(req.params.id)
    };

    dbo.collection("calendar_items").deleteOne(c_id, (err, response) => {
      if (err) throw err;
      dbo
        .collection("calendar_items")
        .find({})
        .sort({
          title: -1
        })
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result));
          db.close();
        });
    });
  });
});

function formatDate(date) {
  if (debug) {
    console.log("formatDate");
    console.log(date);
  }
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return month + "/" + day + "/" + year;
}

function getRecurrance(date, recurrance) {
  //console.log("recurrance : " + recurrance);

  let day = date.getDate();
  console.log("day : " + day);
  let month = date.getMonth() + 1;
  console.log("month : " + month);
  let year = date.getFullYear();
  console.log("year : " + year);

  let final_month = "";
  let final_day = "";

  if (recurrance == 4) {
    //leave the dates alone, let the user set them manually
    final_month = month;
    final_day = day;
  }
  if (recurrance == 3) {
    //update to the next 2nd paycheck
    final_month = month + 1;
    final_day = 26;
  }
  if (recurrance == 2) {
    //update to the next 1st paycheck
    final_month = month + 1;
    final_day = 12;
  }
  if (recurrance == 1) {
    //update to 2 weeks from now assuming a 30 day month
    if (day + 13 > 30) {
      final_month = month + 1;
    } else {
      final_month = month;
    }
    final_day = day + 13;
    if (final_day > 30) {
      final_day = final_day - 30;
    }
  }

  let final_date = final_month + "/" + final_day + "/" + year;
  console.log("final :" + final_date);
  return final_date;
}
app.listen(port, () => console.log(`Listening on port ${port}!`));
