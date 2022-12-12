const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const moment = require('moment')
const app = express();
require("dotenv").config();
const cors = require("cors");
const axios = require("axios");
const port = process.env.PORT

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());

app.listen(port, () => {
    console.log(`app is running at localhost:${port}`);
});
app.use(bodyParser.json())

const urls = {
    'stk': "",
    "simulate": "",
    "b2c": "",
    "base_url": ""
}
const maker = access_token()
const headers = {
    "Authorization": "Bearer " + maker
}


app.get('/', (req, res) => {
    let timestamp = moment().format('YYYYMMDDHHmmss')
    res.status(200).json({ message: "We're up and running. Happy Coding", time: timestamp.toString('base64'), token: headers })
})

app.get('/access_token', access, (req, res) => {
    res.status(200).json({ access_token: req.access_token })
})



app.get('/register', access, (req, resp) => {
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "ShortCode": "600983",
                "ResponseType": "Complete",
                "ConfirmationURL": "http://41.80.96.197/confirmation",
                "ValidationURL": "http://41.80.96.197/validation"
            }
        },
        function (error, response, body) {
            if (error) { console.log(error) }
            resp.status(200).json(body)
        }
    )
})

app.post('/confirmation', (req, res) => {
    console.log('....................... confirmation .............')
    console.log(req.body)
})

app.post('/validation', (req, resp) => {
    console.log('....................... validation .............')
    console.log(req.body)
})


app.get('/simulate', access, (req, res) => {
    let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"
    let auth = "Bearer " + req.access_token

    request(
        {
            url: url,
            method: "POST",
            headers: {
                "Authorization": auth
            },
            json: {
                "ShortCode": "600980",
                "CommandID": "CustomerPayBillOnline",
                "Amount": "5",
                "Msisdn": "254708374149",
                "BillRefNumber": "TestAPI"
            }
        },
        function (error, response, body) {
            if (error) {
                console.log(error)
            }
            else {
                res.status(200).json(body)
            }
        }
    )
})

// app.get('/balance', access, (req, resp) => {
//     let url = "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query"
//     let auth = "Bearer " + req.access_token

//     request(
//         {
//             url: url,
//             method: "POST",
//             headers: {
//                 "Authorization": auth
//             },
//             json: {
//                 "Initiator": "apitest342",
//                 "SecurityCredential": "Q9KEnwDV/V1LmUrZHNunN40AwAw30jHMfpdTACiV9j+JofwZu0G5qrcPzxul+6nocE++U6ghFEL0E/5z/JNTWZ/pD9oAxCxOik/98IYPp+elSMMO/c/370Joh2XwkYCO5Za9dytVmlapmha5JzanJrqtFX8Vez5nDBC4LEjmgwa/+5MvL+WEBzjV4I6GNeP6hz23J+H43TjTTboeyg8JluL9myaGz68dWM7dCyd5/1QY0BqEiQSQF/W6UrXbOcK9Ac65V0+1+ptQJvreQznAosCjyUjACj35e890toDeq37RFeinM3++VFJqeD5bf5mx5FoJI/Ps0MlydwEeMo/InA==",
//                 "CommandID": "AccountBalance",
//                 "PartyA": "601342",
//                 "IdentifierType": "4",
//                 "Remarks": "bal",
//                 "QueueTimeOutURL": "http://197.248.86.122:801/bal_timeout",
//                 "ResultURL": "http://197.248.86.122:801/bal_result"
//             }
//         },
//         function (error, response, body) {
//             if (error) {
//                 console.log(error)
//             }
//             else {
//                 resp.status(200).json(body)
//             }
//         }
//     )
// })

app.post("/stk", access, async (req, res) => {
    const phone = req.body.phone.substring(1)
    const amount = req.body.amount

    let datenow = new Date();
    const timestamp = datenow.getFullYear() +
        ("0" + (datenow.getMonth() + 1)).slice(-2) +
        ("0" + datenow.getDate()).slice(-2) +
        ("0" + datenow.getHours()).slice(-2) +
        ("0" + datenow.getMinutes()).slice(-2) +
        ("0" + datenow.getSeconds()).slice(-2)

        const password = new Buffer.from('4101857' + '0970c2162df32b8ee5231dc01cf41fd66d98b54c98040f96dbedf98295f75690' + timestamp).toString('base64')

    await axios.post(
        "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {

            BusinessShortCode: "4101857",
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: `254${phone}`,
            PartyB: "4101857",
            PhoneNumber: `254${phone}`,
            CallBackURL: "https://mydomain.com/pat",
            AccountReference: "4101857",
            TransactionDesc: "Donation"
        },
        {
            headers: {
                Authorization: `Bearer ${req.access_token}`,
            },
        }
    ).then((data)=> {
        console.log(data.data)
        res.status(200).json(data.data)
    }).catch((err) => {
        console.log(err.message)
        res.status(400).json(err.message)
    })
});

// app.get('/b2c', access, (req, res) => {
//     const url = 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
//         auth = 'Bearer ' + req.access_token

