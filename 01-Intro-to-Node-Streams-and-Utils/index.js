import http from 'http';
import fs from 'fs/promises';
import cats from './cats.js';
import { addBreed, readBreeds } from './breedsService.js';

const server = http.createServer(async (req, res) => {

    //POST Requests
    if (req.method === 'POST' && req.url === '/cats/add-breed') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', (chunk) => {
            const formData = new URLSearchParams(body);
            const breedName = formData.get('breed');
            addBreed(breedName);
        })

        //Redirect to home page
        return res.writeHead(302, { Location: '/' }).end();
    }

    //GET Requests
    if (req.url === '/styles/site.css') {
        const cssContent = await fs.readFile('./styles/site.css', 'utf-8');

        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(cssContent);

        return res.end();
    }

    let htmlContent = '';
    res.writeHead(200, { 'content-type': 'text/html' });

    if (req.url === '/') {
        htmlContent = await renderHomePage();
    } else if (req.url === '/cats/add-breed') {
        htmlContent = await renderAddCatPage();
    } else if (req.url === '/cats/add-cat') {
        htmlContent = await fs.readFile('./views/addCat.html', 'utf-8');
    }

    res.write(htmlContent);

    res.end();
});

server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000...');
});

async function renderAddCatPage() {
    const htmlContent = await fs.readFile('./views/addCat.html', 'utf-8');

    const breedOptions = readBreeds().map(breed => `<option value="${breed.id}">${breed.name}</option>`).join('\n');
    const result = htmlContent.replace('{{breedOptions}}', breedOptions);

    return result;
}

async function renderHomePage() {
    let htmlContent = await fs.readFile('./views/home/index.html', 'utf-8');

    const catTemplate = (cat) => `
        <li>
            <img src="${cat.imageUrl}" alt="${cat.name}">
            <h3>${cat.name}</h3>
            <p><span>Breed: </span>${cat.breed}</p>
            <p><span>Description: </span>${cat.description}</p>
            <ul class="buttons">
                <li class="btn edit"><a href="">Change Info</a></li>
                <li class="btn delete"><a href="">New Home</a></li>
            </ul>
        </li>`;

    htmlContent = htmlContent.replace('{{cats}}', cats.map(cat => catTemplate(cat)).join('\n'));

    return htmlContent;
}