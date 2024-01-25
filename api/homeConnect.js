const { default: axios } = require("axios");
const open = require('open');

const clientId = '54B2557BFC13E82EADBEA23FAD24291B8937E461D6839FF9B3C2817B6EB5E7DF';
const clientSecret = 'B10343C22D0393B25E6DBD26E776CE9CF151CFAEBB24E2F383A8AA70DEAEB392';
const redirectURI = 'http://localhost:8080/homeConnect/callback';



const homeConnectAuth = () => {
    console.log("Home Connect");

    // const clientId = '54B2557BFC13E82EADBEA23FAD24291B8937E461D6839FF9B3C2817B6EB5E7DF';
    // const clientSecret = 'B10343C22D0393B25E6DBD26E776CE9CF151CFAEBB24E2F383A8AA70DEAEB392';
    const authEndpoint = 'https://api.home-connect.com/security/oauth/authorize';
    const scopes = 'IdentifyAppliance Monitor Control Settings'

    const queryParams = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectURI,
        scope: scopes
    })


    const authURL = `${authEndpoint}?${queryParams.toString()}`;
    // window.location.replace(authURL);
    open(authURL)
    // const response = axios.get(

    // )
}

const homeConnectToken = async (req, res) => {
    // try {
    console.log("Token", req.query)
    const { code, state } = req.query;
    // const clientId =        '54B2557BFC13E82EADBEA23FAD24291B8937E461D6839FF9B3C2817B6EB5E7DF';
    // const clientSecret =    'B10343C22D0393B25E6DBD26E776CE9CF151CFAEBB24E2F383A8AA70DEAEB392';
    // const redirectURI = 'http://localhost:8080/homeConnect/callback';
    const authEndpoint = 'https://api.home-connect.com/security/oauth/token';

    const response = await axios.post('https://api.home-connect.com/security/oauth/token', {
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        // redirect_uri: redirectURI 
    },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
    console.log("response", response.data)
    // }
    // catch(err) {
    //     console.log("ERR: Can't get token. " + err.message)
    // }
}

module.exports = {
    homeConnectAuth,
    homeConnectToken
}


// eyJ4LXJlZyI6IkVVIiwieC1lbnYiOiJQUkQiLCJjcmVmIjoiNTRCMjU1N0IiLCJ0b2tlbiI6IjE0N2FlNzBkLWU0YzQtNDVjNC04OGQ2LWU1NWFiZGJlYzEzNyIsImNsdHkiOiJwcml2YXRlIn0