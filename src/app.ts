// import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot'
import { JsonFileDB as Database } from '@builderbot/database-json'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import OpenAI from "openai";
import axios from 'axios';

import {
    GoogleGenerativeAI,
} from '@google/generative-ai';
import { GoogleAIFileManager } from "@google/generative-ai/server";

const openai = new OpenAI({
    apiKey: "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"
});

const genAI = new GoogleGenerativeAI("AIzaSyDrNY_hexwjMFYQFcUfdm7D8tq7suET7zM");
const fileManager = new GoogleAIFileManager("AIzaSyDrNY_hexwjMFYQFcUfdm7D8tq7suET7zM");

async function uploadToGemini(buffer, mimeType, fileName) {
    const uploadResult = await fileManager.uploadFile(buffer, {
        mimeType,
        displayName: fileName,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
}

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const typing = async (ctx: any, provider: any) => {
    if (provider && provider?.vendor && provider.vendor?.sendPresenceUpdate) {
        const id = ctx.key.remoteJid
        await provider.vendor.sendPresenceUpdate('composing', id)
    }
};

const PORT = process.env.PORT ?? 3008;

// Base de datos en memoria simulada para solicitudes y pagos
const memoryDB = {
    solicitudes: [],
    pagos: [],
};

// Función para obtener respuesta personalizada usando OpenAI
const getQA = async (text: string, name: string) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system", content: `TE DARE LA DESCRIPCION DE LA EMPRESA OM BUSINESS LOGISTIC, ESTARA EN INGLES, PERO DEBES RESPONDER EN EL IDIOMA QUE EL USUARIO ESCRIBA:
            
                --------------------

                Welcome to OM BUSINESS LOGISTIC your reliable partner in freight forwarding services.
With years of experience in the industry we are committed to providing efficient and costeffective solutions for all your logistics needs.
OM BUSINESS LOGISTIC is a trusted freight forwarding company that specializes in offering
comprehensive transportation and supply chain solutions across various industries.
Whether you are a small business or a multinational corporation we have the expertise and
resources to streamline your logistics operations and help you stay ahead of the competition.
Our team of highly skilled professionals understands the complexities of global trade and is
dedicated to delivering tailored solutions that meet the specific requirements of each client. We
offer a wide range of services from air and ocean freight to customs clearance and warehousing,
ensuring that your goods reach their destination in a timely and secured manner.
At OM BUSINESS LOGISTIC we pride ourselves on our extensive network of global partners
enabling us to offer door-to-door solutions to and from any destination around the world. With
our strong relationships with leading carriers, we can negotiate competitive rates for our clients
while maintaining a high level of service quality.

----------------------

OUR MISSION

To position ourselves as a major player in the global Logistics market, by
delivering customized solutions through an ambitious team committed to improve
industry standards, customer satisfaction, growth and profitability. As a people
powered organization, we recognize the families supporting the employees and
endeavor to provide all employees with motivation, fair compensation and a work
environment that encourages openness, creativity, and personal & professional
development.

-----------------------

CUSTOMER SERVICE COMISSION

We consider innovation, going beyond customers needs for their
expectations, anticipating value-added strategies to the best interest for our
customers.

--------------------


SALES MISSION

Win-win situation with a mutually beneficial working relationship designed to
provide cost efficiency, quality improvement and optimizing resources to adapt
the ever-changing market conditions and plan for the future.

-------------- 

MANAGEMENT MISSION

Developing a complete strategy and worldwide network to assist our customers
expediting their flow, accessing new markets, and customizing services, providing
supply chain management solutions with measurable results, which positively
impact service and financial performance


---------------

OCEAN FREIGHT


Our strong relationship over the years with the major liners ensures reliable, fast and efficient
delivery of your shipments. Whether you have full container loads, smaller shipments or overdimensional cargo, OM BUSINESS LOGISTIC can arrange your worldwide sea shipments in
the the capacity of a licensed forwarder.
• FCL (Full-Container-Load) Based on carrier routing options, FCL is the best time-to-cost
combination product for full container loads. FCL offers schedule flexibility, a high frequency of
sailings per port combination and high availability of equipment.
• LCL (Less-than-Container-Load) Due to our freight consolidation expertise and regular
worldwide connections from point to point, LCL provides you with reliable performance and a
lower supply chain cost.
• Oversized cargo We provide support for specialized equipment like flat rack and open-top
containers. We also offer support for specialized cargo which is not suitable for container
loading.
• Bulk & Break Bulk cargo we are dedicated to providing reliable and efficient logistics
solutions for the transportation of large quantities of goods, equipment, and materials. Our
experienced team is well-equipped to handle the complexities of managing and coordinating
the movement of Bulk and Break Bulk cargoes across various modes of transport, ensuring
smooth and timely delivery to your desired destination. , we strive to exceed your expectations
and deliver exceptional service for all your Bulk and Break Bulk cargo needs.



---------------------

AIR FREIGHT

Our air freight services deliver consistent performance across the globe and for varied cargo
types. This covers everything from small packages to large oversized cargo. Time-sensitive
cargo is treated with special care so that your business does not lose any valuable time with
shipments.
Our services include:
• Priority service For important cargo that is time sensitive we schedule your cargo for transfer
on the fastest connection available and complete the delivery within the stipulated delivery time.
• Economy service For less time-critical cargo we schedule your cargo for transfer on the most
cost effective and economic way which results in saving on the cost significantly.
• Standard service This service provides a perfect balance between shipment cost and delivery
time especially for cargoes with a medium value and transit time requirement.
• Charter services We offer part charters & full charters for specialized kinds of cargo like heavy
and oversized equipment this helps you in the movement of the cargo all over the world via Air
effortlessly.

------------------------

CUSTOMS CLEARANCE

At OM BUSINESS LOGISTIC
we specialize in providing efficient and
reliable customs clearance services for
businesses looking to import or export
goods across borders. Our team of
experienced customs clearance agents
are well-versed in the ever-changing
regulations and requirements of customs
authorities worldwide. We handle all
aspects of the customs clearance
process, ensuring that your shipments
clear customs smoothly and expediently.


----------------------

WAREHOUSING

Welcome to our warehousing service in miami! We
provide safe, reliable, and efficient storage solutions
for your valuable goods and products.
General Cargo Warehousing (Closed & Open Area)
Room Temperature Warehousing (Refreigrated)
Frozen -18°/-20° Warehousing for frozen cargo
Automotive Warehosing for Cars, Busses, Trucks etc.
Our state-of-the-art facilities are equipped to meet
your warehousing needs, offering secure storage
space, inventory management, and distribution
services. With our experienced team and advanced
technology, we ensure the utmost care and
organization for your inventory, helping you optimize
your supply chain and streamline your operations.


-----------------------------


INLAND TRANSPORTATION


Inland transportation services play a vital
role in facilitating the movement of goods
within a country or region. Utilizing various
modes of transportation such as roads,
railways these services are essential for
connecting ports and termnals with both
urban and rural areas, supporting trade and
commerce, and enhancing overall
accessibility and connectivity. With a focus
on efficiency, reliability, and safety, inland
transportation services contribute
significantly to the growth and development
of our company scope by enabling the
seamless movement of commodities from
one location to another.

-------------------------------

COURIER SERVICES

OM BUSINESS LOGISTIC is your
trusted partner for vall your shipping needs. Our
reliable and efficient courier service is designed to
meet the demands of businesses and individuals
alike, ensuring swift and secure delivery of your
packages worldwide. With our advanced tracking
systems and dedicated customer support team
merged with a worldwide contract co-operation with
one of the largest corier service provider in the world
(DHL) that supports with the most compatitve rates
worldwide, you can rest assured that your shipments
are in safe hands. Experience the convenience and
reliability of OM BUSINESS LOGISTIC Courier
Services, where your satisfaction is our top priority.
Ship with confidence, ship with OM.

-------------------------------------

OUR NETWORK

GLOBAL LOGISTICS ALLIANCE, ELITE GLOBAL LOGISTICS NETWORK AND WCA

---------------------------------------

CONTACT US

MR. OBISPO MONTERO

OverseasManager //Import & Export Supervisor

apayano@ombusinesslogistic.com

WHATSAPP: +809-902-1521

PHONE: +829-247-0977

ADDRESS: Av.george Washington 501,Plaza Malecon Center,
 Santo Domingo, D.R

 WEBSITE: http://www.ombusinesslogistic.com/

 ------------------------------------------

 RESPONDERAS EN EL IDIOMA QUE EL USUARIO TE ESCRIBA, EN LAS PROXIMAS HORAS INTEGRAREMOS EL SERVICIO DE COTIZACIONES Y SEGUIMIENTO DE CONTENEDORES, PAQUETES Y EN GENERAL ENVIOS POR ESTE MEDIO, PERO POR EL MOMENTO TE MANTENDRAS SOLO RESPONDIENDO EN BASE A LA INFORMACION DE LA EMPRESA Y CONVENCIENDO AL CLIENTE QUE NOS CONTACTE Y TRABAJE CON NOSOTROS. ENTRE NUESTROS CLIENTES PRINCIPALES ESTA: 

 Ramón Corripio
Enmanuel Corripio
Grupo CCN
Carabela
Universal Venture.

-------------------------

Menu de opciones, le presentaras al usuario el siguente menu:

A1. REALIZAR COTIZACIÓN
A2. RASTREAR CARGA

DEBES INDICARLE QUE DEBE ESCRIBIR LA OPCIÓN QUE DESEA, EJEMPLO: ESCRIBA A1 PARA COTIZAR CON NOSOTROS.

EL MENU DEBES PONERLO ORDENADO Y QUE QUEDEN LAS OPCIONES UNA DEBAJO DE LA OTRA CON ESPACIOS ENTRE LOS DEMAS TEXTOS

RESPONDE TODO EN EL IDIOMA QUE EL USUARIO ESCRIBIO, INCLUYENDO LA DESCRIPCION DEL MENU.
                ` },
            { role: "user", content: `Nombre: ${name}, Consulta: ${text}` }
        ]
    });
    return completion.choices[0].message?.content || "Lo siento, no tengo información al respecto.";
};

const conversationHistory = new Map();

const storeConversation = (number: string, message: string) => {
    if (!conversationHistory.has(number)) {
        conversationHistory.set(number, []);
    }
    conversationHistory.get(number).push(message);
};

const OMFlow = addKeyword<Provider, Database>(['hola', 'buenas', 'tardes', 'saludos', 'hey', 'que tal', 'como esta', 'ola', 'buena', 'saludo', 'klk', 'como estas', "hello", "good", "afternoon", "greetings", "hey", "what's up", "how are you", "hi", "good", "greeting", "what's up", "how are you"]).addAction(async (ctx, { flowDynamic, provider }) => {
    storeConversation(ctx.from, ctx.body);
    await typing(ctx, provider);
    const res = await getQA(ctx.body, ctx.name);
    await flowDynamic(res);
});

const cotizacionFlow = addKeyword<Provider, Database>('REALIZAR COTIZACIÓN')
    .addAnswer('Por favor, selecciona el tipo de carga ingresando el número:\n1. OCEAN FCL', { capture: true }, async (ctx, { flowDynamic, gotoFlow }) => {
        const tipoCarga = ctx.body; // Cambiamos a tipoCarga
        const sessionData = { tipoCarga };

        // Almacenar el tipo de carga en la sesión
        conversationHistory.set(ctx.from, sessionData);

        // Ir al siguiente flujo para el código del puerto de origen
        return gotoFlow(puertoOrigenFlow);
    });

const puertoOrigenFlow = addKeyword<Provider, Database>('PUERTO ORIGEN')
    .addAnswer('Por favor, ingresa el código del puerto de origen (ej: USMIA):', { capture: true }, async (ctx, { flowDynamic, gotoFlow }) => {
        const sessionData = conversationHistory.get(ctx.from);
        sessionData.origen = ctx.body;

        // Ir al siguiente flujo para el código del puerto de destino
        return gotoFlow(puertoDestinoFlow);
    });

const puertoDestinoFlow = addKeyword<Provider, Database>('PUERTO DESTINO')
    .addAnswer('Por favor, ingresa el código del puerto de destino (ej: DOHAI):', { capture: true }, async (ctx, { flowDynamic, gotoFlow }) => {
        const sessionData = conversationHistory.get(ctx.from);
        sessionData.destino = ctx.body;

        // Ir al siguiente flujo para los detalles de la carga
        return gotoFlow(detallesCargaFlow);
    });

const detallesCargaFlow = addKeyword<Provider, Database>('DETALLES CARGA')
    .addAnswer(
        'Por favor, ingresa los detalles de la carga:\n\nIngresa la cantidad de contenedores y el tipo (20 ft, 40 ft, 40 HC), siguiendo el siguiente formato: 20 ft,1 (la cantidad de contenedores luego de la coma):',
        { capture: true },
        async (ctx, { gotoFlow, flowDynamic }) => {
            const sessionData = conversationHistory.get(ctx.from);
            const tipoCarga = sessionData.tipoCarga;

            // Validar el formato correcto con una expresión regular
            const regex = /^(20 ft|40 ft|40 HC),\d+$/;

            if (!regex.test(ctx.body.trim())) {
                // Si el formato es incorrecto, enviar un mensaje y reiniciar el flujo
                await flowDynamic('⚠️ Formato incorrecto. Por favor, ingresa la información correctamente siguiendo el formato: 20 ft,1 o 40 ft,1.');
                return gotoFlow(detallesCargaFlow);
            }

            if (tipoCarga === '1') { // OCEAN FCL
                sessionData.detallesFCL = ctx.body; // Guardar detalles FCL
                return gotoFlow(cotizacionFinal);
            } else if (tipoCarga === '2') { // OCEAN LCL
                const [cantidad, peso, longitud, ancho, altura] = ctx.body.split(',').map(item => item.trim());
                sessionData.detallesLCL = { cantidad, peso, longitud, ancho, altura }; // Guardar detalles LCL
                return gotoFlow(cotizacionFinal);
            }

            console.log(sessionData);
        }
    );

const rastrearCargaFlow = addKeyword<Provider, Database>('RASTREAR CARGA')
    .addAnswer('Por favor, ingresa tu número de rastreo:', { capture: true }, async (ctx, { flowDynamic, endFlow, provider }) => {
        const numeroRastreo = ctx.body.trim();
        await typing(ctx, provider);

        if (!numeroRastreo) {
            return flowDynamic('El número de rastreo no puede estar vacío. Por favor, intenta nuevamente.');
        }

        try {
           
            const response = await axios.get(`https://0b7a-54-210-19-87.ngrok-free.app/track/${numeroRastreo.toUpperCase()}`, { timeout: 600000 });
            console.log(response)

            await flowDynamic([
                { body: 'Este es el estado de su carga', media: response.data.url }
            ]);
            return endFlow('GRACIAS POR PREFERIRNOS');
        } catch (error) {
            console.error('Error al rastrear el paquete:', error);
            return flowDynamic('Hubo un error al intentar rastrear tu paquete. Por favor, intenta más tarde.');
        }
    });



