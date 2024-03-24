const http = require('http');
const url  = require('url');
const fs   = require('fs');

const hostname = process.env.HOSTNAME || "192.168.1.115"; // use your pi's IP address here
 
const port = 80;

// GET http://192.168.0.110:80/Menu
// GET http://192.168.1.10.121:80/Students
// GET http://192.168.0.121:80/Orders
// POST http://192.168.0.121:80/Orders/ssssss /* body contains JSON encoded order */
const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    
    const request = {
        headers : req.headers,
        method  : req.method,
        url     : parsedUrl.pathname,
        query   : parsedUrl.query,
    };

    const hostname = req.url.split("/")[1];
    const rest = req.url.substring(hostname.length + 1);
    const resource = rest.replace(/\/([^/?]*)[/?]?.*$/, "$1");

    let studentId = rest.split("/")[2];

    // not necessary
    if (studentId) {
        studentId = decodeURIComponent(studentId);
    }

    // process GET /Menu
	
    // { "2020-04-17" : { "entrees": ["hamburgers", "hotdogs", ...], "drinks": ["milk", ...]}, "2020-04-18": ....} 
    if (parsedUrl.pathname == '/Menu' && req.method == 'GET') {
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        

        
        const menu = JSON.parse(fs.readFileSync('menu.json').toString());
        
        res.end(JSON.stringify(menu.dates[day]));
    }

    else if (parsedUrl.pathname == '/OVHS' && req.method == 'GET') {
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        

     //        const menu = JSON.parse(fs.readFileSync('OVHSmenu.json').toString().replace(/\s+$/, ""));   
        const menu = JSON.parse(fs.readFileSync('OVHSmenu.json').toString());
        
        res.end(JSON.stringify(menu.dates[day]));
    }

    //  Menu GET .../OVHSv2?day=m/d/yyyy

    else if (parsedUrl.pathname == '/OVHS2' && req.method == 'GET') {

        const parsedUrl = url.parse(req.url, true);
        const params = parsedUrl.query;
        const day = params.day;
       
        res.setHeader('Content-Type', 'application/json');
        
    //        const menu = JSON.parse(fs.readFileSync('OVHSmenu.json').toString().replace(/\s+$/, ""));   
        const menu = JSON.parse(fs.readFileSync('OVHSmenu.json').toString());

        res.statusCode = 200;
    
        res.end(JSON.stringify(menu.dates[day]));
        return;
    }

    // process GET /Sales

    else if (parsedUrl.pathname == '/Sales' && req.method == 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.write(fs.readFileSync('sales.csv'));
    }

    // process POST /Date

    else if (parsedUrl.pathname.startsWith('/Date') && req.method == 'POST') {
        let postData = '';
        req.on('data', (data) => {
            day = data.toString();
        });

        req.on('end', () => {
            res.statusCode = 200;
            res.end();
        });
    }

    // process POST /Pickup?day=m/d/yyyy&loc=[location number 1-6]

    else if (parsedUrl.pathname.startsWith('/Pickup') && req.method == 'POST') {

    const parsedUrl = url.parse(req.url, true);
    const params = parsedUrl.query;
    const day = params.day;
    const location = params.loc;
    
    res.setHeader('Content-Type', 'application/json');
    
    const pickupObject = JSON.parse(fs.readFileSync('OVHSPickupTime.json'));
    const dateObject = pickupObject.dates[day];
    const locationObject = dateObject[location];

    res.statusCode = 200;

    res.end(JSON.stringify(locationObject));

    return;
    }
        
    // process POST /updateSlots?day=m/d/yyyy&loc=[location number 1-6]

    else if (parsedUrl.pathname.startsWith('/updateSlots') && req.method == 'POST') {
    const parsedUrl = url.parse(req.url, true);
    const params = parsedUrl.query;
    const day = params.day;
    const location = params.loc;
    
    res.setHeader('Content-Type', 'application/json');
    
    const pickupObject = JSON.parse(fs.readFileSync('OVHSPickupTime.json'));
    const dateObject = pickupObject.dates[day];
    const locationObject = dateObject[location];

    ++locationObject.slotsTaken;

    fs.writeFileSync('OVHSPickupTime.json', JSON.stringify(pickupObject, null, 4));


    res.statusCode = 200;

    res.end();
    
    return;
    }
       
    // process POST /Sales

    else if (parsedUrl.pathname.startsWith('/Sales') && req.method == 'POST') {
    let postData = '';
    req.on('data', (data) => {
        postData += data;
    });

    req.on('end', () => {
        res.statusCode = 200;
        fs.appendFileSync('sales.csv', postData + "\n");
    });
    }

    // bad request

    else {
        res.statusCode = 404;
    }

});

server.listen(port, hostname, () => {

  console.log(`Server running at http://${hostname}:${port}/`);

});
