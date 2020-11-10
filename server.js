"use strict";
const   express     = require('express'),
        exphbs      = require('express-handlebars'),
        bodyParser  = require('body-parser'),
        fs          = require('fs'), 
        fetch       = require("node-fetch"),
        querystring = require("querystring"),
        app         = express(), 
        config      = require('config'),
        customers   = JSON.parse(fs.readFileSync('data/customers.json', 'utf-8')),
        states      = JSON.parse(fs.readFileSync('data/states.json', 'utf-8')),
        inContainer = process.env.CONTAINER,
        inAzure = process.env.WEBSITE_RESOURCE_GROUP,
        port = process.env.PORT || 8080;

const hbs = exphbs.create({
    extname: '.hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, X-XSRF-TOKEN, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    next();
});

// Pop-up dialog to ask for additional permissions, redirects to AAD page
app.get('/authstart', (req, res) => {
    var clientId = config.get("tab.appId");
    res.render('auth-start', { clientId: clientId });
});

//The dist folder has our static resources (index.html, css, images)
if (!inContainer) {
    app.use(express.static(__dirname + '/dist')); 
    console.log(__dirname);
}

// End of the pop-up dialog auth flow, returns the results back to parent window
app.get('/authend', (req, res) => {
    var clientId = config.get("tab.appId");
    res.render('auth-end', { clientId: clientId });
}); 

app.get('/api/customers/page/:skip/:top', (req, res) => {
    const topVal = req.params.top,
          skipVal = req.params.skip,
          skip = (isNaN(skipVal)) ? 0 : +skipVal;  
    let top = (isNaN(topVal)) ? 10 : skip + (+topVal);

    if (top > customers.length) {
        top = skip + (customers.length - skip);
    }

    console.log(`Skip: ${skip} Top: ${top}`);

    var pagedCustomers = customers.slice(skip, top);
    res.setHeader('X-InlineCount', customers.length);
    res.json(pagedCustomers);
});

app.get('/api/customers', (req, res) => {
    res.json(customers);
});

app.get('/api/customers/:id', (req, res) => {
    let customerId = +req.params.id;
    let selectedCustomer = null;
    for (let customer of customers) {
        if (customer.id === customerId) {
           // found customer to create one to send
           selectedCustomer = {};
           selectedCustomer = customer;
           break;
        }
    }  
    res.json(selectedCustomer);
});

app.post('/api/customers', (req, res) => {
    let postedCustomer = req.body;
    let maxId = Math.max.apply(Math,customers.map((cust) => cust.id));
    postedCustomer.id = ++maxId;
    postedCustomer.gender = (postedCustomer.id % 2 === 0) ? 'female' : 'male';
    customers.push(postedCustomer);
    res.json(postedCustomer);
});

app.put('/api/customers/:id', (req, res) => {
    let putCustomer = req.body;
    let id = +req.params.id;
    let status = false;

    //Ensure state name is in sync with state abbreviation 
    const filteredStates = states.filter((state) => state.abbreviation === putCustomer.state.abbreviation);
    if (filteredStates && filteredStates.length) {
        putCustomer.state.name = filteredStates[0].name;
        console.log('Updated putCustomer state to ' + putCustomer.state.name);
    }

    for (let i=0,len=customers.length;i<len;i++) {
        if (customers[i].id === id) {
            customers[i] = putCustomer;
            status = true;
            break;
        }
    }
    res.json({ status: status });
});

app.delete('/api/customers/:id', function(req, res) {
    let customerId = +req.params.id;
    for (let i=0,len=customers.length;i<len;i++) {
        if (customers[i].id === customerId) {
           customers.splice(i,1);
           break;
        }
    }  
    res.json({ status: true });
});

app.get('/api/orders/:id', function(req, res) {
    let customerId = +req.params.id;
    for (let cust of customers) {
        if (cust.customerId === customerId) {
            return res.json(cust);
        }
    }
    res.json([]);
});

app.get('/api/states', (req, res) => {
    res.json(states);
});

// On-behalf-of token exchange
app.post('/api/auth/token', function(req, res) {
    var tid = req.body.tid;
    var token = req.body.token;
    var scopes = ["https://graph.microsoft.com/User.Read"];

    var oboPromise = new Promise((resolve, reject) => {
        const url = "https://login.microsoftonline.com/" + tid + "/oauth2/v2.0/token";
        const params = {
            client_id: config.get("tab.appId"),
            client_secret: config.get("tab.appPassword"),
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: token,
            requested_token_use: "on_behalf_of",
            scope: scopes.join(" ")
        };
    
        fetch(url, {
            method: "POST",
            body: querystring.stringify(params),
            headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(result => {
            if (result.status !== 200) {
            result.json().then(json => {
                // TODO: Check explicitly for invalid_grant or interaction_required
                reject({"error":json.error});
            });
            } else {
            result.json().then(json => {
                resolve(json.access_token);
            });
            }
        });
    });

    oboPromise.then(function(result) {
        res.json(result);
    }, function(err) {
        console.log(err); // Error: "It broke"
        res.json(err);
    });
});

if (!inContainer) {
    // redirect all others to the index (HTML5 history)
    app.all('/*', function(req, res) {
        res.sendFile(__dirname + '/dist/index.html');
    });
}

app.listen(port);

console.log('Express listening on port ' + port);

//Open browser
if (!inContainer && !inAzure) {
    var opn = require('opn');

    opn('http://localhost:' + port).then(() => {
        console.log('Browser closed.');
    });
}