const cotizacionFinal = addKeyword<Provider, Database>('COTIZACION')
    .addAction(async (ctx, { flowDynamic, endFlow, provider }) => {
        const sessionData = conversationHistory.get(ctx.from);
        const payload = buildPayload(sessionData);
        await typing(ctx, provider);

        try {
            
            const response = await axios.post('https://0b7a-54-210-19-87.ngrok-free.app/submit-quote/', payload, {timeout: 600000});
            const rates = response.data.data;

            // Send the message and process the response
            const chatSession = model.startChat({
                generationConfig,
                history: [
                    {
                        role: "user",
                        parts: [
                            { text: `Retorname en un texto describiendo las fechas disponibles con los precios mas altos y los precios mas bajos, listalos para el usuario, no pongas ningun mensaje para mi, es directamente para el usuario, debes presentarle el precio mas alto y el precio mas bajo que se muestra en el HTML y debes convencerlo de adquirir los servcios de OM Business Logistic. Ete es el HTML: ${rates}. Debes traer todos los precios y organizarlos desde el mas bajo hasta el mas bajo, pero solo presentame las fechas en las cuales hay precios disponibles. Lista los precios y el mensaje debe iniciar diciendo: Este es el listado de precios disponibles. Quiero que  presentes todos los precios, no dejes fuera ningun precio. A todos los precios quero que le sumes un 20% en base al valor original. No le indiques al usuario que se le esta agregando un 20%, solo dale el precio final sumandole el 20% y no le muestres el precio original.` },
                        ],
                    }
                ],
            });

            const result = await chatSession.sendMessage(`Retorname en un texto describiendo las fechas disponibles con los precios mas altos y los precios mas bajos, listalos para el usuario, no pongas ningun mensaje para mi, es directamente para el usuario, debes presentarle el precio mas alto y el precio mas bajo que se muestra en el HTML y debes convencerlo de adquirir los servcios de OM Business Logistic. Ete es el HTML: ${rates}. Debes traer todos los precios y organizarlos desde el mas bajo hasta el mas bajo, pero solo presentame las fechas en las cuales hay precios disponibles. Lista los precios y el mensaje debe iniciar diciendo: Este es el listado de precios disponibles. Quiero que  presentes todos los precios, no dejes fuera ningun precio.`);

            await flowDynamic(result.response.text());
        } catch (error) {
            console.error('Error al realizar la cotización:', error);
            await flowDynamic('Hubo un error al enviar la cotización. Por favor, inténtalo de nuevo más tarde.');
        }
    })


