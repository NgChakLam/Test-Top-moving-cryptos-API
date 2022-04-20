/* Build a “Currency Exchange App”
High-level requirements:
The following list of functional requirements is prioritized. Implement as many of these points as
you can, given the time you have. Do only as much as your time allows, while we favor “quality
over quantity”.

1. Top moving cryptos API
Implement an API to list all cryptocurrencies with more than +5% or less than -5% change over the
last 24 hours.
For example: If BTC has +6%, ETH has +2% and BNB has -6%, the API should only return BTC
and BNB.
You may refer to
https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyListingsLatest.


*/
const express = require('express')
const axios = require('axios');
require('dotenv').config()
const app = express()
const port = 3000

async function  get_Crypto_Listings_Latest_from_Coin_Market_Cap(convert_currency_code='USD'){
/* API detatils: https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyListingsLatest.*/
let response = null;
  const crypto_list_json= await new Promise(async (resolve, reject) => {
      try {
        response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.X_CMC_PRO_API_KEY,
          },
          params:{
            'convert':convert_currency_code,
            //'percent_change_24h_max':-5,
           // 'percent_change_24h_min':5,
            
          },
        });
      } catch(ex) {
        response = null;
        // error
        //console.log(ex);
        reject(ex);
      }
      if (response) {
        // success
        const json = response.data;
        //console.log(json);
        const crypto_list=json.data
        resolve(json.data);
        return crypto_list;
      }
    });
  
  return crypto_list_json;
}

function fiter_Top_Moving_Crypto_List_from_Coin_Market_Cap(crypto_list,convert_currency_code='USD'){
/*
refer to:
  https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyListingsLatest
data  Array of cryptocurrency objects matching the list options.
Array[
id	                              integer       The unique CoinMarketCap ID for this cryptocurrency.
name	                            string        The name of this cryptocurrency.
symbol	                          string        The ticker symbol for this cryptocurrency.
slug                              string        The web URL friendly shorthand version of this cryptocurrency name.
cmc_rank	                        integer       The cryptocurrency's CoinMarketCap rank by market cap.
num_market_pairs	                integer       The number of active trading pairs available for this cryptocurrency across supported exchanges.
circulating_supply	              number        The approximate number of coins circulating for this cryptocurrency.
total_supply	                    number        The approximate total amount of coins in existence right now (minus any coins that have been verifiably burned).
market_cap_by_total_supply	      number        The market cap by total supply. This field is only returned if requested through the aux request parameter.
max_supply	                      number        The expected maximum limit of coins ever to be available for this cryptocurrency.
last_updated	                    string<date>  Timestamp (ISO 8601) of the last time this cryptocurrency's market data was updated.
date_added	                      string<date>  Timestamp (ISO 8601) of when this cryptocurrency was added to CoinMarketCap.
tags	                            Array of tags associated with this cryptocurrency. Currently only a mineable tag will be returned if the cryptocurrency is mineable. Additional tags will be returned in the future.
self_reported_circulating_supply  number        The self reported number of coins circulating for this cryptocurrency.
self_reported_market_cap	        number        The self reported market cap for this cryptocurrency.
platform 	                        Metadata about the parent cryptocurrency platform this cryptocurrency belongs to if it is a token, otherwise null.
quote 	                          A map of market quotes in different currency conversions. The default map included is USD.
]
*/
let result= null;
//console.log('crypto_list',crypto_list)
//crypto_list.forEach(crypto=>console.log(crypto.quote[convert_currency_code].percent_change_24h))
result=crypto_list.filter((crypto)=>{return crypto.quote[convert_currency_code].percent_change_24h >= 5 || crypto.quote[convert_currency_code].percent_change_24h<=-5});
//console.log('result')
//result.forEach(crypto=>console.log(crypto.quote[convert_currency_code].percent_change_24h))
//console.log(result)
return result;
}

app.get('/', async (req, res) => {
  let currency = req.query.currency || 'USD';
  console.log(currency);
  let crypto_list = await get_Crypto_Listings_Latest_from_Coin_Market_Cap(currency);
  //console.log(crypto_list_json);
  if (crypto_list){
    let result=null
    result=fiter_Top_Moving_Crypto_List_from_Coin_Market_Cap(crypto_list,currency);
      res.json(result);
  }else{
    res.status(404).send( "Error")
  }
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})