// googleAPI.js connects app to google API
const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyByqwFZqV6au_lAXefZJoADSuXKuPcWN4o',
    Promise: Promise
});

module.exports = googleMapsClient;