//     request({
//         method: "POST",
//         url: url,
//         headers: {
//             "Authorization": auth
//         },
//         json: {
//             "InitiatorName": "apitest342",
//             "SecurityCredential": "Q9KEnwDV/V1LmUrZHNunN40AwAw30jHMfpdTACiV9j+JofwZu0G5qrcPzxul+6nocE++U6ghFEL0E/5z/JNTWZ/pD9oAxCxOik/98IYPp+elSMMO/c/370Joh2XwkYCO5Za9dytVmlapmha5JzanJrqtFX8Vez5nDBC4LEjmgwa/+5MvL+WEBzjV4I6GNeP6hz23J+H43TjTTboeyg8JluL9myaGz68dWM7dCyd5/1QY0BqEiQSQF/W6UrXbOcK9Ac65V0+1+ptQJvreQznAosCjyUjACj35e890toDeq37RFeinM3++VFJqeD5bf5mx5FoJI/Ps0MlydwEeMo/InA==",
//             "CommandID": "BusinessPayment",
//             "Amount": "200",
//             "PartyA": "601342",
//             "PartyB": "254708374149",
//             "Remarks": "please pay",
//             "QueueTimeOutURL": "http://197.248.86.122:801/b2c_timeout_url",
//             "ResultURL": "http://197.248.86.122:801/b2c_result_url",
//             "Occasion": "endmonth"
//         }
//     },
//         function (error, response, body) {
//             if (error) {
//                 console.log(error)
//             }
//             else {
//                 res.status(200).json(body)
//             }
//         }
//     )
// })

// app.get('/reverse', access, (req, res) => {
//     const url = 'https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request',
//         auth = 'Bearer ' + req.access_token

//         request({
//             method: "POST",
//             url: url,
//             headers: {
//                 "Authorization": auth
//             },
//             json: {
//                 "Initiator": "apitest342",
//                 "SecurityCredential":"Q9KEnwDV/V1LmUrZHNunN40AwAw30jHMfpdTACiV9j+JofwZu0G5qrcPzxul+6nocE++U6ghFEL0E/5z/JNTWZ/pD9oAxCxOik/98IYPp+elSMMO/c/370Joh2XwkYCO5Za9dytVmlapmha5JzanJrqtFX8Vez5nDBC4LEjmgwa/+5MvL+WEBzjV4I6GNeP6hz23J+H43TjTTboeyg8JluL9myaGz68dWM7dCyd5/1QY0BqEiQSQF/W6UrXbOcK9Ac65V0+1+ptQJvreQznAosCjyUjACj35e890toDeq37RFeinM3++VFJqeD5bf5mx5FoJI/Ps0MlydwEeMo/InA==",
//                 "CommandID":"TransactionReversal",
//                 "TransactionID":"NLJ11HAY8V",
//                 "Amount":"100",
//                 "ReceiverParty":"601342",
//                 "RecieverIdentifierType":"11",
//                 "ResultURL":"http://197.248.86.122:801/reverse_result_url",
//                 "QueueTimeOutURL":"http://197.248.86.122:801/reverse_timeout_url",
//                 "Remarks":"Wrong Num",
//                 "Occasion":"sent wrongly"
//             }
//         },
//             function (error, response, body) {
//                 if (error) {
//                     console.log(error)
//                 }
//                 else {
//                     res.status(200).json(body)
//                 }
//             }
//         )
// })

// app.post('/reverse_result_url', (req, res) => {
//     console.log("--------------------Reverse Result -----------------")
//     console.log(JSON.stringify(req.body.Result.ResultParameters))
// })

// app.post('/reverse_timeout_url', (req, res) => {
//     console.log("-------------------- Reverse Timeout -----------------")
//     console.log(req.body)
// })

// app.post('/b2c_result_url', (req, res) => {
//     console.log("-------------------- B2C Result -----------------")
//     console.log(JSON.stringify(req.body.Result))
// })

// app.post('/b2c_timeout_url', (req, res) => {
//     console.log("-------------------- B2C Timeout -----------------")
//     console.log(req.body)
// })

// app.post('/stk_callback', (req, res) => {
//     console.log('.......... STK Callback ..................')
//     console.log(JSON.stringify(req.body.Body.stkCallback))
// })

// app.post('/bal_result', (req, resp) => {
//     console.log('.......... Account Balance ..................')
//     console.log(req.body)
// })

// app.post('/bal_timeout', (req, resp) => {
//     console.log('.......... Timeout..................')
//     console.log(req.body)
// })

function access(req, res, next) {
    // access token
    let url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = new Buffer.from("RMt3A4HaAveovLbjMSbZwSwaOzR0QOIY:IZaw6FA0IAMGG6AG").toString('base64');

    request(
        {
            url: url,
            headers: {
                "Authorization": "Basic " + auth
            }
        },
        (error, response, body) => {
            if (error) {
                console.log(error)
            }
            else {
                // let resp = 
                req.access_token = JSON.parse(body).access_token
                next()
            }
        }
    )
}


function access_token() {
    // access token
    let url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = new Buffer.from("RMt3A4HaAveovLbjMSbZwSwaOzR0QOIY:IZaw6FA0IAMGG6AG").toString('base64');

    request(
        {
            url: url,
            headers: {
                "Authorization": "Basic " + auth
            }
        },
        (error, response, body) => {
            if (error) {
                console.log(error)
            }
            else {
                // let resp = 
                return JSON.parse(body).access_token
            }
        }
    )
}



