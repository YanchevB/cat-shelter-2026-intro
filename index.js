import http from 'http';
import fs from 'fs/promises';
import cats from './cats.js';
import { v4 } from 'uuid';
import { addBreed, getBreedById, readBreeds, renderBreedOptions } from './breedsService.js';
import { getCatById, getCatId, editCat, deleteCat, readCats } from './catService.js';

const server = http.createServer(async (req, res) => {
    //POST Requests
    if (req.method === 'POST' && req.url === '/cats/add-breed') {
        const bodyFormData = await readBodyFormData(req); 
        
        addBreed(bodyFormData.get('breed'));

        //Redirect to home page
        return res.writeHead(302, { Location: '/' }).end();
    }

    if (req.method === 'POST' && req.url === '/cats/add-cat') {
        const bodyFormData = await readBodyFormData(req);
        const breedId = bodyFormData.get('breed');

        const newCat = {
            id: v4(),
            name: bodyFormData.get('name'),
            description: bodyFormData.get('description'),
            imageUrl: bodyFormData.get('imageUrl'),
            breed: getBreedById(breedId)
        }

        cats.push(newCat);

        return res.writeHead(302, { Location: '/'} ).end();
    }

    if (req.method === 'POST' && req.url.startsWith('/cats/edit-cat')) {
        const catId = getCatId(req);
        const editedCat = await readBodyFormData(req);
        editCat(catId, Object.fromEntries(editedCat.entries()));

        return res.writeHead(302, { Location: '/'} ).end();
    }

    if (req.method === 'POST' && req.url.startsWith('/cats/new-home')) {
        const catId = getCatId(req);
        
        deleteCat(catId);
        
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
    } else if (req.url.startsWith('/search')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const name = urlParams.get('name');

        htmlContent = await renderHomePage({ name });
    } else if (req.url === '/cats/add-breed') {
        htmlContent = await renderAddBreedPage();
    } else if (req.url === '/cats/add-cat') {
        htmlContent = await renderAddCatPage();
    } else if (req.url.startsWith('/cats/edit-cat')) {
        const catId = req.url.split('/').pop();
        htmlContent = await renderEditCatPage(catId);
    } else if (req.url.startsWith('/cats/new-home')) {
        const catId = req.url.split('/').pop();

        htmlContent = await renderShelterPage(catId);
    }

    res.write(htmlContent);

    res.end();
});


async function renderShelterPage(catId) {
    const cat = getCatById(catId);

    if (!cat) {
        return '<h1>Cat not found</h1>';
    }

    const htmlContent = await fs.readFile('./views/catShelter.html', 'utf-8');

    const result = htmlContent.replaceAll('{{name}}', cat.name)
        .replace('{{description}}', cat.description)
        .replace('{{imageUrl}}', cat.imageUrl)
        .replace('{{breedName}}', cat.breed)

    return result;
}

async function renderAddCatPage() {
    const htmlContent = await fs.readFile('./views/addCat.html', 'utf-8');
    
    const breedOptions = renderBreedOptions();
    const result = htmlContent.replace('{{breedOptions}}', breedOptions);
    
    return result;
}

async function renderAddBreedPage() {
    const htmlContent = await fs.readFile('./views/addBreed.html', 'utf-8');
    
    return htmlContent;
}

async function renderHomePage(filter = {}) {
    let htmlContent = await fs.readFile('./views/home/index.html', 'utf-8');
    
    const catTemplate = (cat) => `
    <li>
    <img src="${cat.imageUrl}" alt="${cat.name}">
    <h3>${cat.name}</h3>
    <p><span>Breed: </span>${cat.breed}</p>
    <p><span>Description: </span>${cat.description}</p>
    <ul class="buttons">
    <li class="btn edit"><a href="/cats/edit-cat/${cat.id}">Change Info</a></li>
    <li class="btn delete"><a href="/cats/new-home/${cat.id}">New Home</a></li>
    </ul>
    </li>`;

    let cat = readCats(filter);
    
    htmlContent = htmlContent.replace('{{cats}}', cat.map(c => catTemplate(c)).join('\n'))
        .replace('{{name}}', filter.name || '');
    
    return htmlContent;
}

async function renderEditCatPage(catId) {
    const cat = getCatById(catId);

    if (!cat) {
        return '<h1>Cat not found</h1>';
    }

    const htmlContent = await fs.readFile('./views/editCat.html', 'utf-8');
    const result = htmlContent.replace('{{name}}', cat.name)
        .replace('{{description}}', cat.description)
        .replace('{{imageUrl}}', cat.imageUrl)
        .replace('{{breedOptions}}', renderBreedOptions(cat.breed));
    
    return result;
}

async function readBodyFormData(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', (chunk) => {
            const formData = new URLSearchParams(body);
            resolve(formData);
        });
    });
}

server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000...');
});