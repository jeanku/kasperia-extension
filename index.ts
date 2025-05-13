import { encrypt, decrypt } from '@metamask/browser-passworder';

// let t = new Date().getTime()
// console.log("r", t)
//
// let password = "123"
//
// const passwordEncrypt = await encrypt(password, password);
// console.log("passwordEncrypt", passwordEncrypt)

// let s = 123456789n
// let res = BigInt()
// console.log(res)

import {formatBalance, hashString } from './src/utils/util'

// import Big from 'big.js';
// const bigBalance = new Big("122221200");
// const result = bigBalance.div("10000").toFixed(4)
// console.log(new Big(result))

// let balance = "9922221111221111"
// // console.log(BigInt(10 ** Number("8")))
// // let resp = BigInt(balance) / BigInt(10 ** Number("8"))
// let res = formatBalance(balance, 8)
// // let res2 = formatBalance2(balance, 8)
// console.log(res)
// console.log(res2)


// let s = stringToHex("kasplex")
// console.log(s)
// "6b6173706c6578"
import { isEqual } from 'lodash';

 




// let s = formatBalance((Number(amount) * price).toString(), 8)
// let s= Math.floor((Number(amount) + 0.3) * 100000000)
//
// let fee = BigInt(s) - p2shAmount
// let res = formatBalance(1, 8)
// console.log("res", res)

// let s = 426732943036 - 426532938036
// let fee = 5000

// let res = await hashString("123" + "kasplex")
// console.log(res)
// console.log(md5("aksdjlkasasd"))

// import de

let data = [
    {
        id: 1,
        name: "1"
    },
    {
        id: 2,
        name: "2"
    },
    {
        id: 3,
        name: "3"
    },
    {
        id: 4,
        name: "4"
    }
]

let da = data.map(r => {
    if (r.id != 1) {
        return r
    }
})
console.log("da", da.values())