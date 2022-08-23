import fs from 'fs';
import axios from 'axios';

class Busquedas {
    historial = [];
    dbPath = './db/database.json';

    constructor(){
        //TODO: leer de la base de datos, si existe
        this.leerDB();
    }
//Para el access token, uso una variable de entorno MAPBOX_KEY
    get paramsMapbox(){
        return {        
        'access_token': process.env.MAPBOX_KEY || '',
        'limit': 5,
        'language': 'es'}
    }

    get paramsWeather(){
        return{
            'appid': process.env.OPENWEATHER_KEY || '',
            'lang': 'es',
            'units': 'metric'          
        }
    }

    //BUSCAR: <CIUDAD>
    async ciudad( lugar =''){
        try {
            //peticion http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            })

            console.log('Ciudad: ', lugar);    
            const resp = await instance.get();

            return resp.data.features.map( lugar =>({
                id: lugar.id,
                lugar: lugar.place_name_es,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))
        } catch (error) {
            //si escribo throw error hago reventar la aplicacion en este caso, solo quiero devolver vacio
            return[];            
        }        
    }
    async climaporlugar( lat ='', lon=''){
        try{            
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsWeather, lat, lon}
            })
            const resp = await instance.get();
            //console.log('Lugar:::::',resp.data.weather);
            return{
                desc: resp.data.weather[0].description,
                temp: resp.data.main.temp,
                temp_min: resp.data.main.temp_min,
                temp_max: resp.data.main.temp_max
            }
        }catch (error){
            console.log(error);
        }
    }
    agregarHistorial(ciudad=''){
    //TODO: prevenir duplicidad
    //unshift agrega al inicio
        if (this.historial.includes(ciudad.toLocaleLowerCase())) return;
        //MANTENGO EL HISTORIAL DE 6 LUGARES
        this.historial = this.historial.splice(0,5);
        
        this.historial.unshift(ciudad.toLocaleLowerCase());          
        //guardar DB
        this.guardarDB();
    }
    guardarDB(){
        const payload = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){
        if (! fs.existsSync(this.dbPath)) return;
        const info = fs.readFileSync( this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);
        this.historial = data.historial;
    }
}
export default Busquedas;