const buildPayload = (data: any) => {
    let dataJSON = {}
    if (data.tipoCarga == '1') {
        const detallesFCL = data.detallesFCL.split(',')[0].trim();
        const numeroContenedor = detallesFCL.split(' ')[0];
        const cantidad = data.detallesFCL.split(',')[1].trim();
        return dataJSON = {
            "start_location": data.origen.toUpperCase(),
            "end_location": data.destino.toUpperCase(),
            "container_type": `${numeroContenedor}' General Purpose`,
            "container_quantity": +cantidad
        }
    }
}

const fallbackFlow = addKeyword<Provider, Database>('').addAction(async (ctx, { flowDynamic, gotoFlow, provider }) => {
    await typing(ctx, provider);

    const flows = [
        { keywords: ['hola', 'buenas', 'tardes', 'saludos', 'hey', 'que tal', 'como esta', 'ola', 'buena', 'saludo', 'klk', 'como estas'], flow: OMFlow },
        { keywords: ['A1'], flow: cotizacionFlow },
        // { keywords: ['ESTADO DE  MI SOLICITUD'], flow: consultaSolicitudFlow },
    ];

    if (ctx.body == 'A1') {
        return gotoFlow(cotizacionFlow);
    }
    if (ctx.body == 'A2') {
        return gotoFlow(rastrearCargaFlow);
    }

    const respuesta = await getQA(ctx.body, ctx.name || "Cliente");
    await flowDynamic(respuesta);
});

const main = async () => {
    const adapterFlow = createFlow([OMFlow, cotizacionFlow, puertoOrigenFlow, puertoDestinoFlow, detallesCargaFlow, fallbackFlow, cotizacionFinal, rastrearCargaFlow]);
    const adapterProvider = createProvider(Provider);
    const adapterDB = new Database({ filename: 'db.json' });

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    httpServer(+PORT);
};

main();
