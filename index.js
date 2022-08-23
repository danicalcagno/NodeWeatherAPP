import 'dotenv/config';
import Busquedas from './models/busquedas.js';
import colors from 'colors';
import { leerInput, inquirerMenu, pausa, listarLugares } from './helpers/inquirer.js';

//console.log(process.env.MAPBOX_KEY);
const main = async()=>{
    
    let opt;
    const busquedas = new Busquedas();
    
    do{
        opt = await inquirerMenu();
        
        switch (opt){
            case 1:
                //Mostrar mensaje para que escriba y buscar los lugarres que coinciden, mostrarlos 
                //y tomar la seleccion del usuario, obtener y mostrar los datos del clima
                const ciudad = await leerInput('Ingrese la ciudad: ');
                //Buscar los lugares
                const lugares = await busquedas.ciudad(ciudad);                
                //Mostrar los resultados de busqueda
                console.log('Loading...');
                const idSeleccionado = await listarLugares(lugares);
                if (idSeleccionado === '0') continue;
                const lugarSelect = lugares.find(l=>l.id===idSeleccionado);
                
                console.clear();
                console.log('\n Información del lugar buscado\n'.green);
                console.log('Ciudad:', lugarSelect.lugar.green);
                console.log('Latitud:', lugarSelect.lat);
                console.log('Longitud:', lugarSelect.lng);

                const climaLugarSel = await busquedas.climaporlugar(lugarSelect.lat, lugarSelect.lng);
                busquedas.agregarHistorial(lugarSelect.lugar);
                console.log('Descripcion dl clima:',climaLugarSel.desc.green);
                console.log('Temperatura:',climaLugarSel.temp);
                console.log('Mínima:', climaLugarSel.temp_min);
                console.log('Máxima:', climaLugarSel.temp_max);
            break
            case 2:
                busquedas.historial.forEach((lugar, i)=>{
                    const idx = `${i}`.green;
                    console.log(`${idx} ${lugar}`);
                })
            break
        }

        if( opt!==0 ) await pausa();
    } while (opt !== 0)
}

main();